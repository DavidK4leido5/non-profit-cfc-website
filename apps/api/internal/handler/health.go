package handler

import (
	"encoding/json"
	"net/http"

	"github.com/church-page/api/internal/config"
)

type HealthHandler struct {
	cfg config.Config
}

func NewHealthHandler(cfg config.Config) *HealthHandler {
	return &HealthHandler{cfg: cfg}
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
// @Description  Returns 200 when the API is ready to serve traffic. Database status is informational until Neon is connected.
// @Tags         health
// @Produce      json
// @Success      200  {object}  HealthResponse
// @Router       /ready [get]
func (h *HealthHandler) Readiness(w http.ResponseWriter, _ *http.Request) {
	if h.cfg.DatabaseURL == "" {
		writeJSON(w, http.StatusOK, HealthResponse{
			Status:   "ok",
			Database: "not configured",
		})
		return
	}

	writeJSON(w, http.StatusOK, HealthResponse{
		Status:   "ok",
		Database: "configured",
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, ErrorResponse{
		Error: ErrorBody{
			Code:    code,
			Message: message,
		},
	})
}
