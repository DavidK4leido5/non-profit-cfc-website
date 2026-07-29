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

The system is a **three-service monorepo** orchestrated by **Turborepo** (pnpm workspaces):

1. **SolidJS SPA** — public UI, admin UI, client-side routing
2. **Go REST API** — business logic, authorization enforcement, Cloudinary signed uploads
3. **Better Auth service (Node/TS)** — authentication only; shares the Neon database

Better Auth is JavaScript-native and does not ship a Go SDK. Rather than reimplementing auth in Go, we run Better Auth as a **dedicated auth microservice** that owns login, registration, sessions, and password flows. The Go API **validates sessions against the shared PostgreSQL session table** (same database Better Auth writes to). This avoids duplicating auth logic while keeping business rules in Go.

### Key Non-Functional Goals

| Goal | Target |
|---|---|
| Time to first deploy | ≤ 2 weeks (through Phase 2) |
| Concurrent users | 50–200 (typical small/medium church) |
| Public board load time | LCP < 2.5s on 4G |
| Uptime | 99.5% (free-tier hosting acceptable for v1) |
| Data residency | US/EU via Neon region selection |

### Recommended Repo Strategy

**Monorepo** (`church-page/`) with separate deployable apps, orchestrated by **Turborepo** on top of **pnpm workspaces**. Turborepo provides task pipelines (`dev`, `build`, `test`, `lint`), dependency-aware caching, and parallel execution across `apps/web`, `apps/auth`, and shared packages. Go (`apps/api`) participates via Turborepo tasks that wrap `go` commands. Split repos only if multiple teams own auth vs. API independently (unlikely here).

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
        AUTH["Auth Service<br/>Better Auth (Node/Bun)<br/>/api/auth/*"]
        API["Go REST API<br/>/api/v1/*"]
    end

    subgraph Data["Neon PostgreSQL"]
        POOL["Connection Pooler<br/>(PgBouncer)"]
        DB[(PostgreSQL)]
    end

    SPA -->|"Login / Register / OAuth"| AUTH
    SPA -->|"CRUD + reads<br/>Cookie: session"| API
    AUTH -->|"Read/Write sessions,<br/>users, accounts"| POOL
    API -->|"Validate session,<br/>business data"| POOL
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
    participant AUTH as Better Auth
    participant API as Go API
    participant DB as Neon PostgreSQL
    participant CL as Cloudinary

    A->>SPA: Login
    SPA->>AUTH: POST /api/auth/sign-in/email
    AUTH->>DB: Create session
    AUTH-->>SPA: Set-Cookie: session_token

    A->>SPA: Create announcement + upload image
    SPA->>API: POST /api/v1/uploads/sign (cookie)
    API->>DB: Validate session + admin role
    API-->>SPA: Signed upload params
    SPA->>CL: POST upload (direct)
    CL-->>SPA: public_id, secure_url

    SPA->>API: POST /api/v1/announcements (cookie)
    API->>DB: Validate session + admin role
    API->>DB: INSERT announcement
    API-->>SPA: 201 Created
