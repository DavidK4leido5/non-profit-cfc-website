# Church Page

Monorepo: SolidJS frontend + Go API.

## Prerequisites

- [pnpm](https://pnpm.io/) 11+
- [Go](https://go.dev/) 1.22+
- [Docker](https://www.docker.com/) (recommended for dev)

## Docker dev (recommended)

One container runs the **full Turborepo** — `pnpm dev` starts SolidJS + Go via turbo (same as host workflow).

```bash
docker compose -f infra/docker/docker-compose.yml build
docker compose -f infra/docker/docker-compose.yml watch
```

- Web: http://localhost:5173
- API: http://localhost:8080/health

No Go or Node required on the host. `node_modules` and Go module cache stay in Docker volumes.

## Local dev (host)

Requires **Go 1.22+** and **pnpm 11+** installed locally.

```bash
pnpm install
pnpm dev
```

Run individually:

```bash
pnpm exec turbo run dev --filter=@church/web
pnpm exec turbo run dev --filter=@church/api
```

Copy `.env.example` to `.env` and adjust as needed.

See [PLAN.md](./PLAN.md) for architecture and phased implementation.
