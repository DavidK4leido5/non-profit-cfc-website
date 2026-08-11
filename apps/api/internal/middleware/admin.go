package middleware

import (
	"crypto/subtle"
	"net/http"
	"strings"
)

func RequireAdmin(token string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if token == "" {
				http.Error(w, `{"error":{"code":"misconfigured","message":"Admin API token is not configured"}}`, http.StatusServiceUnavailable)
				return
			}

			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				http.Error(w, `{"error":{"code":"unauthorized","message":"Missing bearer token"}}`, http.StatusUnauthorized)
				return
			}

			provided := strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
			if subtle.ConstantTimeCompare([]byte(provided), []byte(token)) != 1 {
				http.Error(w, `{"error":{"code":"unauthorized","message":"Invalid admin token"}}`, http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
