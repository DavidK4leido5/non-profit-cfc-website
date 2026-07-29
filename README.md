# Church Page

Monorepo layout follows the [Turborepo with-docker example](https://github.com/vercel/turborepo/tree/main/examples/with-docker): shared packages, per-app Dockerfiles, and a root `docker-compose.yml`.

```
church-page/
├── apps/
│   ├── web/          # SolidJS app — Dockerfile + entrypoint.sh
│   └── api/          # Go API — Dockerfile + entrypoint.sh
├── packages/
│   ├── ui/           # Shared UI + Storybook (@church/ui)
│   └── typescript-config/
└── docker-compose.yml
```

## Prerequisites

- [Docker](https://www.docker.com/) (recommended — only requirement for dev)
- [pnpm](https://pnpm.io/) 11+ and [Go](https://go.dev/) 1.22+ (optional, for host-only workflows)

## Docker dev (recommended)

Separate `web` and `api` services, each built from its own Dockerfile.

```bash
docker compose build
docker compose watch    # syncs file changes + starts web, Storybook, and API
```

| Service | URL |
|---------|-----|
| Web app | http://localhost:5173 |
| Storybook | http://localhost:6006 |
| API health | http://localhost:8080/health |
| Swagger UI | http://localhost:8080/swagger/index.html |

**Do not install `node_modules` on the host.** JS deps install into the `church_node_modules` Docker volume via `apps/web/entrypoint.sh`.

`docker compose watch` syncs your repo into the containers — edits on the host hot-reload automatically. The `web` service runs both Vite and Storybook via Turborepo (`@church/web` + `@church/ui`). Swagger is served by the `api` service at `/swagger/` (no separate process).

Other commands (only when you need a one-off task):

```bash
docker compose exec web pnpm build
docker compose exec web pnpm build-storybook
docker compose exec api sh -c "go run github.com/swaggo/swag/cmd/swag@v1.16.4 init -g cmd/server/main.go -o docs --parseDependency --parseInternal && go mod vendor"
```

## Local dev (host)

Requires Go 1.22+ and pnpm 11+ on the host.

```bash
pnpm install
pnpm dev
```

## UI documentation (Storybook)

Shared components live in `packages/ui`. Storybook runs from `@church/ui`:

```bash
pnpm storybook          # dev server on :6006
pnpm build-storybook    # static export → packages/ui/storybook-static
```

Import in apps:

```tsx
import { PageShell } from "@church/ui/page-shell";
```

## API documentation (Swagger)

```bash
pnpm swagger            # regenerate apps/api/docs from annotations
```

- Swagger UI: http://localhost:8080/swagger/index.html
- OpenAPI JSON: http://localhost:8080/swagger/doc.json

See [PLAN.md](./PLAN.md) for architecture and phased implementation.
