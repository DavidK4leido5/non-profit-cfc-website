// Package main Church Page API server.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/church-page/api/internal/cloudinary"
	"github.com/church-page/api/internal/config"
	"github.com/church-page/api/internal/db"
	"github.com/church-page/api/internal/server"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		slog.Error("config load failed", "error", err)
		os.Exit(1)
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: cfg.LogLevel,
	}))

	ctx := context.Background()
	var gdb *gorm.DB
	if cfg.DatabaseURL != "" {
		gdb, err = db.Open(cfg.DatabaseURL)
		if err != nil {
			logger.Error("database connect failed", "error", err)
			os.Exit(1)
		}

		migrationsDir := cfg.MigrationsDir
		if !filepath.IsAbs(migrationsDir) {
			if abs, absErr := filepath.Abs(migrationsDir); absErr == nil {
				migrationsDir = abs
			}
		}
		if err := db.Migrate(ctx, gdb, migrationsDir); err != nil {
			logger.Error("migrate failed", "error", err)
			os.Exit(1)
		}
		logger.Info("database ready", "orm", "gorm", "migrations", migrationsDir)
	} else {
		logger.Warn("DATABASE_URL not set — content and asset APIs disabled")
	}

	var cld *cloudinary.Client
	if cfg.CloudinaryConfigured() {
		cld, err = cloudinary.New(cloudinary.Config{
			CloudName: cfg.CloudinaryCloudName,
			APIKey:    cfg.CloudinaryAPIKey,
			APISecret: cfg.CloudinaryAPISecret,
			Folder:    cfg.CloudinaryFolder,
		})
		if err != nil {
			logger.Error("cloudinary init failed", "error", err)
			os.Exit(1)
		}
		logger.Info("cloudinary configured", "cloud", cfg.CloudinaryCloudName, "folder", cfg.CloudinaryFolder)
	} else {
		logger.Warn("cloudinary not fully configured — asset upload disabled")
	}

	httpHandler := server.NewRouter(server.Deps{
		Config:     cfg,
		Logger:     logger,
		DB:         gdb,
		Cloudinary: cld,
	})

	httpServer := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      httpHandler,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info("server listening", "addr", httpServer.Addr, "env", cfg.Env)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("server failed", "error", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	logger.Info("shutting down")
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		logger.Error("shutdown failed", "error", err)
		os.Exit(1)
	}
	if err := db.Close(gdb); err != nil {
		logger.Error("database close failed", "error", err)
	}
}
