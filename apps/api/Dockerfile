FROM golang:1.25-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY apps/api/go.mod apps/api/go.sum ./apps/api/

WORKDIR /app/apps/api
RUN go mod download

WORKDIR /app
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN go mod vendor \
  && go build -mod=vendor -o /usr/local/bin/church-api ./cmd/server \
  && chmod +x /usr/local/bin/church-api

ENV PORT=8080
ENV MIGRATIONS_DIR=/app/apps/api/migrations

EXPOSE 8080

CMD ["/usr/local/bin/church-api"]
