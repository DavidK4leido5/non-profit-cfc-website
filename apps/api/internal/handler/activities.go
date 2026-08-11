package handler

import (
	"encoding/json"
	"net/http"

	"github.com/church-page/api/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ActivitiesHandler struct {
	pool *pgxpool.Pool
}

func NewActivitiesHandler(pool *pgxpool.Pool) *ActivitiesHandler {
	return &ActivitiesHandler{pool: pool}
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
	query := `
		SELECT id, slug, name, description, date_label, href, cta, image_src, image_alt, icon, class_name,
			body_html, body_gjs, sort_order, status, created_at, updated_at
		FROM upcoming_activities`
	if publishedOnly {
		query += ` WHERE status = 'published'`
	}
	query += ` ORDER BY sort_order ASC, created_at DESC`

	rows, err := h.pool.Query(r.Context(), query)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to list activities")
		return
	}
	defer rows.Close()

	items := make([]models.Activity, 0)
	for rows.Next() {
		item, err := scanActivity(rows)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "db_error", "Failed to scan activity")
			return
		}
		items = append(items, item)
	}
	writeData(w, http.StatusOK, items)
}

func (h *ActivitiesHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	item, err := h.getBySlug(r, slug, true)
	if err != nil {
		if err == pgx.ErrNoRows {
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
		if err == pgx.ErrNoRows {
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
		writeError(w, status, "validation_error", msg)
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
	tag, err := h.pool.Exec(r.Context(), `DELETE FROM upcoming_activities WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to delete activity")
		return
	}
	if tag.RowsAffected() == 0 {
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

	var item models.Activity
	var err error
	if id == nil {
		err = h.pool.QueryRow(r.Context(), `
			INSERT INTO upcoming_activities (
				slug, name, description, date_label, href, cta, image_src, image_alt, icon, class_name,
				body_html, body_gjs, sort_order, status
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
			RETURNING id, slug, name, description, date_label, href, cta, image_src, image_alt, icon, class_name,
				body_html, body_gjs, sort_order, status, created_at, updated_at
		`, in.Slug, in.Name, clampString(in.Description, 1000), clampString(in.DateLabel, 40), clampString(in.Href, 300),
			clampString(in.CTA, 80), clampString(in.ImageSrc, 2000), clampString(in.ImageAlt, 300), in.Icon,
			clampString(in.ClassName, 200), in.BodyHTML, nullableJSON(in.BodyGJS), in.SortOrder, in.Status).Scan(
			&item.ID, &item.Slug, &item.Name, &item.Description, &item.DateLabel, &item.Href, &item.CTA,
			&item.ImageSrc, &item.ImageAlt, &item.Icon, &item.ClassName, &item.BodyHTML, &item.BodyGJS,
			&item.SortOrder, &item.Status, &item.CreatedAt, &item.UpdatedAt,
		)
		if err != nil {
			return models.Activity{}, http.StatusInternalServerError, "Failed to create activity"
		}
		return item, http.StatusCreated, ""
	}

	err = h.pool.QueryRow(r.Context(), `
		UPDATE upcoming_activities SET
			slug=$2, name=$3, description=$4, date_label=$5, href=$6, cta=$7, image_src=$8, image_alt=$9,
			icon=$10, class_name=$11, body_html=$12, body_gjs=$13, sort_order=$14, status=$15, updated_at=now()
		WHERE id=$1
		RETURNING id, slug, name, description, date_label, href, cta, image_src, image_alt, icon, class_name,
			body_html, body_gjs, sort_order, status, created_at, updated_at
	`, *id, in.Slug, in.Name, clampString(in.Description, 1000), clampString(in.DateLabel, 40), clampString(in.Href, 300),
		clampString(in.CTA, 80), clampString(in.ImageSrc, 2000), clampString(in.ImageAlt, 300), in.Icon,
		clampString(in.ClassName, 200), in.BodyHTML, nullableJSON(in.BodyGJS), in.SortOrder, in.Status).Scan(
		&item.ID, &item.Slug, &item.Name, &item.Description, &item.DateLabel, &item.Href, &item.CTA,
		&item.ImageSrc, &item.ImageAlt, &item.Icon, &item.ClassName, &item.BodyHTML, &item.BodyGJS,
		&item.SortOrder, &item.Status, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return models.Activity{}, http.StatusNotFound, "Activity not found"
		}
		return models.Activity{}, http.StatusInternalServerError, "Failed to update activity"
	}
	return item, http.StatusOK, ""
}

func (h *ActivitiesHandler) getByID(r *http.Request, id uuid.UUID) (models.Activity, error) {
	var item models.Activity
	err := h.pool.QueryRow(r.Context(), `
		SELECT id, slug, name, description, date_label, href, cta, image_src, image_alt, icon, class_name,
			body_html, body_gjs, sort_order, status, created_at, updated_at
		FROM upcoming_activities WHERE id = $1
	`, id).Scan(
		&item.ID, &item.Slug, &item.Name, &item.Description, &item.DateLabel, &item.Href, &item.CTA,
		&item.ImageSrc, &item.ImageAlt, &item.Icon, &item.ClassName, &item.BodyHTML, &item.BodyGJS,
		&item.SortOrder, &item.Status, &item.CreatedAt, &item.UpdatedAt,
	)
	return item, err
}

func (h *ActivitiesHandler) getBySlug(r *http.Request, slug string, publishedOnly bool) (models.Activity, error) {
	query := `
		SELECT id, slug, name, description, date_label, href, cta, image_src, image_alt, icon, class_name,
			body_html, body_gjs, sort_order, status, created_at, updated_at
		FROM upcoming_activities WHERE slug = $1`
	if publishedOnly {
		query += ` AND status = 'published'`
	}
	var item models.Activity
	err := h.pool.QueryRow(r.Context(), query, slug).Scan(
		&item.ID, &item.Slug, &item.Name, &item.Description, &item.DateLabel, &item.Href, &item.CTA,
		&item.ImageSrc, &item.ImageAlt, &item.Icon, &item.ClassName, &item.BodyHTML, &item.BodyGJS,
		&item.SortOrder, &item.Status, &item.CreatedAt, &item.UpdatedAt,
	)
	return item, err
}

func scanActivity(row scannable) (models.Activity, error) {
	var item models.Activity
	err := row.Scan(
		&item.ID, &item.Slug, &item.Name, &item.Description, &item.DateLabel, &item.Href, &item.CTA,
		&item.ImageSrc, &item.ImageAlt, &item.Icon, &item.ClassName, &item.BodyHTML, &item.BodyGJS,
		&item.SortOrder, &item.Status, &item.CreatedAt, &item.UpdatedAt,
	)
	return item, err
}
