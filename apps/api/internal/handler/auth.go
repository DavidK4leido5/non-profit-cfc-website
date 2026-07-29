package handler

import "net/http"

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// Register godoc
// @Summary      Register a new account
// @Description  Creates a user and assigns the default `member` role. Sets an HttpOnly session cookie on success (Phase 1).
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body  body      RegisterRequest  true  "Registration payload"
// @Success      201   {object}  UserResponse
// @Failure      400   {object}  ErrorResponse
// @Failure      501   {object}  ErrorResponse
// @Router       /api/v1/auth/register [post]
func (h *AuthHandler) Register(w http.ResponseWriter, _ *http.Request) {
	writeError(w, http.StatusNotImplemented, "not_implemented", "Registration will be implemented in Phase 1")
}

// Login godoc
// @Summary      Sign in
// @Description  Validates credentials and issues an HttpOnly session cookie (Phase 1).
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body  body      LoginRequest  true  "Login payload"
// @Success      200   {object}  UserResponse
// @Failure      401   {object}  ErrorResponse
// @Failure      501   {object}  ErrorResponse
// @Router       /api/v1/auth/login [post]
func (h *AuthHandler) Login(w http.ResponseWriter, _ *http.Request) {
	writeError(w, http.StatusNotImplemented, "not_implemented", "Login will be implemented in Phase 1")
}

// Logout godoc
// @Summary      Sign out
// @Description  Revokes the current session and clears the session cookie (Phase 1).
// @Tags         auth
// @Produce      json
// @Security     CookieAuth
// @Success      204  "No Content"
// @Failure      501  {object}  ErrorResponse
// @Router       /api/v1/auth/logout [post]
func (h *AuthHandler) Logout(w http.ResponseWriter, _ *http.Request) {
	writeError(w, http.StatusNotImplemented, "not_implemented", "Logout will be implemented in Phase 1")
}

// Me godoc
// @Summary      Current session
// @Description  Returns the authenticated user and role slugs.
// @Tags         auth
// @Produce      json
// @Security     CookieAuth
// @Success      200  {object}  UserResponse
// @Failure      401  {object}  ErrorResponse
// @Router       /api/v1/auth/me [get]
func (h *AuthHandler) Me(w http.ResponseWriter, _ *http.Request) {
	writeError(w, http.StatusUnauthorized, "unauthorized", "Not authenticated")
}
