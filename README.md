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

- [Docker](https://www.docker.com/) — **required for the Go API** (no local Go install)
- [pnpm](https://pnpm.io/) 11+ (optional — host web only)

## Docker API only

```bash
# loads root .env (DATABASE_URL, Cloudinary, ADMIN_API_TOKEN)
pnpm dev:api
# same as: docker compose up api --build --remove-orphans
```

Go is compiled **inside the image** (no local Go). Rebuild the image when you change API code.

API: http://localhost:8080/health — then run the web app on the host with `pnpm --filter @church/web dev` (proxies `/api/v1` → localhost:8080).

Auto-rebuild on Go file changes:

```bash
pnpm dev:api:watch
```

## Full Docker stack (web + api)

```bash
docker compose build
pnpm dev:docker
# same as: docker compose up --watch --remove-orphans
```

Keep that terminal open — `--watch` runs in the foreground and handles hot reload.

| Service | URL |
|---------|-----|
| Web app | http://localhost:5173 |
| Storybook | http://localhost:6006 |
| API health | http://localhost:8080/health |
| Swagger UI | http://localhost:8080/swagger/index.html |

**Do not install `node_modules` on the host.** JS deps install into the `church_node_modules` Docker volume via `apps/web/entrypoint.sh`.

**How file changes apply:**

| Change | Mechanism |
|--------|-----------|
| Web / UI / content (`apps/web`, `packages/ui`) | Bind mount + Vite poll reload (~500ms page refresh in Docker on Windows) + Storybook HMR |
| Go API (`apps/api`) | Bind mount + container restart via `--watch` |
| `pnpm-lock.yaml` | Watch restarts `web` container |

`docker compose up -d` alone starts services but **does not** run watch actions — API won't auto-restart on Go edits.

Other commands (only when you need a one-off task):

```bash
docker compose exec web pnpm build
docker compose exec web pnpm build-storybook
docker compose exec api sh -c "go run github.com/swaggo/swag/cmd/swag@v1.16.4 init -g cmd/server/main.go -o docs --parseDependency --parseInternal && go mod vendor"
```

## Local web (host) + Docker API

No local Go. Run the API in Docker, web on the host:

```bash
pnpm dev:api            # terminal 1 — Go API in Docker
pnpm --filter @church/web dev   # terminal 2 — Vite on :5173
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
