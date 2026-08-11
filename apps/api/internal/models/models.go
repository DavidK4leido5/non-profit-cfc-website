package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Asset struct {
	ID               uuid.UUID `json:"id"`
	PublicID         string    `json:"publicId"`
	URL              string    `json:"url"`
	SecureURL        string    `json:"secureUrl"`
	ResourceType     string    `json:"resourceType"`
	Format           *string   `json:"format,omitempty"`
	Width            *int      `json:"width,omitempty"`
	Height           *int      `json:"height,omitempty"`
	Bytes            *int      `json:"bytes,omitempty"`
	Folder           *string   `json:"folder,omitempty"`
	OriginalFilename *string   `json:"originalFilename,omitempty"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type Article struct {
	ID           uuid.UUID        `json:"id"`
	Slug         string           `json:"slug"`
	Title        string           `json:"title"`
	Excerpt      string           `json:"excerpt"`
	CoverAssetID *uuid.UUID       `json:"coverAssetId,omitempty"`
	CoverURL     string           `json:"coverUrl"`
	BodyHTML     string           `json:"bodyHtml"`
	BodyGJS      json.RawMessage  `json:"bodyGjs,omitempty"`
	Status       string           `json:"status"`
	PublishedAt  *time.Time       `json:"publishedAt,omitempty"`
	CreatedAt    time.Time        `json:"createdAt"`
	UpdatedAt    time.Time        `json:"updatedAt"`
}

type BoardHero struct {
	Eyebrow    string            `json:"eyebrow"`
	Title      string            `json:"title"`
	Subtitle   string            `json:"subtitle"`
	Background map[string]string `json:"background"`
}

type BoardPost struct {
	ID                  uuid.UUID       `json:"id"`
	MinistryID          uuid.UUID       `json:"ministryId"`
	Slug                string          `json:"slug"`
	Title               string          `json:"title"`
	Body                string          `json:"body"`
	BodyHTML            string          `json:"bodyHtml"`
	BodyGJS             json.RawMessage `json:"bodyGjs,omitempty"`
	DateLabel           string          `json:"dateLabel"`
	Tag                 *string         `json:"tag,omitempty"`
	Pinned              bool            `json:"pinned"`
	ImageSrc            *string         `json:"imageSrc,omitempty"`
	ImageAlt            *string         `json:"imageAlt,omitempty"`
	ImageObjectPosition *string         `json:"imageObjectPosition,omitempty"`
	Variant             *string         `json:"variant,omitempty"`
	Palette             *string         `json:"palette,omitempty"`
	Align               *string         `json:"align,omitempty"`
	SortOrder           int             `json:"sortOrder"`
	Status              string          `json:"status"`
	CreatedAt           time.Time       `json:"createdAt"`
	UpdatedAt           time.Time       `json:"updatedAt"`
}

type BoardMinistry struct {
	ID                  uuid.UUID   `json:"id"`
	Slug                string      `json:"slug"`
	Title               string      `json:"title"`
	Tagline             string      `json:"tagline"`
	ImageSrc            string      `json:"imageSrc"`
	ImageAlt            string      `json:"imageAlt"`
	ImageObjectPosition string      `json:"imageObjectPosition"`
	SortOrder           int         `json:"sortOrder"`
	Posts               []BoardPost `json:"posts,omitempty"`
	CreatedAt           time.Time   `json:"createdAt"`
	UpdatedAt           time.Time   `json:"updatedAt"`
}

type BoardContent struct {
	Hero       json.RawMessage `json:"hero"`
	Ministries []BoardMinistry `json:"ministries"`
}

type Activity struct {
	ID          uuid.UUID       `json:"id"`
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
	BodyGJS     json.RawMessage `json:"bodyGjs,omitempty"`
	SortOrder   int             `json:"sortOrder"`
	Status      string          `json:"status"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}
