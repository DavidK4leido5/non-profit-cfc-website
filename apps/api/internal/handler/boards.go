package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/church-page/api/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BoardsHandler struct {
	db *gorm.DB
}

func NewBoardsHandler(db *gorm.DB) *BoardsHandler {
	return &BoardsHandler{db: db}
}

func (h *BoardsHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	h.getBoard(w, r, true)
}

func (h *BoardsHandler) GetAdmin(w http.ResponseWriter, r *http.Request) {
	h.getBoard(w, r, false)
}

func (h *BoardsHandler) getBoard(w http.ResponseWriter, r *http.Request, publishedOnly bool) {
	var settings models.BoardSettings
	err := h.db.WithContext(r.Context()).First(&settings, "id = ?", 1).Error
	hero := json.RawMessage(`{}`)
	if err == nil && len(settings.Hero) > 0 {
		hero = settings.Hero
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load board settings")
		return
	}

	ministries, err := h.listMinistries(r, publishedOnly)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load ministries")
		return
	}

	writeData(w, http.StatusOK, models.BoardContent{Hero: hero, Ministries: ministries})
}

func (h *BoardsHandler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Hero json.RawMessage `json:"hero"`
	}
	if err := decodeJSON(r, &body); err != nil || len(body.Hero) == 0 {
		writeError(w, http.StatusBadRequest, "invalid_json", "hero JSON is required")
		return
	}

	settings := models.BoardSettings{ID: 1, Hero: body.Hero}
	err := h.db.WithContext(r.Context()).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"hero", "updated_at"}),
	}).Create(&settings).Error
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to save board settings")
		return
	}
	writeData(w, http.StatusOK, map[string]any{"hero": body.Hero})
}

type ministryInput struct {
	Slug                string `json:"slug"`
	Title               string `json:"title"`
	Tagline             string `json:"tagline"`
	ImageSrc            string `json:"imageSrc"`
	ImageAlt            string `json:"imageAlt"`
	ImageObjectPosition string `json:"imageObjectPosition"`
	SortOrder           int    `json:"sortOrder"`
}

func (h *BoardsHandler) ListMinistries(w http.ResponseWriter, r *http.Request) {
	items, err := h.listMinistries(r, false)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to list ministries")
		return
	}
	writeData(w, http.StatusOK, items)
}

func (h *BoardsHandler) CreateMinistry(w http.ResponseWriter, r *http.Request) {
	var in ministryInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON body")
		return
	}
	in.Slug = clampString(in.Slug, 80)
	in.Title = clampString(in.Title, 160)
	if !isValidSlug(in.Slug) || in.Title == "" {
		writeError(w, http.StatusBadRequest, "validation_error", "Valid slug and title are required")
		return
	}

	item := models.BoardMinistry{
		ID:                  uuid.New(),
		Slug:                in.Slug,
		Title:               in.Title,
		Tagline:             clampString(in.Tagline, 300),
		ImageSrc:            clampString(in.ImageSrc, 2000),
		ImageAlt:            clampString(in.ImageAlt, 300),
		ImageObjectPosition: clampString(in.ImageObjectPosition, 80),
		SortOrder:           in.SortOrder,
	}
	if err := h.db.WithContext(r.Context()).Create(&item).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to create ministry")
		return
	}
	writeData(w, http.StatusCreated, item)
}

func (h *BoardsHandler) UpdateMinistry(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid ministry id")
		return
	}
	var in ministryInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON body")
		return
	}
	in.Slug = clampString(in.Slug, 80)
	in.Title = clampString(in.Title, 160)
	if !isValidSlug(in.Slug) || in.Title == "" {
		writeError(w, http.StatusBadRequest, "validation_error", "Valid slug and title are required")
		return
	}

	var item models.BoardMinistry
	if err := h.db.WithContext(r.Context()).First(&item, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "not_found", "Ministry not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to update ministry")
		return
	}

	item.Slug = in.Slug
	item.Title = in.Title
	item.Tagline = clampString(in.Tagline, 300)
	item.ImageSrc = clampString(in.ImageSrc, 2000)
	item.ImageAlt = clampString(in.ImageAlt, 300)
	item.ImageObjectPosition = clampString(in.ImageObjectPosition, 80)
	item.SortOrder = in.SortOrder

	if err := h.db.WithContext(r.Context()).Save(&item).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to update ministry")
		return
	}
	writeData(w, http.StatusOK, item)
}

func (h *BoardsHandler) DeleteMinistry(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid ministry id")
		return
	}
	res := h.db.WithContext(r.Context()).Delete(&models.BoardMinistry{}, "id = ?", id)
	if res.Error != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to delete ministry")
		return
	}
	if res.RowsAffected == 0 {
		writeError(w, http.StatusNotFound, "not_found", "Ministry not found")
		return
	}
	writeData(w, http.StatusOK, map[string]string{"message": "deleted"})
}

type postInput struct {
	Slug                string          `json:"slug"`
	Title               string          `json:"title"`
	Body                string          `json:"body"`
	BodyHTML            string          `json:"bodyHtml"`
	BodyGJS             json.RawMessage `json:"bodyGjs"`
	DateLabel           string          `json:"dateLabel"`
	Tag                 *string         `json:"tag"`
	Pinned              bool            `json:"pinned"`
	ImageSrc            *string         `json:"imageSrc"`
	ImageAlt            *string         `json:"imageAlt"`
	ImageObjectPosition *string         `json:"imageObjectPosition"`
	Variant             *string         `json:"variant"`
	Palette             *string         `json:"palette"`
	Align               *string         `json:"align"`
	SortOrder           int             `json:"sortOrder"`
	Status              string          `json:"status"`
}

