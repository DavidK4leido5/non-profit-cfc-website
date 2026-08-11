package handler

import (
	"net/http"
	"strings"

	"github.com/church-page/api/internal/cloudinary"
	"github.com/church-page/api/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AssetsHandler struct {
	pool *pgxpool.Pool
	cld  *cloudinary.Client
}

func NewAssetsHandler(pool *pgxpool.Pool, cld *cloudinary.Client) *AssetsHandler {
	return &AssetsHandler{pool: pool, cld: cld}
}

func (h *AssetsHandler) List(w http.ResponseWriter, r *http.Request) {
	rows, err := h.pool.Query(r.Context(), `
		SELECT id, public_id, url, secure_url, resource_type, format, width, height, bytes, folder, original_filename, created_at, updated_at
		FROM cloudinary_assets
		ORDER BY created_at DESC
		LIMIT 100
	`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to list assets")
		return
	}
	defer rows.Close()

	items := make([]models.Asset, 0)
	for rows.Next() {
		var item models.Asset
		if err := rows.Scan(
			&item.ID, &item.PublicID, &item.URL, &item.SecureURL, &item.ResourceType,
			&item.Format, &item.Width, &item.Height, &item.Bytes, &item.Folder, &item.OriginalFilename,
			&item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "db_error", "Failed to scan asset")
			return
		}
		items = append(items, item)
	}
	writeData(w, http.StatusOK, items)
}

func (h *AssetsHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid asset id")
		return
	}

	item, err := h.scanOne(r, id)
	if err != nil {
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "not_found", "Asset not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load asset")
		return
	}
	writeData(w, http.StatusOK, item)
}

func (h *AssetsHandler) Upload(w http.ResponseWriter, r *http.Request) {
	if h.cld == nil {
		writeError(w, http.StatusServiceUnavailable, "misconfigured", "Cloudinary is not configured")
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_upload", "Invalid multipart upload (max 10MB)")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing_file", "file field is required")
		return
	}
	defer file.Close()

	contentType := header.Header.Get("Content-Type")
	if contentType != "" && !strings.HasPrefix(contentType, "image/") {
		writeError(w, http.StatusBadRequest, "invalid_type", "Only image uploads are supported")
		return
	}

	uploaded, err := h.cld.Upload(r.Context(), header.Filename, file)
	if err != nil {
		writeError(w, http.StatusBadGateway, "cloudinary_error", "Upload to Cloudinary failed")
		return
	}

	folder := cloudinary.FolderFromPublicID(uploaded.PublicID)
	var item models.Asset
	err = h.pool.QueryRow(r.Context(), `
		INSERT INTO cloudinary_assets (
			public_id, url, secure_url, resource_type, format, width, height, bytes, folder, original_filename
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		RETURNING id, public_id, url, secure_url, resource_type, format, width, height, bytes, folder, original_filename, created_at, updated_at
	`,
		uploaded.PublicID, uploaded.URL, uploaded.SecureURL, uploaded.ResourceType,
		nullIfEmpty(uploaded.Format), nullIfZero(uploaded.Width), nullIfZero(uploaded.Height), nullIfZero(uploaded.Bytes),
		nullIfEmpty(folder), nullIfEmpty(uploaded.OriginalFilename),
	).Scan(
		&item.ID, &item.PublicID, &item.URL, &item.SecureURL, &item.ResourceType,
		&item.Format, &item.Width, &item.Height, &item.Bytes, &item.Folder, &item.OriginalFilename,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to save asset record")
		return
	}

	writeData(w, http.StatusCreated, item)
}

func (h *AssetsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid asset id")
		return
	}

	var publicID string
	err = h.pool.QueryRow(r.Context(), `SELECT public_id FROM cloudinary_assets WHERE id = $1`, id).Scan(&publicID)
	if err != nil {
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "not_found", "Asset not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load asset")
		return
	}

	if h.cld != nil {
		_ = h.cld.Destroy(r.Context(), publicID)
	}

	_, err = h.pool.Exec(r.Context(), `DELETE FROM cloudinary_assets WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to delete asset")
		return
	}

	writeData(w, http.StatusOK, map[string]string{"message": "deleted"})
}

func (h *AssetsHandler) scanOne(r *http.Request, id uuid.UUID) (models.Asset, error) {
	var item models.Asset
	err := h.pool.QueryRow(r.Context(), `
		SELECT id, public_id, url, secure_url, resource_type, format, width, height, bytes, folder, original_filename, created_at, updated_at
		FROM cloudinary_assets WHERE id = $1
	`, id).Scan(
		&item.ID, &item.PublicID, &item.URL, &item.SecureURL, &item.ResourceType,
		&item.Format, &item.Width, &item.Height, &item.Bytes, &item.Folder, &item.OriginalFilename,
		&item.CreatedAt, &item.UpdatedAt,
	)
	return item, err
}

func nullIfEmpty(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func nullIfZero(value int) *int {
	if value == 0 {
		return nil
	}
	return &value
}
