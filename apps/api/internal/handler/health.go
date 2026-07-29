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

func (h *HealthHandler) Liveness(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *HealthHandler) Readiness(w http.ResponseWriter, _ *http.Request) {
	if h.cfg.DatabaseURL == "" {
		writeJSON(w, http.StatusOK, map[string]string{
			"status":  "ok",
			"database": "not configured",
		})
		return
	}

	// DB ping will be added when migrations are wired up.
	writeJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"database": "configured",
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