func (h *BoardsHandler) ListPosts(w http.ResponseWriter, r *http.Request) {
	ministryID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid ministry id")
		return
	}
	posts, err := h.listPosts(r, ministryID, false)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to list posts")
		return
	}
	writeData(w, http.StatusOK, posts)
}

func (h *BoardsHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	ministryID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid ministry id")
		return
	}
	var in postInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON body")
		return
	}
	item, err := h.insertPost(r, ministryID, in)
	if err != nil {
		writeError(w, http.StatusBadRequest, "validation_error", err.Error())
		return
	}
	writeData(w, http.StatusCreated, item)
}

func (h *BoardsHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid post id")
		return
	}
	var in postInput
	if err := decodeJSON(r, &in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Invalid JSON body")
		return
	}
	in.Slug = clampString(in.Slug, 120)
	in.Title = clampString(in.Title, 200)
	if !isValidSlug(in.Slug) || in.Title == "" {
		writeError(w, http.StatusBadRequest, "validation_error", "Valid slug and title are required")
		return
	}
	if in.Status != "draft" {
		in.Status = "published"
	}

	var item models.BoardPost
	if err := h.db.WithContext(r.Context()).First(&item, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "not_found", "Post not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to update post")
		return
	}

	item.Slug = in.Slug
	item.Title = in.Title
	item.Body = clampString(in.Body, 4000)
	item.BodyHTML = in.BodyHTML
	item.BodyGJS = cleanJSON(in.BodyGJS)
	item.DateLabel = clampString(in.DateLabel, 40)
	item.Tag = in.Tag
	item.Pinned = in.Pinned
	item.ImageSrc = in.ImageSrc
	item.ImageAlt = in.ImageAlt
	item.ImageObjectPosition = in.ImageObjectPosition
	item.Variant = in.Variant
	item.Palette = in.Palette
	item.Align = in.Align
	item.SortOrder = in.SortOrder
	item.Status = in.Status

	if err := h.db.WithContext(r.Context()).Save(&item).Error; err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to update post")
		return
	}
	writeData(w, http.StatusOK, item)
}

func (h *BoardsHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid post id")
		return
	}
	var item models.BoardPost
	if err := h.db.WithContext(r.Context()).First(&item, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			writeError(w, http.StatusNotFound, "not_found", "Post not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load post")
		return
	}
	writeData(w, http.StatusOK, item)
}

func (h *BoardsHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid post id")
		return
	}
	res := h.db.WithContext(r.Context()).Delete(&models.BoardPost{}, "id = ?", id)
	if res.Error != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to delete post")
		return
	}
	if res.RowsAffected == 0 {
		writeError(w, http.StatusNotFound, "not_found", "Post not found")
		return
	}
	writeData(w, http.StatusOK, map[string]string{"message": "deleted"})
}

func (h *BoardsHandler) insertPost(r *http.Request, ministryID uuid.UUID, in postInput) (models.BoardPost, error) {
	in.Slug = clampString(in.Slug, 120)
	in.Title = clampString(in.Title, 200)
	if !isValidSlug(in.Slug) || in.Title == "" {
		return models.BoardPost{}, errValidation("Valid slug and title are required")
	}
	if in.Status != "draft" {
		in.Status = "published"
	}

	item := models.BoardPost{
		ID:                  uuid.New(),
		MinistryID:          ministryID,
		Slug:                in.Slug,
		Title:               in.Title,
		Body:                clampString(in.Body, 4000),
		BodyHTML:            in.BodyHTML,
		BodyGJS:             cleanJSON(in.BodyGJS),
		DateLabel:           clampString(in.DateLabel, 40),
		Tag:                 in.Tag,
		Pinned:              in.Pinned,
		ImageSrc:            in.ImageSrc,
		ImageAlt:            in.ImageAlt,
		ImageObjectPosition: in.ImageObjectPosition,
		Variant:             in.Variant,
		Palette:             in.Palette,
		Align:               in.Align,
		SortOrder:           in.SortOrder,
		Status:              in.Status,
	}
	if err := h.db.WithContext(r.Context()).Create(&item).Error; err != nil {
		return models.BoardPost{}, err
	}
	return item, nil
}

type validationError string

func (e validationError) Error() string { return string(e) }

func errValidation(msg string) error { return validationError(msg) }

func (h *BoardsHandler) listMinistries(r *http.Request, publishedOnly bool) ([]models.BoardMinistry, error) {
	var items []models.BoardMinistry
	if err := h.db.WithContext(r.Context()).
		Order("sort_order ASC, created_at ASC").
		Find(&items).Error; err != nil {
		return nil, err
	}
	for i := range items {
		posts, err := h.listPosts(r, items[i].ID, publishedOnly)
		if err != nil {
			return nil, err
		}
		items[i].Posts = posts
	}
	if items == nil {
		items = []models.BoardMinistry{}
	}
	return items, nil
}

func (h *BoardsHandler) listPosts(r *http.Request, ministryID uuid.UUID, publishedOnly bool) ([]models.BoardPost, error) {
	q := h.db.WithContext(r.Context()).Where("ministry_id = ?", ministryID)
	if publishedOnly {
		q = q.Where("status = ?", "published")
	}
	var items []models.BoardPost
	if err := q.Order("pinned DESC, sort_order ASC, created_at DESC").Find(&items).Error; err != nil {
		return nil, err
	}
	if items == nil {
		items = []models.BoardPost{}
	}
	return items, nil
}
