package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/church-page/api/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ArticlesHandler struct {
	pool *pgxpool.Pool
}

func NewArticlesHandler(pool *pgxpool.Pool) *ArticlesHandler {
	return &ArticlesHandler{pool: pool}
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
	query := `
		SELECT id, slug, title, excerpt, cover_asset_id, cover_url, body_html, body_gjs, status, published_at, created_at, updated_at
		FROM articles`
	if publishedOnly {
		query += ` WHERE status = 'published'`
	}
	query += ` ORDER BY COALESCE(published_at, created_at) DESC`

	rows, err := h.pool.Query(r.Context(), query)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to list articles")
		return
	}
	defer rows.Close()

	items := make([]models.Article, 0)
	for rows.Next() {
		item, err := scanArticle(rows)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "db_error", "Failed to scan article")
			return
		}
		items = append(items, item)
	}
	writeData(w, http.StatusOK, items)
}

func (h *ArticlesHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	var item models.Article
	err := h.pool.QueryRow(r.Context(), `
		SELECT id, slug, title, excerpt, cover_asset_id, cover_url, body_html, body_gjs, status, published_at, created_at, updated_at
		FROM articles WHERE slug = $1 AND status = 'published'
	`, slug).Scan(
		&item.ID, &item.Slug, &item.Title, &item.Excerpt, &item.CoverAssetID, &item.CoverURL,
		&item.BodyHTML, &item.BodyGJS, &item.Status, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
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
		if err == pgx.ErrNoRows {
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

	var item models.Article
	err := h.pool.QueryRow(r.Context(), `
		INSERT INTO articles (slug, title, excerpt, cover_asset_id, cover_url, body_html, body_gjs, status, published_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id, slug, title, excerpt, cover_asset_id, cover_url, body_html, body_gjs, status, published_at, created_at, updated_at
	`, in.Slug, in.Title, in.Excerpt, in.CoverAssetID, in.CoverURL, in.BodyHTML, nullableJSON(in.BodyGJS), in.Status, publishedAt).Scan(
		&item.ID, &item.Slug, &item.Title, &item.Excerpt, &item.CoverAssetID, &item.CoverURL,
		&item.BodyHTML, &item.BodyGJS, &item.Status, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
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
		if err == pgx.ErrNoRows {
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

	var item models.Article
	err = h.pool.QueryRow(r.Context(), `
		UPDATE articles
		SET slug=$2, title=$3, excerpt=$4, cover_asset_id=$5, cover_url=$6, body_html=$7, body_gjs=$8, status=$9, published_at=$10, updated_at=now()
		WHERE id=$1
		RETURNING id, slug, title, excerpt, cover_asset_id, cover_url, body_html, body_gjs, status, published_at, created_at, updated_at
	`, id, in.Slug, in.Title, in.Excerpt, in.CoverAssetID, in.CoverURL, in.BodyHTML, nullableJSON(in.BodyGJS), in.Status, publishedAt).Scan(
		&item.ID, &item.Slug, &item.Title, &item.Excerpt, &item.CoverAssetID, &item.CoverURL,
		&item.BodyHTML, &item.BodyGJS, &item.Status, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to update article")
		return
	}
	writeData(w, http.StatusOK, item)
}

func (h *ArticlesHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_id", "Invalid article id")
		return
	}
	tag, err := h.pool.Exec(r.Context(), `DELETE FROM articles WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to delete article")
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "not_found", "Article not found")
		return
	}
	writeData(w, http.StatusOK, map[string]string{"message": "deleted"})
}

func (h *ArticlesHandler) getByID(r *http.Request, id uuid.UUID) (models.Article, error) {
	var item models.Article
	err := h.pool.QueryRow(r.Context(), `
		SELECT id, slug, title, excerpt, cover_asset_id, cover_url, body_html, body_gjs, status, published_at, created_at, updated_at
		FROM articles WHERE id = $1
	`, id).Scan(
		&item.ID, &item.Slug, &item.Title, &item.Excerpt, &item.CoverAssetID, &item.CoverURL,
		&item.BodyHTML, &item.BodyGJS, &item.Status, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt,
	)
	return item, err
}

type scannable interface {
	Scan(dest ...any) error
}

func scanArticle(row scannable) (models.Article, error) {
	var item models.Article
	err := row.Scan(
		&item.ID, &item.Slug, &item.Title, &item.Excerpt, &item.CoverAssetID, &item.CoverURL,
		&item.BodyHTML, &item.BodyGJS, &item.Status, &item.PublishedAt, &item.CreatedAt, &item.UpdatedAt,
	)
	return item, err
}

func nullableJSON(raw json.RawMessage) any {
	if len(raw) == 0 || string(raw) == "null" {
		return nil
	}
	return raw
}
