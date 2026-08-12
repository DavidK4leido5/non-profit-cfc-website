package middleware

import (
	"crypto/subtle"
	"net/http"
)

// GatewayHeader is injected by the web nginx proxy. Direct hits to api/auth
// without this header are rejected when a shared secret is configured.
const GatewayHeader = "X-Church-Gateway"

// RequireGateway blocks requests that did not come through the web gateway.
// When secret is empty (local dev), the check is skipped.
// /health and /ready stay open for Cloud Run / Compose probes.
func RequireGateway(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if secret == "" {
				next.ServeHTTP(w, r)
				return
			}

			switch r.URL.Path {
			case "/health", "/ready":
				next.ServeHTTP(w, r)
				return
			}

			provided := r.Header.Get(GatewayHeader)
			if subtle.ConstantTimeCompare([]byte(provided), []byte(secret)) != 1 {
				w.Header().Set("Content-Type", "application/json")
				http.Error(w, `{"error":{"code":"forbidden","message":"Direct access is not allowed"}}`, http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
