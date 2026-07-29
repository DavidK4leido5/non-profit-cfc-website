package handler

import "net/http"

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

func (h *AuthHandler) Register(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusNotImplemented, map[string]any{
		"error": map[string]string{
			"code":    "not_implemented",
			"message": "Registration will be implemented in Phase 1",
		},
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusNotImplemented, map[string]any{
		"error": map[string]string{
			"code":    "not_implemented",
			"message": "Login will be implemented in Phase 1",
		},
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusNotImplemented, map[string]any{
		"error": map[string]string{
			"code":    "not_implemented",
			"message": "Logout will be implemented in Phase 1",
		},
	})
}

func (h *AuthHandler) Me(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusUnauthorized, map[string]any{
		"error": map[string]string{
			"code":    "unauthorized",
			"message": "Not authenticated",
		},
	})
}
