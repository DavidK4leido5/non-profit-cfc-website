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

type BoardsHandler struct {
	pool *pgxpool.Pool
}

func NewBoardsHandler(pool *pgxpool.Pool) *BoardsHandler {
	return &BoardsHandler{pool: pool}
}

func (h *BoardsHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	h.getBoard(w, r, true)
}

func (h *BoardsHandler) GetAdmin(w http.ResponseWriter, r *http.Request) {
	h.getBoard(w, r, false)
}

func (h *BoardsHandler) getBoard(w http.ResponseWriter, r *http.Request, publishedOnly bool) {
	var hero json.RawMessage
	err := h.pool.QueryRow(r.Context(), `SELECT hero FROM board_settings WHERE id = 1`).Scan(&hero)
	if err != nil && err != pgx.ErrNoRows {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to load board settings")
		return
	}
	if hero == nil {
		hero = json.RawMessage(`{}`)
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

	_, err := h.pool.Exec(r.Context(), `
		INSERT INTO board_settings (id, hero, updated_at) VALUES (1, $1, now())
		ON CONFLICT (id) DO UPDATE SET hero = EXCLUDED.hero, updated_at = now()
	`, body.Hero)
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

	var item models.BoardMinistry
	err := h.pool.QueryRow(r.Context(), `
		INSERT INTO board_ministries (slug, title, tagline, image_src, image_alt, image_object_position, sort_order)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING id, slug, title, tagline, image_src, image_alt, image_object_position, sort_order, created_at, updated_at
	`, in.Slug, in.Title, clampString(in.Tagline, 300), clampString(in.ImageSrc, 2000), clampString(in.ImageAlt, 300),
		clampString(in.ImageObjectPosition, 80), in.SortOrder).Scan(
		&item.ID, &item.Slug, &item.Title, &item.Tagline, &item.ImageSrc, &item.ImageAlt,
		&item.ImageObjectPosition, &item.SortOrder, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
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
	err = h.pool.QueryRow(r.Context(), `
		UPDATE board_ministries
		SET slug=$2, title=$3, tagline=$4, image_src=$5, image_alt=$6, image_object_position=$7, sort_order=$8, updated_at=now()
		WHERE id=$1
		RETURNING id, slug, title, tagline, image_src, image_alt, image_object_position, sort_order, created_at, updated_at
	`, id, in.Slug, in.Title, clampString(in.Tagline, 300), clampString(in.ImageSrc, 2000), clampString(in.ImageAlt, 300),
		clampString(in.ImageObjectPosition, 80), in.SortOrder).Scan(
		&item.ID, &item.Slug, &item.Title, &item.Tagline, &item.ImageSrc, &item.ImageAlt,
		&item.ImageObjectPosition, &item.SortOrder, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "not_found", "Ministry not found")
			return
		}
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
	tag, err := h.pool.Exec(r.Context(), `DELETE FROM board_ministries WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to delete ministry")
		return
	}
	if tag.RowsAffected() == 0 {
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
	err = h.pool.QueryRow(r.Context(), `
		UPDATE board_posts SET
			slug=$2, title=$3, body=$4, body_html=$5, body_gjs=$6, date_label=$7, tag=$8, pinned=$9,
			image_src=$10, image_alt=$11, image_object_position=$12, variant=$13, palette=$14, align_text=$15,
			sort_order=$16, status=$17, updated_at=now()
		WHERE id=$1
		RETURNING id, ministry_id, slug, title, body, body_html, body_gjs, date_label, tag, pinned,
			image_src, image_alt, image_object_position, variant, palette, align_text, sort_order, status, created_at, updated_at
	`, id, in.Slug, in.Title, clampString(in.Body, 4000), in.BodyHTML, nullableJSON(in.BodyGJS), clampString(in.DateLabel, 40),
		in.Tag, in.Pinned, in.ImageSrc, in.ImageAlt, in.ImageObjectPosition, in.Variant, in.Palette, in.Align,
		in.SortOrder, in.Status).Scan(
		&item.ID, &item.MinistryID, &item.Slug, &item.Title, &item.Body, &item.BodyHTML, &item.BodyGJS,
		&item.DateLabel, &item.Tag, &item.Pinned, &item.ImageSrc, &item.ImageAlt, &item.ImageObjectPosition,
		&item.Variant, &item.Palette, &item.Align, &item.SortOrder, &item.Status, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			writeError(w, http.StatusNotFound, "not_found", "Post not found")
			return
		}
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
	err = h.pool.QueryRow(r.Context(), `
		SELECT id, ministry_id, slug, title, body, body_html, body_gjs, date_label, tag, pinned,
			image_src, image_alt, image_object_position, variant, palette, align_text, sort_order, status, created_at, updated_at
		FROM board_posts WHERE id = $1
	`, id).Scan(
		&item.ID, &item.MinistryID, &item.Slug, &item.Title, &item.Body, &item.BodyHTML, &item.BodyGJS,
		&item.DateLabel, &item.Tag, &item.Pinned, &item.ImageSrc, &item.ImageAlt, &item.ImageObjectPosition,
		&item.Variant, &item.Palette, &item.Align, &item.SortOrder, &item.Status, &item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
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
	tag, err := h.pool.Exec(r.Context(), `DELETE FROM board_posts WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "db_error", "Failed to delete post")
		return
	}
	if tag.RowsAffected() == 0 {
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

	var item models.BoardPost
	err := h.pool.QueryRow(r.Context(), `
		INSERT INTO board_posts (
			ministry_id, slug, title, body, body_html, body_gjs, date_label, tag, pinned,
			image_src, image_alt, image_object_position, variant, palette, align_text, sort_order, status
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
		RETURNING id, ministry_id, slug, title, body, body_html, body_gjs, date_label, tag, pinned,
			image_src, image_alt, image_object_position, variant, palette, align_text, sort_order, status, created_at, updated_at
	`, ministryID, in.Slug, in.Title, clampString(in.Body, 4000), in.BodyHTML, nullableJSON(in.BodyGJS), clampString(in.DateLabel, 40),
		in.Tag, in.Pinned, in.ImageSrc, in.ImageAlt, in.ImageObjectPosition, in.Variant, in.Palette, in.Align,
		in.SortOrder, in.Status).Scan(
		&item.ID, &item.MinistryID, &item.Slug, &item.Title, &item.Body, &item.BodyHTML, &item.BodyGJS,
		&item.DateLabel, &item.Tag, &item.Pinned, &item.ImageSrc, &item.ImageAlt, &item.ImageObjectPosition,
		&item.Variant, &item.Palette, &item.Align, &item.SortOrder, &item.Status, &item.CreatedAt, &item.UpdatedAt,
	)
	return item, err
}

type validationError string

func (e validationError) Error() string { return string(e) }

func errValidation(msg string) error { return validationError(msg) }

func (h *BoardsHandler) listMinistries(r *http.Request, publishedOnly bool) ([]models.BoardMinistry, error) {
	rows, err := h.pool.Query(r.Context(), `
		SELECT id, slug, title, tagline, image_src, image_alt, image_object_position, sort_order, created_at, updated_at
		FROM board_ministries
		ORDER BY sort_order ASC, created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.BoardMinistry, 0)
	for rows.Next() {
		var item models.BoardMinistry
		if err := rows.Scan(
			&item.ID, &item.Slug, &item.Title, &item.Tagline, &item.ImageSrc, &item.ImageAlt,
			&item.ImageObjectPosition, &item.SortOrder, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		posts, err := h.listPosts(r, item.ID, publishedOnly)
		if err != nil {
			return nil, err
		}
		item.Posts = posts
		items = append(items, item)
	}
	return items, rows.Err()
}

func (h *BoardsHandler) listPosts(r *http.Request, ministryID uuid.UUID, publishedOnly bool) ([]models.BoardPost, error) {
	query := `
		SELECT id, ministry_id, slug, title, body, body_html, body_gjs, date_label, tag, pinned,
			image_src, image_alt, image_object_position, variant, palette, align_text, sort_order, status, created_at, updated_at
		FROM board_posts WHERE ministry_id = $1`
	if publishedOnly {
		query += ` AND status = 'published'`
	}
	query += ` ORDER BY pinned DESC, sort_order ASC, created_at DESC`

	rows, err := h.pool.Query(r.Context(), query, ministryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.BoardPost, 0)
	for rows.Next() {
		var item models.BoardPost
		if err := rows.Scan(
			&item.ID, &item.MinistryID, &item.Slug, &item.Title, &item.Body, &item.BodyHTML, &item.BodyGJS,
			&item.DateLabel, &item.Tag, &item.Pinned, &item.ImageSrc, &item.ImageAlt, &item.ImageObjectPosition,
			&item.Variant, &item.Palette, &item.Align, &item.SortOrder, &item.Status, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
