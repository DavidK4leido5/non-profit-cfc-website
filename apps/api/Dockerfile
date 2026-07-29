FROM golang:1.22-bookworm

WORKDIR /app

COPY apps/api/go.mod apps/api/go.sum ./apps/api/

WORKDIR /app/apps/api
RUN go mod download

WORKDIR /app
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN go mod vendor

RUN chmod +x /app/apps/api/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/app/apps/api/entrypoint.sh"]
CMD ["go", "run", "-mod=vendor", "./cmd/server"]
