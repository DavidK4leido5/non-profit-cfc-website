package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/church-page/api/internal/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

type HealthHandler struct {
	cfg  config.Config
	pool *pgxpool.Pool
}

func NewHealthHandler(cfg config.Config, pool *pgxpool.Pool) *HealthHandler {
	return &HealthHandler{cfg: cfg, pool: pool}
}

// Liveness godoc
// @Summary      Liveness probe
// @Description  Returns 200 when the API process is running.
// @Tags         health
// @Produce      json
// @Success      200  {object}  HealthResponse
// @Router       /health [get]
func (h *HealthHandler) Liveness(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, HealthResponse{Status: "ok"})
}

// Readiness godoc
// @Summary      Readiness probe
// @Description  Returns 200 when the API is ready. Pings Neon when DATABASE_URL is set.
// @Tags         health
// @Produce      json
// @Success      200  {object}  HealthResponse
// @Router       /ready [get]
func (h *HealthHandler) Readiness(w http.ResponseWriter, _ *http.Request) {
	if h.cfg.DatabaseURL == "" || h.pool == nil {
		writeJSON(w, http.StatusOK, HealthResponse{
			Status:   "ok",
			Database: "not configured",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := h.pool.Ping(ctx); err != nil {
		writeJSON(w, http.StatusServiceUnavailable, HealthResponse{
			Status:   "unavailable",
			Database: "unreachable",
		})
		return
	}

	writeJSON(w, http.StatusOK, HealthResponse{
		Status:   "ok",
		Database: "up",
	})
}
