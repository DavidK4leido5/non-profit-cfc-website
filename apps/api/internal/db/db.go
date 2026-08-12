package db

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Open(databaseURL string) (*gorm.DB, error) {
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is empty")
	}

	gdb, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger:                 logger.Default.LogMode(logger.Warn),
		SkipDefaultTransaction: true,
	})
	if err != nil {
		return nil, fmt.Errorf("gorm open: %w", err)
	}

	sqlDB, err := gdb.DB()
	if err != nil {
		return nil, fmt.Errorf("sql db: %w", err)
	}
	sqlDB.SetMaxOpenConns(8)
	sqlDB.SetMaxIdleConns(2)
	sqlDB.SetConnMaxLifetime(time.Hour)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := sqlDB.PingContext(ctx); err != nil {
		_ = sqlDB.Close()
		return nil, fmt.Errorf("ping: %w", err)
	}

	return gdb, nil
}

func Migrate(ctx context.Context, gdb *gorm.DB, migrationsDir string) error {
	db := gdb.WithContext(ctx)

	if err := db.Exec(`
		CREATE TABLE IF NOT EXISTS schema_migrations (
			filename TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)
	`).Error; err != nil {
		return fmt.Errorf("schema_migrations: %w", err)
	}

	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("read migrations dir: %w", err)
	}

	var ups []string
	for _, entry := range entries {
		name := entry.Name()
		if !entry.IsDir() && strings.HasSuffix(name, ".up.sql") {
			ups = append(ups, name)
		}
	}
	sort.Strings(ups)

	for _, name := range ups {
		var exists bool
		if err := db.Raw(`SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE filename = ?)`, name).Scan(&exists).Error; err != nil {
			return err
		}
		if exists {
			continue
		}

		body, err := os.ReadFile(filepath.Join(migrationsDir, name))
		if err != nil {
			return fmt.Errorf("read %s: %w", name, err)
		}

		err = db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Exec(string(body)).Error; err != nil {
				return fmt.Errorf("apply %s: %w", name, err)
			}
			if err := tx.Exec(`INSERT INTO schema_migrations (filename) VALUES (?)`, name).Error; err != nil {
				return fmt.Errorf("record %s: %w", name, err)
			}
			return nil
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func Close(gdb *gorm.DB) error {
	if gdb == nil {
		return nil
	}
	sqlDB, err := gdb.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
