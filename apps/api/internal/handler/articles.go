package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/church-page/api/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ArticlesHandler struct {
	db *gorm.DB
}

func NewArticlesHandler(db *gorm.DB) *ArticlesHandler {
	return &ArticlesHandler{db: db}
}

type articleInput struct {
	Slug         string          `json:"slug"`
	Title        string          `json:"title"`
	Excerpt      string          `json:"excerpt"`
	CoverAssetID *uuid.UUID      `json:"coverAssetId"`
	CoverURL     string          `json:"coverUrl"`
	BodyHTML     string          `json:"bodyHtml"`
	BodyGJS      json.RawMessage `json:"bodyGjs"`
	Status       string          `json:"status"`
}

func (h *ArticlesHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	h.list(w, r, true)
}

func (h *ArticlesHandler) ListAdmin(w http.ResponseWriter, r *http.Request) {
	h.list(w, r, false)
}

func (h *ArticlesHandler) list(w http.ResponseWriter, r *http.Request, publishedOnly bool) {
	q := h.db.WithContext(r.Context()).Model(&models.Article{})
	if publishedOnly {
		q = q.Where("status = ?", "published")
	}
	var items []models.Article
	if err := q.Order("COALESCE(published_at, created_at) DESC").Find(&items).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to list articles")
		return
	}
	if items == nil {
		items = []models.Article{}
	}
	writeData(w, http.StatusOK, items)
}

func (h *ArticlesHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	var item models.Article
	err := h.db.WithContext(r.Context()).
		Where("slug = ? AND status = ?", slug, "published").
		First(&item).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "not_found", "Article not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load article")
		return
	}
	writeData(w, http.StatusOK, item)
}

func (h *ArticlesHandler) GetAdmin(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid article id")
		return
	}
	item, err := h.getByID(r, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "not_found", "Article not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load article")
		return
	}
	writeData(w, http.StatusOK, item)
}

func (h *ArticlesHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in articleInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON body")
		return
	}
	in.Slug = clampString(in.Slug, 120)
	in.Title = clampString(in.Title, 200)
	in.Excerpt = clampString(in.Excerpt, 500)
	in.CoverURL = clampString(in.CoverURL, 2000)
	if !isValidSlug(in.Slug) || in.Title == "" {
		writeError(w, http.StatusBadRequest, "validation_error", "Valid slug and title are required")
		return
	}
	if in.Status != "published" {
		in.Status = "draft"
	}
	var publishedAt *time.Time
	if in.Status == "published" {
		now := time.Now().UTC()
		publishedAt = &now
	}

	item := models.Article{
		ID:           uuid.New(),
		Slug:         in.Slug,
		Title:        in.Title,
		Excerpt:      in.Excerpt,
		CoverAssetID: in.CoverAssetID,
		CoverURL:     in.CoverURL,
		BodyHTML:     in.BodyHTML,
		BodyGJS:      cleanJSON(in.BodyGJS),
		Status:       in.Status,
		PublishedAt:  publishedAt,
	}
	if err := h.db.WithContext(r.Context()).Create(&item).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to create article")
		return
	}
	writeData(w, http.StatusCreated, item)
}

func (h *ArticlesHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid article id")
		return
	}
	var in articleInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON body")
		return
	}
	in.Slug = clampString(in.Slug, 120)
	in.Title = clampString(in.Title, 200)
	in.Excerpt = clampString(in.Excerpt, 500)
	in.CoverURL = clampString(in.CoverURL, 2000)
	if !isValidSlug(in.Slug) || in.Title == "" {
		writeError(w, http.StatusBadRequest, "validation_error", "Valid slug and title are required")
		return
	}
	if in.Status != "published" {
		in.Status = "draft"
	}

	existing, err := h.getByID(r, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "not_found", "Article not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load article")
		return
	}

	publishedAt := existing.PublishedAt
	if in.Status == "published" && publishedAt == nil {
		now := time.Now().UTC()
		publishedAt = &now
	}
	if in.Status == "draft" {
		publishedAt = nil
	}

	existing.Slug = in.Slug
	existing.Title = in.Title
	existing.Excerpt = in.Excerpt
	existing.CoverAssetID = in.CoverAssetID
	existing.CoverURL = in.CoverURL
	existing.BodyHTML = in.BodyHTML
	existing.BodyGJS = cleanJSON(in.BodyGJS)
	existing.Status = in.Status
	existing.PublishedAt = publishedAt

	if err := h.db.WithContext(r.Context()).Save(&existing).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to update article")
		return
	}
	writeData(w, http.StatusOK, existing)
}

func (h *ArticlesHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid article id")
		return
	}
	res := h.db.WithContext(r.Context()).Delete(&models.Article{}, "id = ?", id)
	if res.Error != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to delete article")
		return
	}
	if res.RowsAffected == 0 {
		writeError(w, http.StatusNotFound, "not_found", "Article not found")
		return
	}
	writeData(w, http.StatusOK, map[string]string{"message": "deleted"})
}

func (h *ArticlesHandler) getByID(r *http.Request, id uuid.UUID) (models.Article, error) {
	var item models.Article
	err := h.db.WithContext(r.Context()).First(&item, "id = ?", id).Error
	return item, err
}

func cleanJSON(raw json.RawMessage) json.RawMessage {
	if len(raw) == 0 || string(raw) == "null" {
		return nil
	}
	return raw
}