```

### 2.4 Component Responsibilities

| Component | Owns | Does NOT Own |
|---|---|---|
| **SolidJS SPA** | Routing, UI state, form validation (client), optimistic UI, calling APIs | Business authorization, direct DB access, unsigned Cloudinary uploads |
| **Better Auth service** | Sign-up, sign-in, sign-out, password reset, OAuth, session creation/deletion, email verification hooks | Announcements, resources, role assignment (except reading user record) |
| **Go REST API** | Announcements CRUD, resources CRUD, role checks, signed upload URLs, audit logging | Password hashing, OAuth token exchange |
| **Neon PostgreSQL** | Source of truth for users, sessions, roles, announcements, resources, audit | File/image bytes |
| **Cloudinary** | Image transformation, CDN delivery, raw file storage | Metadata, access control (enforced by Go + signed URLs) |

### 2.5 Integration Pattern: Better Auth + Go

**Decision: Shared-database session validation (recommended for v1)**

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| **Shared DB session lookup** | Simple, no extra network hop, Better Auth stays canonical | Go must track Better Auth schema changes | ✅ **Chosen** |
| JWT plugin + Go JWT validation | Stateless validation, fast | Token revocation harder, plugin config overhead | Fallback for mobile/API clients later |
| Go calls Auth service per request | Loose coupling | Latency, auth service becomes SPOF on every request | Overkill for v1 |
| Reimplement auth in Go | Full control in one language | Duplicates Better Auth features, security risk | ❌ Rejected |

Go middleware reads the `session` cookie, queries the `session` table (Better Auth schema), joins `user`, loads role from `user_roles`, and attaches identity to request context.

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

### 3.4 Authentication — Better Auth

Better Auth is a TypeScript authentication library/framework. It is **not** a Go library. Integration strategy:

| Layer | Technology | Role |
|---|---|---|
| Auth service | Node 20+ or Bun, Hono/Fastify | Hosts Better Auth handler at `/api/auth/*` |
| Session storage | Neon PostgreSQL (Better Auth adapter) | Shared with Go |
| Session validation | Go middleware | Reads `session` + `user` tables |
| Client | Better Auth client (`better-auth/solid` or `better-auth/client`) | Login UI, session state in SPA |

**Official documentation:**
- Better Auth: https://www.better-auth.com/docs
- Installation: https://www.better-auth.com/docs/installation
- PostgreSQL adapter: https://www.better-auth.com/docs/adapters/postgresql
- Session management: https://www.better-auth.com/docs/concepts/session-management
- Solid integration: https://www.better-auth.com/docs/integrations/solid (check latest; may use generic client)

**Schema ownership:** Better Auth auto-creates `user`, `session`, `account`, `verification` tables. App migrations add `roles`, `user_roles`, `announcements`, `resources` — never alter Better Auth core columns without checking compatibility.

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

- **Parallel dev:** `turbo dev` runs SolidJS and the auth service concurrently with correct startup order
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
│   │   │   │   │   ├── api-client.ts       # Typed fetch to Go API
│   │   │   │   │   ├── auth-client.ts      # Better Auth client
│   │   │   │   │   └── cloudinary-upload.ts
│   │   │   │   ├── stores/
│   │   │   │   │   └── session.ts          # Auth session signals
│   │   │   │   └── index.tsx
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── auth/                         # Better Auth service (Node/Bun)
│   │   ├── src/
│   │   │   ├── index.ts              # Hono/Fastify server
│   │   │   ├── auth.ts               # betterAuth({ ... }) config
│   │   │   └── db.ts                 # Postgres pool for Better Auth
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                          # Go REST API
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
│       │   │   ├── announcements.go
│       │   │   ├── resources.go
│       │   │   ├── uploads.go
│       │   │   └── users.go            # Admin role management
│       │   ├── service/
│       │   │   ├── announcement.go
│       │   │   ├── resource.go
│       │   │   ├── upload.go
│       │   │   └── auth.go             # Session lookup logic
│       │   ├── repository/
│       │   │   ├── postgres/
│       │   │   │   ├── announcement.go
│       │   │   │   ├── resource.go
│       │   │   │   ├── session.go
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
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.auth
│   │   └── docker-compose.yml        # Local dev: api + auth + optional local postgres
│   └── scripts/
│       ├── migrate.sh
│       └── seed-dev.sh
│
├── docs/
│   └── adr/                          # Architecture Decision Records
│       ├── 001-monorepo.md
│       ├── 002-better-auth-sidecar.md
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
| `apps/auth` | `dev` (Hono/Bun), `build`, `test`, `lint`, `typecheck` |
| `apps/api` | `build` → `go build ./...`, `test` → `go test ./...`, `lint` → `golangci-lint run` |
| `packages/shared-types` | `build` → `tsc`, `typecheck` |

**Go API in Turborepo:** Add a minimal `apps/api/package.json` so Turborepo can schedule Go tasks alongside JS apps:

```json
{
  "name": "@church/api",
  "private": true,
  "scripts": {
    "build": "go build -o bin/server ./cmd/server",
    "test": "go test ./... -race -cover",
    "lint": "golangci-lint run ./..."
  }
}
```

**Common commands:**

```bash
pnpm dev                          # All apps in dev mode (web + auth + optional api)
turbo dev --filter=web            # SolidJS only
turbo dev --filter=web --filter=auth
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
- **lib/api-client.ts** is the single gateway to Go API
- **lib/auth-client.ts** is the single gateway to Better Auth (never mix auth calls into api-client)

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```mermaid
erDiagram
    user ||--o{ session : has
    user ||--o{ account : has
    user ||--o{ user_roles : has
    role ||--o{ user_roles : assigned
    role ||--o{ resource_role_access : grants
    resource ||--o{ resource_role_access : visible_to
    user ||--o{ announcement : creates
    announcement ||--o| announcement : supersedes

    user {
        text id PK
        text name
        text email UK
        boolean email_verified
        text image
        timestamptz created_at
        timestamptz updated_at
    }

    session {
        text id PK
        text user_id FK
        text token UK
        timestamptz expires_at
        text ip_address
        text user_agent
        timestamptz created_at
        timestamptz updated_at
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
        text user_id FK
        uuid role_id FK
        timestamptz granted_at
        text granted_by FK
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

> **Note:** `user` and `session` tables follow Better Auth's schema. Run Better Auth migrations first, then app migrations. Column names must match Better Auth's PostgreSQL adapter expectations.

### 5.2 App-Owned Tables (SQL)

```sql
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
    user_id    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    role_id    UUID NOT NULL REFERENCES role(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    granted_by TEXT REFERENCES "user"(id),
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
    created_by       TEXT NOT NULL REFERENCES "user"(id),
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
    uploaded_by       TEXT NOT NULL REFERENCES "user"(id),
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
    actor_id    TEXT REFERENCES "user"(id),
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
| IDs | UUID v4 for app entities; Better Auth uses text IDs for users |
| Pagination | `?page=1&limit=20` |
| Timestamps | ISO 8601 UTC |

### 6.2 Endpoints

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

#### Auth (Better Auth service — not Go)

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/sign-up/email` | Register |
| POST | `/api/auth/sign-in/email` | Login |
| POST | `/api/auth/sign-out` | Logout |
| GET | `/api/auth/get-session` | Current session |

---

## 7. Authentication & Authorization Flow

### 7.1 Registration & Login

```mermaid
sequenceDiagram
    participant SPA as SolidJS
    participant AUTH as Better Auth (Node)
    participant DB as Neon PostgreSQL

    SPA->>AUTH: signUp / signIn
    AUTH->>DB: Insert/update user, create session
    AUTH-->>SPA: Set-Cookie: better-auth.session_token (HttpOnly)
    SPA->>AUTH: getSession()
    AUTH-->>SPA: { user: { id, email, name } }
```

**Post-registration hook (Better Auth):** Assign default `member` role in `user_roles` via Better Auth `databaseHooks.user.create.after` callback.

### 7.2 Go Session Validation Middleware

```
1. Read cookie `better-auth.session_token` (exact name from Better Auth config)
2. If missing → 401 Unauthorized (or pass through for public routes)
3. Query:
     SELECT s.user_id, s.expires_at, u.email, u.name
     FROM session s
     JOIN "user" u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > now()
4. If no row → 401
5. Load roles:
     SELECT r.slug FROM user_roles ur
     JOIN role r ON r.id = ur.role_id
     WHERE ur.user_id = $1
6. Attach UserContext { ID, Email, Name, Roles []string } to request context
```

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
| API origin | `http://localhost:8080` | `https://api.church.example.org` |
| Auth origin | `http://localhost:3001` | `https://auth.church.example.org` |
| Cookie domain | `localhost` (or omit) | `.church.example.org` (shared parent) |
| SameSite | `Lax` | `Lax` |
| Secure | false | true |

**Critical:** For cross-subdomain cookies, set Better Auth `advanced.cookiePrefix` and shared `domain: ".church.example.org"`. Go API must accept credentials (`Access-Control-Allow-Credentials: true`).

### 7.5 Alternative: Reverse Proxy Unified Origin

To simplify cookies in v1, put all services behind one origin via reverse proxy:

```
https://church.example.org/           → SolidJS static
https://church.example.org/api/auth/  → Auth service
https://church.example.org/api/v1/    → Go API
```

This avoids cross-origin cookie issues entirely. **Recommended for production v1.**

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
| 0.4 | Scaffold Go API with chi, health endpoints, config loading (`apps/api` + minimal `package.json` for Turbo) |
| 0.5 | Scaffold Better Auth service with Hono + Neon adapter (`apps/auth`) |
| 0.6 | Configure Turborepo pipeline: `dev`, `build`, `test`, `lint`, `typecheck` with `dependsOn: ["^build"]` |
| 0.7 | Create Neon project; configure pooled + direct connection strings |
| 0.8 | Set up `golang-migrate` with initial empty migration |
| 0.9 | Docker Compose for local dev (api + auth; Neon cloud for DB) |
| 0.10 | `.env.example` with all required variables |
| 0.11 | GitHub Actions: `turbo run lint test build` on PR |
| 0.12 | README with local setup instructions (`pnpm install`, `pnpm dev`) |

**Acceptance criteria:**

- [ ] `pnpm dev` (via Turborepo) starts SolidJS on `:5173` and auth service concurrently
- [ ] `turbo build` succeeds for all workspace packages
- [ ] `turbo test` runs Go and JS tests in dependency order
- [ ] Go API responds `200` on `/health`
- [ ] Auth service responds on `/api/auth/ok` or Better Auth health
- [ ] Go API connects to Neon via pooler (`/ready` returns OK)
- [ ] CI pipeline runs `turbo run lint test build` and passes on empty commit

**Estimated complexity:** **Low–Medium** (2–3 days)

---

### Phase 1: Auth Foundation

**Goals:** Users can register, log in, log out; Go validates sessions; default roles assigned.

**Tasks:**

| # | Task |
|---|---|
| 1.1 | Configure Better Auth (email/password, session config, PostgreSQL adapter) |
| 1.2 | Run Better Auth schema migration against Neon |
| 1.3 | App migration: `role`, `user_roles` tables + seed roles |
| 1.4 | Better Auth hook: assign `member` role on user creation |
| 1.5 | SolidJS login/register pages using Better Auth client |
| 1.6 | Session store in SPA; protected route wrapper |
| 1.7 | Go auth middleware: session lookup + role loading |
| 1.8 | `GET /api/v1/me` endpoint returning user + roles |
| 1.9 | Dev proxy or CORS config for cookies |
| 1.10 | First admin bootstrap script (promote user to admin by email) |

**Acceptance criteria:**

- [ ] User can register and log in via SPA
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] Go `/me` returns 401 when unauthenticated
- [ ] Go `/me` returns user + roles when authenticated
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
| 4.1 | Unified reverse proxy (single origin) or subdomain cookie config |
| 4.2 | Rate limiting on auth and upload endpoints |
| 4.3 | Security headers (CSP, HSTS, X-Frame-Options) |
| 4.4 | Input validation audit across all endpoints |
| 4.5 | Error handling: no stack traces in production responses |
| 4.6 | Structured logging + request IDs |
| 4.7 | Deploy SolidJS to Cloudflare Pages or Netlify |
| 4.8 | Deploy Go API to Fly.io or Railway |
| 4.9 | Deploy Auth service to Fly.io or Railway |
| 4.10 | Production Neon + Cloudinary accounts configured |
| 4.11 | Database backup verification (Neon PITR on paid; export script on free) |
| 4.12 | Enable Turborepo Remote Cache in CI (optional speedup) |
| 4.13 | E2E smoke tests against staging |
| 4.14 | Admin documentation (how to post announcements, manage resources) |
| 4.15 | Performance pass: image lazy loading, pagination, CDN cache headers |

**Acceptance criteria:**

- [ ] All services deployed to production URLs
- [ ] HTTPS everywhere; cookies marked Secure
- [ ] CSP configured without breaking Cloudinary images
- [ ] Rate limits active on `/api/auth/*` and `/uploads/sign/*`
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
| Weak passwords | Better Auth password policy (min 8 chars); consider zxcvbn |
| Session fixation | Better Auth handles token rotation on login |

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
- Cloudinary API secret **only in Go API** (never in SPA or auth service unless signing uploads)
- Rotate secrets if exposed
- Separate Cloudinary folders per environment (`church-dev/`, `church-prod/`)

### 9.6 Dependency & Supply Chain

- Dependabot/Renovate for npm and Go modules
- Pin Go module versions in `go.sum`
- CI runs `govulncheck` and `npm audit`

---

## 10. Deployment Strategy

### 10.1 Recommended Hosting Matrix

| Component | Recommended | Alternative | Notes |
|---|---|---|---|
| **SolidJS SPA** | Cloudflare Pages | Netlify, Vercel | Free tier, global CDN, easy preview deploys |
| **Go API** | Fly.io | Railway, Render | Docker deploy, auto TLS, scale to zero on free tier (with cold starts) |
| **Auth service** | Fly.io | Railway, Render | Same region as Go API for latency |
| **Neon PostgreSQL** | Neon (managed) | — | Use pooler endpoint from Fly/Railway |
| **Cloudinary** | Cloudinary (managed) | — | Free tier sufficient for v1 |
| **Reverse proxy** | Cloudflare (DNS + proxy rules) | Caddy on Fly | Single-origin routing recommended |

### 10.2 Production Topology (Single-Origin via Cloudflare)

```
church.example.org
├── /*                    → Cloudflare Pages (SolidJS)
├── /api/auth/*           → Fly.io auth service
└── /api/v1/*             → Fly.io Go API
```

Cloudflare Page Rules or Workers route paths to backends while the browser sees one origin.

### 10.3 CI/CD Pipeline

```mermaid
flowchart LR
    PR[Pull Request] --> CI[GitHub Actions]
    CI --> Turbo["turbo run lint test build<br/>(remote cache optional)"]
    Turbo --> Merge[Merge to main]
    Merge --> Deploy[Deploy workflow]
    Deploy --> Pages[Cloudflare Pages]
    Deploy --> FlyAPI[Fly.io Go API]
    Deploy --> FlyAuth[Fly.io Auth]
    Deploy --> Migrate[Run DB migrations]
```

**CI example (`.github/workflows/ci.yml`):**

```yaml
- uses: pnpm/action-setup@v4
- run: pnpm install --frozen-lockfile
- run: turbo run lint test build
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}   # optional remote cache
    TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

**Migration strategy:** Run migrations as a CI step **before** deploying new API version (backward-compatible migrations only). Use expand/contract pattern for breaking schema changes.

### 10.4 Environment Separation

| Environment | Neon branch | Cloudinary folder | Purpose |
|---|---|---|---|
| `development` | dev branch | `church-dev/` | Local + preview |
| `staging` | staging branch | `church-staging/` | Pre-prod testing |
| `production` | main branch | `church-prod/` | Live site |

Neon supports database branching — ideal for preview/staging isolation.

### 10.5 Monitoring & Observability (v1 minimum)

| Tool | Purpose | Cost |
|---|---|---|
| Fly.io metrics / Railway logs | API/auth logs | Free tier |
| Cloudflare Analytics | Traffic, cache hit rate | Free |
| Neon dashboard | Connection count, query latency | Free |
| Cloudinary dashboard | Storage, bandwidth, credits | Free |
| UptimeRobot or Better Stack | External uptime checks | Free tier |

---

## 11. Environment Variables

### 11.1 SolidJS (`apps/web/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `/api/v1` or `http://localhost:8080/api/v1` | Go API base URL |
| `VITE_AUTH_BASE_URL` | Yes | `/api/auth` or `http://localhost:3001/api/auth` | Better Auth base URL |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | `my-church` | For building image URLs client-side |
| `VITE_APP_NAME` | No | `Grace Church` | Display name |

> **Never** put Cloudinary API secret or Neon credentials in `VITE_*` variables.

### 11.2 Auth Service (`apps/auth/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require` | Direct or pooled Neon URL |
| `BETTER_AUTH_SECRET` | Yes | `(32+ byte random)` | Session signing secret |
| `BETTER_AUTH_URL` | Yes | `http://localhost:3001` | Auth service public URL |
| `TRUSTED_ORIGINS` | Yes | `http://localhost:5173` | CORS allowed origins (comma-separated) |
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Environment |

### 11.3 Go API (`apps/api/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://...@ep-xxx-pooler.neon.tech/neondb?sslmode=require` | **Pooled** Neon URL |
| `DATABASE_MIGRATE_URL` | Yes | `postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require` | Direct URL for migrations |
| `PORT` | No | `8080` | Server port |
| `ENV` | No | `development` | `development` / `staging` / `production` |
| `CORS_ORIGINS` | Yes | `http://localhost:5173` | Allowed origins |
| `SESSION_COOKIE_NAME` | Yes | `better-auth.session_token` | Must match Better Auth config |
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
| `FLY_API_TOKEN` | Fly.io deploy |
| `CLOUDFLARE_API_TOKEN` | Pages deploy |
| `CLOUDINARY_*` | Staging/prod API deploy |
| `BETTER_AUTH_SECRET` | Auth service deploy |
| `TURBO_TOKEN` | Turborepo remote cache (optional) |
| `TURBO_TEAM` | Turborepo team slug (optional) |

### 11.5 Example `.env.example` (root)

```bash
# === Neon PostgreSQL ===
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
DATABASE_MIGRATE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# === Better Auth ===
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:3001
TRUSTED_ORIGINS=http://localhost:5173

# === Go API ===
PORT=8080
ENV=development
CORS_ORIGINS=http://localhost:5173
SESSION_COOKIE_NAME=better-auth.session_token

# === Cloudinary ===
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=church-dev

# === SolidJS (prefix VITE_) ===
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_AUTH_BASE_URL=http://localhost:3001/api/auth
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
| Auth integration | Better Auth signup → Go `/me` | Shared test DB, cleanup between tests |
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
| ADR-002 | Better Auth sidecar | Node auth service + Go session validation via shared DB |
| ADR-003 | Cloudinary private resources | Raw files private; signed download URLs from Go |
| ADR-004 | Single-origin production | Cloudflare routes `/api/auth` and `/api/v1` to backends |
| ADR-005 | Explicit resource-role mapping | No implicit role hierarchy in v1 |

---

## Appendix B: Future Enhancements (Out of Scope v1)

| Feature | Notes |
|---|---|
| OAuth (Google) | Better Auth plugin; add in Phase 4+ |
| Email notifications | New announcement alerts via Resend/SendGrid |
| Full-text search | Postgres `tsvector` on announcements |
| Calendar/events | Separate module |
| Multi-church tenancy | Would require org_id on all tables |
| Mobile app | Better Auth JWT plugin + API tokens |
| CMS-style page builder | Significant scope increase |
| i18n | SolidJS i18n library + translated content columns |

---

## Appendix C: Glossary

| Term | Definition |
|---|---|
| **Board** | Public announcements page |
| **Resource** | Downloadable file gated by role |
| **Role** | Permission group (member, volunteer, leader, admin) |
| **Session** | Better Auth token stored in HttpOnly cookie |
| **Signed URL** | Time-limited Cloudinary URL requiring signature |
| **Pooler** | Neon PgBouncer endpoint for connection pooling |
| **Turborepo** | Monorepo task runner; orchestrates `dev`, `build`, `test`, `lint` with caching across workspace packages |

---

*End of architecture plan.*
