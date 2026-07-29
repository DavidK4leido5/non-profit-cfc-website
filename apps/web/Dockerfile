ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-bookworm-slim AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable && corepack prepare pnpm@11.17.0 --activate

# ---
FROM base AS prepare

COPY . .
RUN pnpm dlx turbo prune @church/web --docker

# ---
FROM base AS builder

COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full/ .

# ---
FROM base AS builder-prod

COPY --from=builder /app /app
WORKDIR /app
RUN pnpm exec turbo run build --filter=@church/web

# ---
FROM base AS dev

RUN apt-get update \
  && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app /app
WORKDIR /app

RUN chmod +x /app/apps/web/entrypoint.sh

EXPOSE 5173 6006

ENTRYPOINT ["/app/apps/web/entrypoint.sh"]
CMD ["pnpm", "exec", "turbo", "run", "dev", "--filter=@church/web", "--filter=@church/ui"]

# ---
FROM nginx:1.27-alpine AS runner

COPY --from=builder-prod /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
