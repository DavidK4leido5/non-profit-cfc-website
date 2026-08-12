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

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_AUTH_BASE_URL=/api/auth
ARG VITE_CLOUDINARY_CLOUD_NAME=
ARG VITE_APP_NAME=Church
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_AUTH_BASE_URL=$VITE_AUTH_BASE_URL \
    VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME \
    VITE_APP_NAME=$VITE_APP_NAME

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

# Official nginx image runs envsubst on /etc/nginx/templates/*.template → conf.d/
ENV PORT=80
ENV API_UPSTREAM=http://api:8080
ENV AUTH_UPSTREAM=http://auth:3001
ENV GATEWAY_SHARED_SECRET=""
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder-prod /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
