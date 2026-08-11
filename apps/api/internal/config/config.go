package config

import (
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Env                 string
	Port                string
	DatabaseURL         string
	CORSOrigins         []string
	SessionCookieName   string
	LogLevel            slog.Level
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
	CloudinaryFolder    string
	AdminAPIToken       string
	MigrationsDir       string
}

func Load() (Config, error) {
	_ = godotenv.Load()
	// Also try repo root .env when running from apps/api
	_ = godotenv.Load(filepath.Join("..", "..", ".env"))

	level := slog.LevelInfo
	if strings.EqualFold(getEnv("ENV", "development"), "development") {
		level = slog.LevelDebug
	}

	cfg := Config{
		Env:                 getEnv("ENV", "development"),
		Port:                getEnv("PORT", "8080"),
		DatabaseURL:         os.Getenv("DATABASE_URL"),
		CORSOrigins:         splitCSV(getEnv("CORS_ORIGINS", "http://localhost:5173")),
		SessionCookieName:   getEnv("SESSION_COOKIE_NAME", "church_session"),
		LogLevel:            level,
		CloudinaryCloudName: os.Getenv("CLOUDINARY_CLOUD_NAME"),
		CloudinaryAPIKey:    os.Getenv("CLOUDINARY_API_KEY"),
		CloudinaryAPISecret: os.Getenv("CLOUDINARY_API_SECRET"),
		CloudinaryFolder:    getEnv("CLOUDINARY_FOLDER", "church-dev"),
		AdminAPIToken:       os.Getenv("ADMIN_API_TOKEN"),
		MigrationsDir:       getEnv("MIGRATIONS_DIR", "migrations"),
	}

	if cfg.Port == "" {
		return Config{}, fmt.Errorf("PORT must not be empty")
	}

	return cfg, nil
}

func (c Config) CloudinaryConfigured() bool {
	return c.CloudinaryCloudName != "" && c.CloudinaryAPIKey != "" && c.CloudinaryAPISecret != ""
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
