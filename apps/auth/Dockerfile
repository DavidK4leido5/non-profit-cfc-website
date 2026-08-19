ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-bookworm-slim AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable && corepack prepare pnpm@11.17.0 --activate

FROM base AS prepare
COPY . .
RUN pnpm dlx turbo prune @church/auth --docker

FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prepare /app/out/full/ .

# --- Local / Compose Watch ---
FROM base AS dev
COPY --from=builder /app /app
WORKDIR /app
RUN chmod +x /app/apps/auth/entrypoint.sh
EXPOSE 3001
ENV HOST=0.0.0.0
ENV AUTH_PORT=3001
ENV CI=true
ENTRYPOINT ["/app/apps/auth/entrypoint.sh"]
CMD ["pnpm", "--filter", "@church/auth", "dev"]

# --- Production / Cloud Run ---
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
COPY --from=builder /app /app
WORKDIR /app
EXPOSE 8080
CMD ["pnpm", "--filter", "@church/auth", "start"]
