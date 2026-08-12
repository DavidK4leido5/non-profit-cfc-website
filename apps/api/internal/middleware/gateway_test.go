package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequireGateway_skipsWhenSecretEmpty(t *testing.T) {
	called := false
	h := RequireGateway("")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/board", nil)
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)

	if !called || rr.Code != http.StatusNoContent {
		t.Fatalf("expected passthrough, got called=%v status=%d", called, rr.Code)
	}
}

func TestRequireGateway_allowsHealthWithoutHeader(t *testing.T) {
	h := RequireGateway("s3cret")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("health should stay open, got %d", rr.Code)
	}
}

func TestRequireGateway_rejectsMissingHeader(t *testing.T) {
	h := RequireGateway("s3cret")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not run")
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/board", nil)
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Fatalf("expected 403, got %d", rr.Code)
	}
}

func TestRequireGateway_allowsValidHeader(t *testing.T) {
	h := RequireGateway("s3cret")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/board", nil)
	req.Header.Set(GatewayHeader, "s3cret")
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
}
