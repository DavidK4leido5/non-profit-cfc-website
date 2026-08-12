package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/church-page/api/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ActivitiesHandler struct {
	db *gorm.DB
}

func NewActivitiesHandler(db *gorm.DB) *ActivitiesHandler {
	return &ActivitiesHandler{db: db}
}

type activityInput struct {
	Slug        string          `json:"slug"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	DateLabel   string          `json:"dateLabel"`
	Href        string          `json:"href"`
	CTA         string          `json:"cta"`
	ImageSrc    string          `json:"imageSrc"`
	ImageAlt    string          `json:"imageAlt"`
	Icon        string          `json:"icon"`
	ClassName   string          `json:"className"`
	BodyHTML    string          `json:"bodyHtml"`
	BodyGJS     json.RawMessage `json:"bodyGjs"`
	SortOrder   int             `json:"sortOrder"`
	Status      string          `json:"status"`
}

func (h *ActivitiesHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	h.list(w, r, true)
}

func (h *ActivitiesHandler) ListAdmin(w http.ResponseWriter, r *http.Request) {
	h.list(w, r, false)
}

func (h *ActivitiesHandler) list(w http.ResponseWriter, r *http.Request, publishedOnly bool) {
	q := h.db.WithContext(r.Context()).Model(&models.Activity{})
	if publishedOnly {
		q = q.Where("status = ?", "published")
	}
	var items []models.Activity
	if err := q.Order("sort_order ASC, created_at DESC").Find(&items).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to list activities")
		return
	}
	if items == nil {
		items = []models.Activity{}
	}
	writeData(w, http.StatusOK, items)
}

func (h *ActivitiesHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	item, err := h.getBySlug(r, slug, true)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "not_found", "Activity not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load activity")
		return
	}
	writeData(w, http.StatusOK, item)
}

func (h *ActivitiesHandler) GetAdmin(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid activity id")
		return
	}
	item, err := h.getByID(r, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "not_found", "Activity not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load activity")
		return
	}
	writeData(w, http.StatusOK, item)
}

func (h *ActivitiesHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in activityInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON body")
		return
	}
	item, status, msg := h.save(r, nil, in)
	if status != http.StatusCreated {
		writeError(w, status, "validation_error", msg)
		return
	}
	writeData(w, http.StatusCreated, item)
}

func (h *ActivitiesHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid activity id")
		return
	}
	var in activityInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON body")
		return
	}
	item, status, msg := h.save(r, &id, in)
	if status != http.StatusOK {
		code := "validation_error"
		if status == http.StatusNotFound {
			code = "not_found"
		} else if status >= 500 {
			code = "db_error"
		}
		writeError(w, status, code, msg)
		return
	}
	writeData(w, http.StatusOK, item)
}

func (h *ActivitiesHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid activity id")
		return
	}
	res := h.db.WithContext(r.Context()).Delete(&models.Activity{}, "id = ?", id)
	if res.Error != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to delete activity")
		return
	}
	if res.RowsAffected == 0 {
		writeError(w, http.StatusNotFound, "not_found", "Activity not found")
		return
	}
	writeData(w, http.StatusOK, map[string]string{"message": "deleted"})
}

func (h *ActivitiesHandler) save(r *http.Request, id *uuid.UUID, in activityInput) (models.Activity, int, string) {
	in.Slug = clampString(in.Slug, 120)
	in.Name = clampString(in.Name, 200)
	if !isValidSlug(in.Slug) || in.Name == "" {
		return models.Activity{}, http.StatusBadRequest, "Valid slug and name are required"
	}
	if in.Icon == "" {
		in.Icon = "calendar"
	}
	switch in.Icon {
	case "camp", "retreat", "calendar", "fellowship", "service":
	default:
		return models.Activity{}, http.StatusBadRequest, "Invalid icon"
	}
	if in.Status != "draft" {
		in.Status = "published"
	}

	fields := models.Activity{
		Slug:        in.Slug,
		Name:        in.Name,
		Description: clampString(in.Description, 1000),
		DateLabel:   clampString(in.DateLabel, 40),
		Href:        clampString(in.Href, 300),
		CTA:         clampString(in.CTA, 80),
		ImageSrc:    clampString(in.ImageSrc, 2000),
		ImageAlt:    clampString(in.ImageAlt, 300),
		Icon:        in.Icon,
		ClassName:   clampString(in.ClassName, 200),
		BodyHTML:    in.BodyHTML,
		BodyGJS:     cleanJSON(in.BodyGJS),
		SortOrder:   in.SortOrder,
		Status:      in.Status,
	}

	if id == nil {
		fields.ID = uuid.New()
		if err := h.db.WithContext(r.Context()).Create(&fields).Error; err != nil {
			return models.Activity{}, http.StatusInternalServerError, "Failed to create activity"
		}
		return fields, http.StatusCreated, ""
	}

	existing, err := h.getByID(r, *id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Activity{}, http.StatusNotFound, "Activity not found"
		}
		return models.Activity{}, http.StatusInternalServerError, "Failed to update activity"
	}

	fields.ID = existing.ID
	fields.CreatedAt = existing.CreatedAt
	if err := h.db.WithContext(r.Context()).Save(&fields).Error; err != nil {
		return models.Activity{}, http.StatusInternalServerError, "Failed to update activity"
	}
	return fields, http.StatusOK, ""
}

func (h *ActivitiesHandler) getByID(r *http.Request, id uuid.UUID) (models.Activity, error) {
	var item models.Activity
	err := h.db.WithContext(r.Context()).First(&item, "id = ?", id).Error
	return item, err
}

func (h *ActivitiesHandler) getBySlug(r *http.Request, slug string, publishedOnly bool) (models.Activity, error) {
	q := h.db.WithContext(r.Context()).Where("slug = ?", slug)
	if publishedOnly {
		q = q.Where("status = ?", "published")
	}
	var item models.Activity
	err := q.First(&item).Error
	return item, err
}
