package handler

import (
	"errors"
	"net/http"
	"strings"

	"github.com/church-page/api/internal/cloudinary"
	"github.com/church-page/api/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AssetsHandler struct {
	db  *gorm.DB
	cld *cloudinary.Client
}

func NewAssetsHandler(db *gorm.DB, cld *cloudinary.Client) *AssetsHandler {
	return &AssetsHandler{db: db, cld: cld}
}

func (h *AssetsHandler) List(w http.ResponseWriter, r *http.Request) {
	var items []models.Asset
	if err := h.db.WithContext(r.Context()).
		Order("created_at DESC").
		Limit(100).
		Find(&items).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to list assets")
		return
	}
	if items == nil {
		items = []models.Asset{}
	}
	writeData(w, http.StatusOK, items)
}

func (h *AssetsHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid asset id")
		return
	}

	item, err := h.getByID(r, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
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
	item := models.Asset{
		ID:               uuid.New(),
		PublicID:         uploaded.PublicID,
		URL:              uploaded.URL,
		SecureURL:        uploaded.SecureURL,
		ResourceType:     uploaded.ResourceType,
		Format:           nullIfEmpty(uploaded.Format),
		Width:            nullIfZero(uploaded.Width),
		Height:           nullIfZero(uploaded.Height),
		Bytes:            nullIfZero(uploaded.Bytes),
		Folder:           nullIfEmpty(folder),
		OriginalFilename: nullIfEmpty(uploaded.OriginalFilename),
	}
	if err := h.db.WithContext(r.Context()).Create(&item).Error; err != nil {
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

	item, err := h.getByID(r, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "not_found", "Asset not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load asset")
		return
	}

	if h.cld != nil {
		_ = h.cld.Destroy(r.Context(), item.PublicID)
	}

	if err := h.db.WithContext(r.Context()).Delete(&item).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to delete asset")
		return
	}

	writeData(w, http.StatusOK, map[string]string{"message": "deleted"})
}

func (h *AssetsHandler) getByID(r *http.Request, id uuid.UUID) (models.Asset, error) {
	var item models.Asset
	err := h.db.WithContext(r.Context()).First(&item, "id = ?", id).Error
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
