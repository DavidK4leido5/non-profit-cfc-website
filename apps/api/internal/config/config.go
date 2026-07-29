package config

import (
	"fmt"
	"log/slog"
	"os"
	"strings"
)

type Config struct {
	Env               string
	Port              string
	DatabaseURL       string
	CORSOrigins       []string
	SessionCookieName string
	LogLevel          slog.Level
}

func Load() (Config, error) {
	level := slog.LevelInfo
	if strings.EqualFold(getEnv("ENV", "development"), "development") {
		level = slog.LevelDebug
	}

	cfg := Config{
		Env:               getEnv("ENV", "development"),
		Port:              getEnv("PORT", "8080"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		CORSOrigins:       splitCSV(getEnv("CORS_ORIGINS", "http://localhost:5173")),
		SessionCookieName: getEnv("SESSION_COOKIE_NAME", "church_session"),
		LogLevel:          level,
	}

	if cfg.Port == "" {
		return Config{}, fmt.Errorf("PORT must not be empty")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
