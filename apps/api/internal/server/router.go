package server

import (
	"log/slog"
	"net/http"

	"github.com/church-page/api/internal/config"
	"github.com/church-page/api/internal/handler"
	"github.com/church-page/api/internal/middleware"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	httpSwagger "github.com/swaggo/http-swagger"

	_ "github.com/church-page/api/docs"
)

func NewRouter(cfg config.Config, logger *slog.Logger) http.Handler {
	r := chi.NewRouter()

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.Logger(logger))
	r.Use(middleware.CORS(cfg.CORSOrigins))

	health := handler.NewHealthHandler(cfg)
	auth := handler.NewAuthHandler()

	r.Get("/health", health.Liveness)
	r.Get("/ready", health.Readiness)

	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
	))

	r.Route("/api/v1", func(api chi.Router) {
		api.Get("/auth/me", auth.Me)
		api.Post("/auth/register", auth.Register)
		api.Post("/auth/login", auth.Login)
		api.Post("/auth/logout", auth.Logout)
	})

	return r
}
