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

FROM base AS dev
COPY --from=builder /app /app
WORKDIR /app
EXPOSE 3001
CMD ["pnpm", "--filter", "@church/auth", "dev"]
