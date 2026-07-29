# Church Website — Architecture Plan

> **Status:** Draft v1.0  
> **Last updated:** 2026-07-29  
> **Scope:** Greenfield build — public announcements board, admin editor, role-based resource distribution

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [File/Folder Architecture](#4-filefolder-architecture)
5. [Database Schema](#5-database-schema)
6. [API Design](#6-api-design)
7. [Authentication & Authorization Flow](#7-authentication--authorization-flow)
8. [Phased Implementation Plan](#8-phased-implementation-plan)
9. [Security Considerations](#9-security-considerations)
10. [Deployment Strategy](#10-deployment-strategy)
11. [Environment Variables](#11-environment-variables)
12. [Testing Strategy](#12-testing-strategy)

---

## 1. Executive Summary

### Project Overview

This project is a church website with three core capabilities:

| Capability | Audience | Description |
|---|---|---|
| **Public Board** | Everyone (unauthenticated) | Read-only view of announcements with images and rich text |
| **Admin Board Editor** | Authenticated admins | Create, edit, publish, and archive announcements |
| **Resource Library** | Authenticated members by role | Download/view documents gated by user role (e.g., volunteer, leader, staff) |

### Architectural Stance

The system is a **two-service monorepo** orchestrated by **Turborepo** (pnpm workspaces):

1. **SolidJS SPA** — public UI, admin UI, client-side routing, login/register forms
2. **Go REST API** — authentication, business logic, authorization, Cloudinary signed uploads

Authentication is implemented **entirely in Go** using the standard library (`net/http`, `crypto/rand`, `crypto/subtle`, cookies) plus `golang.org/x/crypto/bcrypt` for password hashing. No separate auth service and no third-party auth framework. Sessions are stored in Neon PostgreSQL and validated by Go middleware on every protected route.

### Key Non-Functional Goals

| Goal | Target |
|---|---|
| Time to first deploy | ≤ 2 weeks (through Phase 2) |
| Concurrent users | 50–200 (typical small/medium church) |
| Public board load time | LCP < 2.5s on 4G |
| Uptime | 99.5% (free-tier hosting acceptable for v1) |
| Data residency | US/EU via Neon region selection |

### Deployment Stance

| Environment | Platform | Notes |
|---|---|---|
| **Local dev** | Docker Compose + Compose Watch | All dev servers in containers; `node_modules` in Docker volumes only |
| **Production** | **Google Cloud Run** (recommended for both web + API) | Container images from Artifact Registry; avoids Render cold starts |
| **Production (alt)** | Render (frontend only) | Possible but cold starts on free tier; not recommended if UX matters |

Neon and Cloudinary remain external managed services in all environments.

### Recommended Repo Strategy

**Monorepo** (`church-page/`) with separate deployable apps, orchestrated by **Turborepo** on top of **pnpm workspaces**. Turborepo provides task pipelines (`dev`, `build`, `test`, `lint`), dependency-aware caching, and parallel execution across `apps/web` and `apps/api`. Go participates via Turborepo tasks that wrap `go` commands.

---

## 2. System Architecture

### 2.1 High-Level Diagram

```mermaid
flowchart TB
    subgraph Client["Browser"]
        SPA["SolidJS SPA<br/>(Public + Admin UI)"]
    end

    subgraph CDN["Cloudinary CDN"]
        IMG["Announcement Images"]
        FILES["Resource Files"]
    end

    subgraph Hosting["Application Hosting"]
        API["Go REST API<br/>/api/v1/*<br/>(auth + business logic)"]
    end

    subgraph Data["Neon PostgreSQL"]
        POOL["Connection Pooler<br/>(PgBouncer)"]
        DB[(PostgreSQL)]
    end

    SPA -->|"Login, CRUD, reads<br/>Cookie: session"| API
    API -->|"Sessions, users,<br/>announcements, resources"| POOL
    POOL --> DB

    SPA -->|"Direct upload<br/>(signed URL from Go)"| CDN
    API -->|"Admin: generate signed URL,<br/>store public_id"| CDN
    SPA -->|"Public: image/file URLs"| CDN
```

### 2.2 Request Flow — Public Announcement Read

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant SPA as SolidJS SPA
    participant API as Go API
    participant DB as Neon PostgreSQL
    participant CL as Cloudinary CDN

    U->>SPA: Visit /board
    SPA->>API: GET /api/v1/announcements?published=true
    Note over API: No auth required
    API->>DB: SELECT published announcements
    DB-->>API: rows + cloudinary_public_ids
    API-->>SPA: JSON (image URLs built from public_id)
    SPA->>CL: Load images (CDN URLs)
    CL-->>SPA: Image bytes
    SPA-->>U: Render board
```

### 2.3 Request Flow — Admin Creates Announcement

```mermaid
sequenceDiagram
    participant A as Admin (Browser)
    participant SPA as SolidJS SPA
    participant API as Go API
    participant DB as Neon PostgreSQL
    participant CL as Cloudinary

    A->>SPA: Login
    SPA->>API: POST /api/v1/auth/login
    API->>DB: Verify password, create session
    API-->>SPA: Set-Cookie: church_session (HttpOnly)

    A->>SPA: Create announcement + upload image
    SPA->>API: POST /api/v1/uploads/sign (cookie)
    API->>DB: Validate session + admin role
    API-->>SPA: Signed upload params
    SPA->>CL: POST upload (direct)
    CL-->>SPA: public_id, secure_url

    SPA->>API: POST /api/v1/admin/announcements (cookie)
    API->>DB: Validate session + admin role
    API->>DB: INSERT announcement
    API-->>SPA: 201 Created
```

### 2.4 Component Responsibilities

| Component | Owns | Does NOT Own |
|---|---|---|
| **SolidJS SPA** | Routing, UI state, form validation (client), login/register forms, calling Go API | Password hashing, session creation, direct DB access, unsigned Cloudinary uploads |
| **Go REST API** | Auth (register, login, logout, sessions), announcements CRUD, resources CRUD, role checks, signed upload URLs, audit logging | — |
| **Neon PostgreSQL** | Source of truth for users, sessions, roles, announcements, resources, audit | File/image bytes |
| **Cloudinary** | Image transformation, CDN delivery, raw file storage | Metadata, access control (enforced by Go + signed URLs) |

### 2.5 Authentication Approach (Go stdlib)

**Decision: Session-based auth in Go with Postgres backing store**

| Concern | Implementation |
|---|---|
| Password hashing | `golang.org/x/crypto/bcrypt` (Cost 12) |
| Session token | 32 bytes from `crypto/rand`, base64url-encoded |
| Session storage | `session` table in Neon; HttpOnly cookie |
| Token comparison | `crypto/subtle.ConstantTimeCompare` |
| Cookie flags | `HttpOnly`, `SameSite=Lax`, `Secure` in production |
| CSRF | Double-submit cookie or `SameSite=Lax` + POST-only mutations for v1 |

Go middleware reads the session cookie, loads the session + user + roles from Postgres, and attaches identity to request context. All auth and business routes live on the same origin (`/api/v1/*`), simplifying cookies and CORS.

---

## 3. Technology Stack

### 3.1 Frontend — SolidJS

| Item | Choice |
|---|---|
| Framework | SolidJS 1.x |
| Build | Vite |
| Routing | `@solidjs/router` |
| HTTP | `@solidjs/router` data APIs or thin `fetch` wrapper |
| Forms | `@modular-forms/solid` or native signals |
| Styling | Tailwind CSS (recommended for speed) |
| Rich text (admin) | TipTap or Lexical (Solid wrapper) |

**Official documentation:**
- SolidJS: https://docs.solidjs.com/
- Solid Router: https://docs.solidjs.com/solid-router/
- Vite + Solid: https://docs.solidjs.com/guides/getting-started

### 3.2 Backend — Go

| Item | Choice |
|---|---|
| Go version | 1.22+ |
| HTTP router | `chi` or `echo` (chi recommended — lightweight, idiomatic) |
| DB driver | `jackc/pgx/v5` with `pgxpool` |
| Migrations | `golang-migrate/migrate` or `goose` |
| Config | `caarlos0/env` |
| Validation | `go-playground/validator/v10` |
| Logging | `log/slog` (stdlib) |

**Official documentation:**
- Go: https://go.dev/doc/
- Effective Go: https://go.dev/doc/effective_go
- pgx: https://github.com/jackc/pgx

### 3.3 Database — Neon PostgreSQL

| Item | Choice |
|---|---|
| Provider | Neon serverless Postgres |
| Connection | **Pooled endpoint** for Go (`*.pooler.neon.tech`) |
| SSL | Required (`sslmode=require`) |
| Migrations | Applied via CI or `migrate` CLI against direct (non-pooled) endpoint for DDL |

**Neon connection pooling for Go:**

Neon provides a PgBouncer-backed pooler endpoint. Go services that maintain `pgxpool` connections **must use the pooled connection string** for runtime queries to avoid exhausting Neon's connection limits.

```
# Direct (migrations, admin DDL only)
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Pooled (Go API runtime — use this)
postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Pool settings (Go):**

```go
// Recommended starting config
config.MaxConns = 10          // low for free tier; scale with plan
config.MinConns = 2
config.MaxConnLifetime = 30 * time.Minute
config.MaxConnIdleTime = 5 * time.Minute
```

**Official documentation:**
- Neon docs: https://neon.tech/docs/introduction
- Connection pooling: https://neon.tech/docs/connect/connection-pooling
- Go guide: https://neon.tech/docs/guides/go

### 3.4 Authentication — Go (stdlib + x/crypto)

| Item | Choice |
|---|---|
| HTTP | `net/http` + `chi` router |
| Password hashing | `golang.org/x/crypto/bcrypt` |
| Session tokens | `crypto/rand` + `encoding/base64` |
| Secure compare | `crypto/subtle` |
| Session store | Custom Postgres `session` table |
| Cookie API | `net/http` `SetCookie` / `Cookie` |

**Official documentation:**
- Go `net/http`: https://pkg.go.dev/net/http
- `crypto/rand`: https://pkg.go.dev/crypto/rand
- `crypto/subtle`: https://pkg.go.dev/crypto/subtle
- `golang.org/x/crypto/bcrypt`: https://pkg.go.dev/golang.org/x/crypto/bcrypt
- OWASP Session Management: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- OWASP Password Storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

**Schema ownership:** Go migrations own all tables: `users`, `sessions`, `roles`, `user_roles`, `announcements`, `resources`. No third-party auth schema.

### 3.5 Media & Files — Cloudinary

| Use case | Cloudinary feature | Access pattern |
|---|---|---|
| Announcement images | `image` resource type | Public CDN URL (transformations via URL) |
| Resource documents | `raw` resource type | **Private** storage + signed download URLs from Go |

**Free tier limits (verify current plan):**

| Limit | Typical free tier value | Implication |
|---|---|---|
| Credits | ~25/month | Each transformation/delivery consumes credits — cache aggressively |
| Storage | ~25 GB | Sufficient for church docs + photos |
| Bandwidth | ~25 GB/month | Monitor; compress announcement images |
| Max file size | 10 MB (free) | Enforce in upload UI for resources |
| Transformations | Credit-based | Use fixed transformation presets, avoid on-the-fly abuse |

**Usage patterns:**
- Store only `public_id` and metadata in Postgres; build delivery URLs at read time
- Admin uploads via **signed upload** from browser (signature generated by Go after role check)
- Resource files: `type: private` + short-lived signed download URLs (60–300 seconds)
- Delete orphaned Cloudinary assets when DB records are deleted (async job)

**Official documentation:**
- Cloudinary docs: https://cloudinary.com/documentation
- Upload API: https://cloudinary.com/documentation/upload_images
- Signed uploads: https://cloudinary.com/documentation/upload_images#signed_uploads
- Raw files: https://cloudinary.com/documentation/file_uploads
- Transformation URLs: https://cloudinary.com/documentation/image_transformations

### 3.6 Monorepo Tooling — Turborepo

| Item | Choice |
|---|---|
| Monorepo manager | Turborepo |
| Package manager | pnpm (workspaces) |
| Task orchestration | `turbo.json` pipeline |
| Remote caching | Turborepo Remote Cache (optional; GitHub Actions integration) |

**Why Turborepo for this project:**

- **Parallel dev:** `turbo dev` runs SolidJS and Go API concurrently
- **Dependency graph:** `packages/shared-types` builds before `apps/web` automatically via `dependsOn: ["^build"]`
- **CI speed:** Cached `build` / `test` / `lint` outputs skip unchanged apps on PRs
- **Go integration:** `apps/api` uses Turborepo tasks (`go build`, `go test`) alongside JS apps in one pipeline

**Official documentation:**
- Turborepo: https://turbo.build/repo/docs
- Getting started: https://turbo.build/repo/docs/getting-started
- `turbo.json` reference: https://turbo.build/repo/docs/reference/configuration
- Remote caching: https://turbo.build/repo/docs/core-concepts/remote-caching
- Filtering: https://turbo.build/repo/docs/reference/command-line-reference/run#--filter

**Root scripts (target):**

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  }
}
```

> **Avoiding recursive loops:** Turbo only loops when it thinks you have a **single-package** repo (root `dev` calls `turbo run dev`, which calls root `dev` again). A proper **multi-package** setup — `pnpm-workspace.yaml` listing `apps/*` and `packages/*` — fixes this. You do **not** need `--filter=!./` on root scripts. See [recursive turbo invocations](https://turbo.build/docs/messages/recursive-turbo-invocations).

---

## 4. File/Folder Architecture

### 4.1 Monorepo Layout

```
church-page/
├── apps/
│   ├── web/                          # SolidJS SPA
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── routes/
│   │   │   │   │   ├── index.tsx           # Home
│   │   │   │   │   ├── board/
│   │   │   │   │   │   └── index.tsx       # Public announcements
│   │   │   │   │   ├── admin/
│   │   │   │   │   │   ├── index.tsx       # Admin dashboard
│   │   │   │   │   │   └── announcements/
│   │   │   │   │   │       ├── index.tsx   # List
│   │   │   │   │   │       ├── new.tsx
│   │   │   │   │   │       └── [id].tsx    # Edit
│   │   │   │   │   ├── resources/
│   │   │   │   │   │   └── index.tsx       # Role-filtered resources
│   │   │   │   │   └── auth/
│   │   │   │   │       ├── login.tsx
│   │   │   │   │       └── register.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── layout/
│   │   │   │   │   ├── announcements/
│   │   │   │   │   ├── resources/
│   │   │   │   │   └── ui/                 # Buttons, modals, etc.
│   │   │   │   ├── lib/
│   │   │   │   │   ├── api-client.ts       # Typed fetch to Go API (auth + business)
│   │   │   │   │   └── cloudinary-upload.ts
│   │   │   │   ├── stores/
│   │   │   │   │   └── session.ts          # Session state from GET /api/v1/auth/me
│   │   │   │   └── index.tsx
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # Go REST API (auth + business logic)
│       ├── cmd/
│       │   └── server/
│       │       └── main.go
│       ├── internal/
│       │   ├── config/
│       │   │   └── config.go
│       │   ├── middleware/
│       │   │   ├── auth.go             # Session validation
│       │   │   ├── cors.go
│       │   │   ├── ratelimit.go
│       │   │   └── requestid.go
│       │   ├── handler/
│       │   │   ├── health.go
│       │   │   ├── auth.go             # Register, login, logout, me
│       │   │   ├── announcements.go
│       │   │   ├── resources.go
│       │   │   ├── uploads.go
│       │   │   └── users.go            # Admin role management
│       │   ├── service/
│       │   │   ├── auth.go             # Password verify, session create/revoke
│       │   │   ├── announcement.go
│       │   │   ├── resource.go
│       │   │   ├── upload.go
│       │   │   └── user.go
│       │   ├── repository/
│       │   │   ├── postgres/
│       │   │   │   ├── user.go
│       │   │   │   ├── session.go
│       │   │   │   ├── announcement.go
│       │   │   │   ├── resource.go
│       │   │   │   └── user.go
│       │   │   └── cloudinary/
│       │   │       └── client.go
│       │   ├── domain/
│       │   │   ├── announcement.go
│       │   │   ├── resource.go
│       │   │   ├── user.go
│       │   │   └── errors.go
│       │   └── server/
│       │       └── router.go
│       ├── migrations/
│       │   ├── 000001_init.up.sql
│       │   ├── 000001_init.down.sql
│       │   └── ...
│       ├── go.mod
│       └── go.sum
│
├── packages/
│   └── shared-types/                 # Optional: OpenAPI-generated or hand-written TS types
│       ├── src/
│       │   └── api.ts
│       └── package.json
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.dev              # Dev: Node + pnpm + turbo (SolidJS watch)
│   │   ├── Dockerfile.api.dev          # Dev: Go + air hot reload
│   │   ├── Dockerfile.api              # Prod: multi-stage Go binary → Cloud Run
│   │   ├── Dockerfile.web              # Prod: nginx + Vite dist → Cloud Run
│   │   ├── entrypoint.sh
│   │   └── docker-compose.yml          # Local dev only (Compose Watch)
│   └── scripts/
│       ├── migrate.sh
│       └── seed-dev.sh
│
├── docs/
│   └── adr/                          # Architecture Decision Records
│       ├── 001-monorepo.md
│       ├── 002-go-session-auth.md
│       └── 003-cloudinary-private-resources.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # turbo run lint test build
│       └── deploy.yml
│
├── PLAN.md                           # This document
├── README.md
├── .env.example
├── .gitignore
├── pnpm-workspace.yaml               # Workspace packages: apps/*, packages/*
├── turbo.json                        # Task pipeline, caching, dependsOn graph
├── package.json                      # Root scripts delegate to turbo
└── pnpm-lock.yaml
```

### 4.2 Turborepo Configuration

**`pnpm-workspace.yaml`:**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**`turbo.json` (starting pipeline):**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".output/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

**Per-app `package.json` scripts** (Turborepo runs these by name across the workspace):

| App / Package | Scripts Turborepo orchestrates |
|---|---|
| `apps/web` | `dev` (Vite), `build`, `test` (Vitest), `lint`, `typecheck` |
| `apps/api` | `dev` → `go run ./cmd/server`, `build`, `test`, `lint` |
| `packages/shared-types` | `build` → `tsc`, `typecheck` |

**Go API in Turborepo:** Add a minimal `apps/api/package.json` so Turborepo can schedule Go tasks alongside JS apps:

```json
{
  "name": "@church/api",
  "private": true,
  "scripts": {
    "dev": "go run ./cmd/server",
    "build": "go build -o bin/server ./cmd/server",
    "test": "go test ./... -race -cover",
    "lint": "golangci-lint run ./..."
  }
}
```

**Common commands:**

```bash
pnpm dev                          # SolidJS + Go API in dev mode
turbo dev --filter=web            # SolidJS only
turbo dev --filter=@church/api    # Go API only
turbo build --filter=web          # Production build for web only
turbo test --filter=@church/api   # Go tests only
turbo run lint test build         # Full CI pipeline locally
```

**Remote cache (optional, Phase 4):** Enable Turborepo Remote Cache in GitHub Actions so PR builds reuse artifacts from `main`. Requires `TURBO_TOKEN` and `TURBO_TEAM` secrets.

### 4.3 Layering Rules (Go API)

```
handler  →  service  →  repository
   ↑           ↑            ↑
 HTTP        business      SQL / Cloudinary
```

- **Handlers:** Parse request, call service, map errors to HTTP status
- **Services:** Authorization checks, orchestration, domain validation
- **Repositories:** Pure data access; no HTTP concepts

### 4.4 SolidJS Organization Principles

- **Routes** own data fetching (route loaders or `createResource`)
- **Components** are presentational where possible
- **lib/api-client.ts** is the single gateway to the Go API (auth and business routes)

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ sessions : has
    users ||--o{ user_roles : has
    role ||--o{ user_roles : assigned
    role ||--o{ resource_role_access : grants
    resource ||--o{ resource_role_access : visible_to
    users ||--o{ announcement : creates
    announcement ||--o| announcement : supersedes

    users {
        uuid id PK
        text name
        text email UK
        text password_hash
        timestamptz created_at
        timestamptz updated_at
    }

    sessions {
        uuid id PK
        uuid user_id FK
        text token_hash UK
        timestamptz expires_at
        text ip_address
        text user_agent
        timestamptz created_at
    }

    role {
        uuid id PK
        text slug UK
        text name
        text description
        int sort_order
    }

    user_roles {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
        timestamptz granted_at
        uuid granted_by FK
    }

    announcement {
        uuid id PK
        text title
        text body_html
        text image_public_id
        text image_url
        boolean is_published
        timestamptz published_at
        timestamptz expires_at
        text created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    resource {
        uuid id PK
        text title
        text description
        text file_public_id
        text file_name
        bigint file_size_bytes
        text mime_type
        boolean is_active
        text uploaded_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    resource_role_access {
        uuid id PK
        uuid resource_id FK
        uuid role_id FK
    }
```

> **Note:** All tables are owned by Go migrations. Store **hashed** session tokens in the DB (`token_hash`), never the raw cookie value.

### 5.2 Core Tables (SQL)

```sql
-- Users
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    email         TEXT NOT NULL UNIQUE CHECK (char_length(email) BETWEEN 3 AND 255),
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- Sessions (store SHA-256 hash of cookie token, not plaintext)
CREATE TABLE sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Roles (seed data)
CREATE TABLE role (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,  -- 'member', 'volunteer', 'leader', 'admin'
    name        TEXT NOT NULL,
    description TEXT,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id    UUID NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    granted_by UUID REFERENCES users(id),
    UNIQUE (user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Announcements
CREATE TABLE announcement (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title            TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
    body_html        TEXT NOT NULL DEFAULT '',
    image_public_id  TEXT,
    image_url        TEXT,           -- denormalized CDN URL for fast reads
    is_published     BOOLEAN NOT NULL DEFAULT false,
    published_at     TIMESTAMPTZ,
    expires_at       TIMESTAMPTZ,     -- optional auto-hide
    created_by       UUID NOT NULL REFERENCES users(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcement_published ON announcement(is_published, published_at DESC)
    WHERE is_published = true;

-- Resources
CREATE TABLE resource (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
    description       TEXT NOT NULL DEFAULT '',
    file_public_id    TEXT NOT NULL,
    file_name         TEXT NOT NULL,
    file_size_bytes   BIGINT NOT NULL CHECK (file_size_bytes > 0),
    mime_type         TEXT NOT NULL,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    uploaded_by       UUID NOT NULL REFERENCES users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resource_role_access (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resource(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    UNIQUE (resource_id, role_id)
);

CREATE INDEX idx_resource_role_access_role ON resource_role_access(role_id);

-- Optional: audit log for admin actions
CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES users(id),
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   TEXT NOT NULL,
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.3 Seed Roles

| slug | name | Typical access |
|---|---|---|
| `member` | Member | Basic resources |
| `volunteer` | Volunteer | Volunteer docs + member |
| `leader` | Leader | Leadership materials |
| `admin` | Admin | Full admin panel + all resources |

**Rule:** Every authenticated user gets at least `member`. Admins get `admin` (which implies all permissions via hierarchy or explicit checks).

### 5.4 Role Hierarchy Strategy

**Option A — Explicit per-resource roles (chosen):** `resource_role_access` maps resources to allowed roles. Simple, flexible, no implicit inheritance.

**Option B — Role hierarchy table:** `leader` implicitly includes `volunteer` permissions. More convenient but harder to audit. Can add later via view or service-layer expansion.

---

## 6. API Design

### 6.1 Conventions

| Convention | Value |
|---|---|
| Base path | `/api/v1` |
| Format | JSON |
| Errors | `{ "error": { "code": "...", "message": "..." } }` |
| Success list | `{ "data": [...], "meta": { "total": N } }` |
| Auth | Session cookie (HttpOnly, SameSite=Lax) |
| IDs | UUID v4 for all entities |
| Pagination | `?page=1&limit=20` |
| Timestamps | ISO 8601 UTC |

### 6.2 Endpoints

#### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | None | Create account (assigns `member` role) |
| POST | `/auth/login` | None | Login; sets HttpOnly session cookie |
| POST | `/auth/logout` | Session | Revoke session, clear cookie |
| GET | `/auth/me` | Session | Current user + roles |

**POST /auth/register** body:

```json
{ "name": "Jane Doe", "email": "jane@church.org", "password": "secure-password" }
```

**POST /auth/login** body:

```json
{ "email": "jane@church.org", "password": "secure-password" }
```

**GET /auth/me** response:

```json
{
  "data": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@church.org",
    "roles": ["member"]
  }
}
```

#### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Liveness probe |
| GET | `/ready` | None | DB connectivity check |

#### Announcements (Public)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/announcements` | None | List published announcements (`?limit&page`) |
| GET | `/announcements/:id` | None | Single published announcement |

#### Announcements (Admin)

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/admin/announcements` | Session | `admin` |
| POST | `/admin/announcements` | Session | `admin` |
| PATCH | `/admin/announcements/:id` | Session | `admin` |
| DELETE | `/admin/announcements/:id` | Session | `admin` |
| POST | `/admin/announcements/:id/publish` | Session | `admin` |
| POST | `/admin/announcements/:id/unpublish` | Session | `admin` |

**POST /admin/announcements** body:

```json
{
  "title": "Sunday Service Update",
  "body_html": "<p>Join us at 10am...</p>",
  "image_public_id": "church/announcements/abc123",
  "expires_at": "2026-08-15T00:00:00Z"
}
```

#### Uploads

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/uploads/sign/image` | Session | `admin` |
| POST | `/uploads/sign/raw` | Session | `admin` |

Response:

```json
{
  "data": {
    "timestamp": 1722230400,
    "signature": "...",
    "api_key": "...",
    "folder": "church/announcements",
    "public_id": "church/announcements/uuid"
  }
}
```

#### Resources

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/resources` | Session | Any authenticated; filtered by user's roles |
| GET | `/resources/:id` | Session | Must have matching role |
| GET | `/resources/:id/download` | Session | Returns short-lived signed Cloudinary URL |

#### Resources (Admin)

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/admin/resources` | Session | `admin` |
| POST | `/admin/resources` | Session | `admin` |
| PATCH | `/admin/resources/:id` | Session | `admin` |
| DELETE | `/admin/resources/:id` | Session | `admin` |
| PUT | `/admin/resources/:id/roles` | Session | `admin` |

**PUT /admin/resources/:id/roles** body:

```json
{ "role_slugs": ["volunteer", "leader"] }
```

#### Users (Admin)

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/admin/users` | Session | `admin` |
| GET | `/admin/users/:id/roles` | Session | `admin` |
| PUT | `/admin/users/:id/roles` | Session | `admin` |

---

## 7. Authentication & Authorization Flow

### 7.1 Registration & Login

```mermaid
sequenceDiagram
    participant SPA as SolidJS
    participant API as Go API
    participant DB as Neon PostgreSQL

    SPA->>API: POST /api/v1/auth/register
    API->>DB: INSERT users, hash password (bcrypt)
    API->>DB: INSERT user_roles (member)
    API->>DB: INSERT sessions
    API-->>SPA: Set-Cookie: church_session (HttpOnly)

    SPA->>API: GET /api/v1/auth/me
    API->>DB: Validate session cookie hash
    API-->>SPA: { user, roles }
```

**Post-registration:** Go service assigns default `member` role in the same transaction as user creation.

### 7.2 Session Validation Middleware

```
1. Read cookie `church_session`
2. If missing → 401 Unauthorized (or pass through for public routes)
3. SHA-256 hash the cookie value → token_hash
4. Query:
     SELECT s.user_id, s.expires_at, u.email, u.name
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()
5. If no row → 401; clear invalid cookie
6. Load roles:
     SELECT r.slug FROM user_roles ur
     JOIN role r ON r.id = ur.role_id
     WHERE ur.user_id = $1
7. Attach UserContext { ID, Email, Name, Roles []string } to request context
```

**Login issues new session token; logout deletes session row.** Optionally rotate session ID on privilege change.

### 7.3 Authorization Helpers (Go)

```go
func RequireAuth(next http.Handler) http.Handler
func RequireRole(roles ...string) func(http.Handler) http.Handler
func HasRole(ctx context.Context, role string) bool
```

**Admin check:** `HasRole(ctx, "admin")`

**Resource access check:**

```sql
SELECT EXISTS (
  SELECT 1 FROM resource_role_access rra
  JOIN role r ON r.id = rra.role_id
  JOIN user_roles ur ON ur.role_id = r.id
  WHERE rra.resource_id = $1 AND ur.user_id = $2
)
```

### 7.4 CORS & Cookie Configuration

| Setting | Development | Production |
|---|---|---|
| Web origin | `http://localhost:5173` | `https://church.example.org` |
| API origin | `http://localhost:8080` | `https://church.example.org` (same origin via proxy) or `https://api.church.example.org` |
| Cookie name | `church_session` | `church_session` |
| Cookie domain | `localhost` (or omit) | `.church.example.org` if cross-subdomain |
| SameSite | `Lax` | `Lax` |
| Secure | false | true |

Go API must set `Access-Control-Allow-Credentials: true` and an explicit `Allow-Origin` (not `*`) when SPA and API are on different origins during local dev.

### 7.4 Recommended: Single-Origin via Reverse Proxy

```
https://church.example.org/           → Cloud Run (web — nginx static)
https://church.example.org/api/v1/    → Cloud Run (Go API)
```

Use a **Google Cloud HTTP(S) Load Balancer** with path-based routing to two Cloud Run backends for single-origin cookies. Alternative v1: `api.church.example.org` subdomain with `Cookie-Domain=.church.example.org`.

Auth and business routes share `/api/v1/*` on the Go Cloud Run service.

---

## 8. Phased Implementation Plan

### Phase 0: Project Setup & Scaffolding

**Goals:** Runnable monorepo skeleton, local dev environment, CI baseline, database connectivity.

**Tasks:**

| # | Task |
|---|---|
| 0.1 | Initialize monorepo: pnpm workspaces + Turborepo (`turbo.json`, root scripts) |
| 0.2 | Add `pnpm-workspace.yaml` (`apps/*`, `packages/*`) and root `package.json` |
| 0.3 | Scaffold SolidJS app with Vite, router, Tailwind (`apps/web`) |
| 0.4 | Scaffold Go API with chi, health endpoints, config loading, auth skeleton (`apps/api`) |
| 0.5 | Configure Turborepo pipeline: `dev`, `build`, `test`, `lint`, `typecheck` |
| 0.6 | Create Neon project; configure pooled + direct connection strings |
| 0.7 | Set up `golang-migrate` with initial migration (users, sessions, roles) |
| 0.8 | Docker Compose + Compose Watch for local dev (`web` + `api` services; no host `node_modules`) |
| 0.9 | `.env.example` with all required variables |
| 0.10 | GitHub Actions: `turbo run lint test build` on PR |
| 0.11 | README with local setup instructions |

**Acceptance criteria:**

- [ ] `docker compose watch` starts SolidJS on `:5173` and Go API on `:8080` in containers
- [ ] `turbo build` succeeds for web and api
- [ ] Go API responds `200` on `/health` and `/ready`
- [ ] Go API connects to Neon via pooler
- [ ] CI pipeline runs `turbo run lint test build` and passes

**Estimated complexity:** **Low–Medium** (2–3 days)

---

### Phase 1: Auth Foundation

**Goals:** Users can register, log in, log out; Go validates sessions; default roles assigned.

**Tasks:**

| # | Task |
|---|---|
| 1.1 | Migration: `users`, `sessions`, `role`, `user_roles` + seed roles |
| 1.2 | Go auth module: bcrypt hash, session create/revoke, token generation |
| 1.3 | Go auth handlers: register, login, logout, me |
| 1.4 | Go auth middleware: cookie parse, session lookup, role loading |
| 1.5 | SolidJS login/register pages calling Go API |
| 1.6 | Session store in SPA (`GET /auth/me` on load) |
| 1.7 | Protected route wrapper in SolidJS |
| 1.8 | Rate limit login/register endpoints |
| 1.9 | CORS config for local dev (Vite → Go) |
| 1.10 | Bootstrap script: promote first admin by email |

**Acceptance criteria:**

- [ ] User can register and log in via SPA
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] Go `/auth/me` returns 401 when unauthenticated
- [ ] Go `/auth/me` returns user + roles when authenticated
- [ ] New users receive `member` role automatically
- [ ] Bootstrap script can promote first admin

**Estimated complexity:** **Medium** (3–5 days)

---

### Phase 2: Announcements Board (Public + Admin)

**Goals:** Public read-only board; admin CRUD with image upload via Cloudinary.

**Tasks:**

| # | Task |
|---|---|
| 2.1 | Migration: `announcement` table |
| 2.2 | Go repository + service + handlers (public list/detail) |
| 2.3 | Go admin handlers (CRUD, publish/unpublish) |
| 2.4 | Cloudinary Go SDK: signed upload for images |
| 2.5 | SolidJS public `/board` page with announcement cards |
| 2.6 | SolidJS admin announcement list/create/edit pages |
| 2.7 | Image upload component (signed upload → Cloudinary → save public_id) |
| 2.8 | Rich text editor for announcement body (sanitize HTML server-side) |
| 2.9 | Publish workflow (draft vs published) |
| 2.10 | Empty state, loading skeletons, error boundaries |

**Acceptance criteria:**

- [ ] Unauthenticated users see published announcements on `/board`
- [ ] Unauthenticated users cannot access `/admin/*`
- [ ] Admin can create announcement with title, body, optional image
- [ ] Admin can publish/unpublish announcements
- [ ] Unpublished announcements invisible on public board
- [ ] Images served from Cloudinary CDN with reasonable transformations
- [ ] HTML body sanitized before storage (bluemonday or similar in Go)
- [ ] Admin-only routes return 403 for non-admin roles

**Estimated complexity:** **Medium–High** (5–7 days)

---

### Phase 3: Resource Distribution with Role-Based Access

**Goals:** Admins upload resources; authenticated users download only resources their roles allow.

**Tasks:**

| # | Task |
|---|---|
| 3.1 | Migration: `resource`, `resource_role_access` tables |
| 3.2 | Go admin resource CRUD + role assignment endpoint |
| 3.3 | Cloudinary signed upload for `raw` (private) files |
| 3.4 | Go download endpoint: verify role → generate short-lived signed URL |
| 3.5 | SolidJS `/resources` page (authenticated, role-filtered list) |
| 3.6 | SolidJS admin resource management UI |
| 3.7 | Admin user role management UI (`/admin/users`) |
| 3.8 | File type + size validation (client + server) |
| 3.9 | Delete resource: remove DB row + Cloudinary asset |
| 3.10 | Audit log for resource access (optional but recommended) |

**Acceptance criteria:**

- [ ] Admin can upload a document and assign allowed roles
- [ ] User with matching role sees resource in `/resources`
- [ ] User without matching role gets 403 on detail/download
- [ ] Download uses expiring signed URL (not permanent public link)
- [ ] Unauthenticated users redirected to login for `/resources`
- [ ] Admin can change user roles
- [ ] File size enforced (≤ 10 MB on free tier)

**Estimated complexity:** **Medium–High** (5–7 days)

---

### Phase 4: Polish, Security, Deployment

**Goals:** Production-ready deployment, hardening, monitoring, documentation.

**Tasks:**

| # | Task |
|---|---|
| 4.1 | Production Dockerfiles: `Dockerfile.web` (nginx), `Dockerfile.api` (Go binary) |
| 4.2 | Google Artifact Registry repo + push images via CI |
| 4.3 | Deploy Go API to Cloud Run (min instances 0–1; pooled Neon URL) |
| 4.4 | Deploy SolidJS static build to Cloud Run (nginx container) |
| 4.5 | Cloud Load Balancer path routing OR subdomain cookie config |
| 4.6 | Rate limiting on auth and upload endpoints |
| 4.7 | Security headers (CSP, HSTS, X-Frame-Options) |
| 4.8 | Input validation audit across all endpoints |
| 4.9 | Error handling: no stack traces in production responses |
| 4.10 | Structured logging + Cloud Logging integration |
| 4.11 | Production Neon + Cloudinary accounts configured |
| 4.12 | Database backup verification |
| 4.13 | E2E smoke tests against staging Cloud Run URLs |
| 4.14 | Admin documentation |
| 4.15 | Performance pass: image lazy loading, pagination, CDN cache headers |

**Acceptance criteria:**

- [ ] Web + API deployed to Cloud Run; images built from Dockerfiles in CI
- [ ] Load balancer or subdomain routing configured for cookies
- [ ] HTTPS everywhere; cookies marked Secure
- [ ] CSP configured without breaking Cloudinary images
- [ ] Rate limits active on `/api/v1/auth/login`, `/auth/register`, and `/uploads/sign/*`
- [ ] Staging environment mirrors production
- [ ] E2E test: login → view resources → admin post announcement
- [ ] Lighthouse performance score ≥ 85 on public board
- [ ] No secrets in client bundle or git history

**Estimated complexity:** **Medium** (4–6 days)

---

### Phase Summary Timeline

| Phase | Duration (est.) | Cumulative |
|---|---|---|
| Phase 0 | 2–3 days | Week 1 |
| Phase 1 | 3–5 days | Week 1–2 |
| Phase 2 | 5–7 days | Week 2–3 |
| Phase 3 | 5–7 days | Week 3–4 |
| Phase 4 | 4–6 days | Week 4–5 |

**Total:** ~4–5 weeks for one developer working part-time; ~2–3 weeks full-time.

---

## 9. Security Considerations

### 9.1 Authentication & Sessions

| Risk | Mitigation |
|---|---|
| Session hijacking | HttpOnly + Secure cookies, SameSite=Lax, short session TTL (7–14 days) |
| Brute force login | Rate limit auth endpoints (5 req/min/IP); optional CAPTCHA after failures |
| Weak passwords | Min 8 chars server-side; reject common passwords list in v1 |
| Session fixation | Issue new session token on login; delete old sessions |

### 9.2 Authorization

| Risk | Mitigation |
|---|---|
| IDOR on resources | Always check `resource_role_access` server-side; never trust client role claims |
| Privilege escalation | Role changes require `admin`; audit log all role grants |
| Admin route exposure | Middleware enforces `admin` on all `/admin/*` handlers |

### 9.3 Input Validation & XSS

| Risk | Mitigation |
|---|---|
| Stored XSS in announcements | Sanitize HTML server-side with allowlist (bluemonday: `p, br, strong, em, ul, ol, li, a[href]`) |
| SQL injection | Parameterized queries only (pgx); no string concatenation |
| File upload abuse | Validate MIME type + extension; size limits; Cloudinary unsigned uploads disabled |
| Path traversal | Cloudinary public_ids generated server-side, not user-supplied paths |

### 9.4 API Security

| Risk | Mitigation |
|---|---|
| CSRF | SameSite cookies + require custom header (`X-Requested-With`) for mutating requests |
| CORS misconfiguration | Explicit allowlist of origins; never `*` with credentials |
| Rate limiting | 100 req/min general; 10 req/min uploads; 5 req/min auth |
| Information leakage | Generic 404/403 messages; detailed errors in logs only |

### 9.5 Secrets Management

- All secrets in environment variables (never committed)
- Cloudinary API secret **only in Go API** (never in SPA)
- Rotate secrets if exposed
- Separate Cloudinary folders per environment (`church-dev/`, `church-prod/`)

### 9.6 Dependency & Supply Chain

- Dependabot/Renovate for npm and Go modules
- Pin Go module versions in `go.sum`
- CI runs `govulncheck` and `npm audit`

---

## 10. Deployment Strategy

### 10.0 Local Development — Docker Only

**All dev servers run in Docker.** Do not install `node_modules` on the host.

```bash
# Build dev images
docker compose -f infra/docker/docker-compose.yml build

# Start with file watch (syncs source into containers)
docker compose -f infra/docker/docker-compose.yml watch
# or: bash scripts/dev-docker.sh
```

| Compose service | Container | Host port | Dev command |
|---|---|---|---|
| `web` | Node 22 + pnpm + turbo | `5173` | Vite dev server (`turbo dev --filter=web`) |
| `api` | Go 1.22 + air (optional) | `8080` | `go run ./cmd/server` with volume mount |

**Volume strategy:** bind-mount source code; named volume `church_node_modules` masks host `node_modules`.

**Docs:**
- Docker Compose Watch: https://docs.docker.com/compose/how-tos/file-watch/
- Compose file: `infra/docker/docker-compose.yml`

Production deploys use **separate production Dockerfiles** — not the dev compose stack.

### 10.1 Production Hosting Matrix

| Component | Recommended | Alternative | Notes |
|---|---|---|---|
| **SolidJS SPA** | **Google Cloud Run** (nginx image) | Render Static Sites | Render free tier has cold starts; Cloud Run gives one platform for both services |
| **Go API** | **Google Cloud Run** | Render Web Service | Same project, same CI pipeline, scale-to-zero or min-instances=1 |
| **Container registry** | Google Artifact Registry | — | Stores `church-web` and `church-api` images |
| **Neon PostgreSQL** | Neon (managed) | — | Use **pooler** endpoint from Cloud Run |
| **Cloudinary** | Cloudinary (managed) | — | Free tier sufficient for v1 |
| **Routing** | Cloud HTTP(S) Load Balancer | Subdomain (`api.` + `www.`) | Load balancer preferred for single-origin session cookies |

**Why Cloud Run over Render for this project:**
- One deployment model (Docker → Cloud Run) for frontend and backend
- Avoid Render free-tier cold starts on the SPA
- Cloud Run cold starts manageable with `min-instances: 1` on API if needed
- Artifact Registry + `gcloud run deploy` fits container-first workflow

**Official documentation:**
- Cloud Run: https://cloud.google.com/run/docs
- Deploy containers: https://cloud.google.com/run/docs/deploying
- Cloud Run + Load Balancer: https://cloud.google.com/load-balancing/docs/https/setup-global-ext-https-serverless
- Artifact Registry: https://cloud.google.com/artifact-registry/docs

### 10.2 Production Topology (Cloud Run)

**Recommended — single origin via Load Balancer:**

```
                    ┌─────────────────────────────────────┐
                    │  Cloud HTTP(S) Load Balancer        │
                    │  church.example.org                 │
                    └──────────────┬──────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │                                         │
              ▼                                         ▼
   /*  →  Cloud Run `church-web`          /api/v1/*  →  Cloud Run `church-api`
          (nginx + Vite dist)                          (Go binary)
              │                                         │
              └────────────────┬────────────────────────┘
                               ▼
                         Neon PostgreSQL
                         Cloudinary CDN
```

**Simpler v1 — subdomains (no load balancer):**

```
https://church.example.org      → Cloud Run `church-web`
https://api.church.example.org  → Cloud Run `church-api`
```

Set `SESSION_COOKIE_DOMAIN=.church.example.org` and `CORS_ORIGINS=https://church.example.org`.

### 10.3 Production Docker Images

| Image | Dockerfile | Base | Output |
|---|---|---|---|
| `church-web` | `infra/docker/Dockerfile.web` | `nginx:alpine` | `apps/web/dist` static files |
| `church-api` | `infra/docker/Dockerfile.api` | `golang:1.22` → `distroless` | Single Go binary on `$PORT` |

Cloud Run sets `PORT` (default `8080`). Go API listens on `0.0.0.0:$PORT`. Nginx listens on `$PORT` via envsubst template.

**Build locally (sanity check):**

```bash
docker build -f infra/docker/Dockerfile.api -t church-api .
docker build -f infra/docker/Dockerfile.web -t church-web .
```

### 10.4 CI/CD Pipeline

```mermaid
flowchart LR
    PR[Pull Request] --> CI[GitHub Actions]
    CI --> Turbo["turbo run lint test build"]
    Turbo --> Merge[Merge to main]
    Merge --> Deploy[Deploy workflow]
    Deploy --> Build["docker build web + api"]
    Build --> GAR[Push to Artifact Registry]
    GAR --> RunWeb["gcloud run deploy church-web"]
    GAR --> RunAPI["gcloud run deploy church-api"]
    Deploy --> Migrate[Run DB migrations]
```

**Deploy example (API):**

```bash
docker build -f infra/docker/Dockerfile.api -t REGION-docker.pkg.dev/PROJECT/church/api:latest .
docker push REGION-docker.pkg.dev/PROJECT/church/api:latest
gcloud run deploy church-api \
  --image REGION-docker.pkg.dev/PROJECT/church/api:latest \
  --region us-central1 \
  --set-env-vars DATABASE_URL=...,CORS_ORIGINS=... \
  --allow-unauthenticated
```

**CI example (`.github/workflows/ci.yml`):**

```yaml
- uses: pnpm/action-setup@v4
- run: pnpm install --frozen-lockfile
- run: turbo run lint test build
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

**Migration strategy:** Run migrations as a CI step **before** deploying new API revision (backward-compatible migrations only).

### 10.5 Environment Separation

| Environment | Neon branch | Cloudinary folder | Purpose |
|---|---|---|---|
| `development` | dev branch | `church-dev/` | Local + preview |
| `staging` | staging branch | `church-staging/` | Cloud Run staging services |
| `production` | main branch | `church-prod/` | Cloud Run production services |

Neon supports database branching — ideal for preview/staging isolation.

### 10.6 Monitoring & Observability (v1 minimum)

| Tool | Purpose | Cost |
|---|---|---|
| Google Cloud Logging | Cloud Run stdout/stderr | Free tier allowance |
| Google Cloud Monitoring | Cloud Run metrics, uptime | Free tier |
| Neon dashboard | Connection count, query latency | Free |
| Cloudinary dashboard | Storage, bandwidth, credits | Free |
| UptimeRobot or Better Stack | External uptime checks | Free tier |

---

## 11. Environment Variables

### 11.1 SolidJS (`apps/web/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `/api/v1` or `http://localhost:8080/api/v1` | Go API base URL (includes auth routes) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | `my-church` | For building image URLs client-side |
| `VITE_APP_NAME` | No | `Grace Church` | Display name |

> **Never** put Cloudinary API secret, session secrets, or Neon credentials in `VITE_*` variables.

### 11.2 Go API (`apps/api/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://...@ep-xxx-pooler.neon.tech/neondb?sslmode=require` | **Pooled** Neon URL |
| `DATABASE_MIGRATE_URL` | Yes | `postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require` | Direct URL for migrations |
| `PORT` | No | `8080` | Server port |
| `ENV` | No | `development` | `development` / `staging` / `production` |
| `CORS_ORIGINS` | Yes | `http://localhost:5173` | Allowed origins |
| `SESSION_COOKIE_NAME` | No | `church_session` | HttpOnly session cookie name |
| `SESSION_TTL_HOURS` | No | `168` | Session lifetime (7 days) |
| `BCRYPT_COST` | No | `12` | bcrypt work factor |
| `CLOUDINARY_CLOUD_NAME` | Yes | `my-church` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | `123456789012345` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | `(secret)` | For signing uploads/downloads |
| `CLOUDINARY_FOLDER` | No | `church-prod` | Root folder prefix |
| `SIGNED_URL_TTL_SECONDS` | No | `300` | Resource download URL lifetime |
| `RATE_LIMIT_RPM` | No | `100` | Requests per minute per IP |

### 11.4 CI/CD Secrets (GitHub Actions)

| Secret | Used by |
|---|---|
| `NEON_DATABASE_URL` | Migrations |
| `GCP_PROJECT_ID` | Cloud Run deploy |
| `GCP_SA_KEY` or Workload Identity | Cloud Run deploy |
| `ARTIFACT_REGISTRY` | Docker push |
| `CLOUDINARY_*` | Staging/prod API deploy |
| `TURBO_TOKEN` | Turborepo remote cache (optional) |
| `TURBO_TEAM` | Turborepo team slug (optional) |

### 11.5 Example `.env.example` (root)

```bash
# === Neon PostgreSQL ===
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
DATABASE_MIGRATE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# === Go API ===
PORT=8080
ENV=development
CORS_ORIGINS=http://localhost:5173
SESSION_COOKIE_NAME=church_session
SESSION_TTL_HOURS=168
BCRYPT_COST=12

# === Cloudinary ===
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=church-dev

# === SolidJS (prefix VITE_) ===
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_APP_NAME=Grace Church
```

---

## 12. Testing Strategy

### 12.1 Testing Pyramid

```
        ┌─────────┐
        │   E2E   │  ← Few, critical paths (Playwright)
       ┌┴─────────┴┐
       │ Integration│  ← API + DB (testcontainers or Neon branch)
      ┌┴───────────┴┐
      │  Unit Tests  │  ← Services, utils, components
      └──────────────┘
```

### 12.2 Unit Tests

| Area | Tool | Coverage target |
|---|---|---|
| Go services | `testing` + `testify` | 80%+ on service layer |
| Go handlers | `net/http/httptest` | Happy path + auth failures |
| SolidJS components | Vitest + `@solidjs/testing-library` | Key UI components |
| Auth hooks | Vitest | Role assignment on signup |

**Go example targets:**
- `service/announcement_test.go` — publish/unpublish logic
- `service/resource_test.go` — role access checks
- `middleware/auth_test.go` — session validation edge cases

### 12.3 Integration Tests

| Suite | Scope | Setup |
|---|---|---|
| API integration | Go handlers → real Postgres | Neon dev branch or testcontainers Postgres |
| Auth integration | Go register/login → `/auth/me` | Shared test DB, cleanup between tests |
| Cloudinary | Mock Cloudinary SDK in tests | Interface-based client; real calls in staging only |

**Run against Neon branch:** Create ephemeral branch per CI run for isolation (Neon branching API).

### 12.4 End-to-End Tests

**Tool:** Playwright

| Test | Flow |
|---|---|
| Public board | Visit `/board` → see published announcement |
| Auth flow | Register → login → see `/resources` (empty or member resources) |
| Admin announcement | Admin login → create + publish → visible on public board |
| Role gating | User without role cannot download restricted resource |
| Admin resource | Admin upload → assign role → member sees it |

**Environment:** Staging with seeded test users (`admin@test.church`, `member@test.church`).

### 12.5 Security Testing

| Check | Method |
|---|---|
| IDOR | Integration tests attempting cross-user resource access |
| XSS | Submit `<script>alert(1)</script>` in body → assert sanitized |
| Auth bypass | Call admin endpoints without cookie → 401 |
| Rate limits | Burst requests → 429 |

### 12.6 CI Test Commands

```bash
# Root (Turborepo orchestrates dependency order + caching)
turbo test                      # All unit tests (web, auth, api)
turbo test --filter=web         # Vitest only
turbo test --filter=@church/api # Go tests only
turbo lint                      # ESLint + golangci-lint

# E2E (staging; typically not cached by Turbo)
pnpm exec playwright test
```

### 12.7 Manual QA Checklist (Pre-Release)

- [ ] Register new user → receives member role
- [ ] Admin promotes user → role change reflected immediately
- [ ] Published announcement appears within 30 seconds (no stale cache)
- [ ] Image upload fails gracefully above size limit
- [ ] Logout invalidates session server-side
- [ ] Mobile responsive layout on board and admin pages
- [ ] Keyboard navigation works on primary flows (accessibility spot check)

---

## Appendix A: Architecture Decision Records (To Create)

| ADR | Title | Decision |
|---|---|---|
| ADR-001 | Monorepo structure | Single repo with `apps/` and `packages/`, orchestrated by Turborepo + pnpm workspaces |
| ADR-002 | Go session auth | bcrypt + Postgres sessions + HttpOnly cookies; no third-party auth framework |
| ADR-003 | Cloudinary private resources | Raw files private; signed download URLs from Go |
| ADR-004 | Production on Cloud Run | Both web (nginx) and API (Go) as Cloud Run services; Docker images in Artifact Registry |
| ADR-005 | Explicit resource-role mapping | No implicit role hierarchy in v1 |

---

## Appendix B: Future Enhancements (Out of Scope v1)

| Feature | Notes |
|---|---|
| OAuth (Google) | Add in Phase 4+ with Go OAuth2 (`golang.org/x/oauth2`) |
| Email notifications | New announcement alerts via Resend/SendGrid |
| Full-text search | Postgres `tsvector` on announcements |
| Calendar/events | Separate module |
| Multi-church tenancy | Would require org_id on all tables |
| Mobile app | API tokens / refresh tokens in Go |
| CMS-style page builder | Significant scope increase |
| i18n | SolidJS i18n library + translated content columns |

---

## Appendix C: Glossary

| Term | Definition |
|---|---|
| **Board** | Public announcements page |
| **Resource** | Downloadable file gated by role |
| **Role** | Permission group (member, volunteer, leader, admin) |
| **Session** | Opaque token in HttpOnly cookie; hash stored in Postgres |
| **Signed URL** | Time-limited Cloudinary URL requiring signature |
| **Pooler** | Neon PgBouncer endpoint for connection pooling |
| **Turborepo** | Monorepo task runner; orchestrates `dev`, `build`, `test`, `lint` with caching across workspace packages |

---

*End of architecture plan.*
