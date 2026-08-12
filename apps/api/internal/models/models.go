package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Asset struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PublicID         string    `gorm:"column:public_id;uniqueIndex;not null" json:"publicId"`
	URL              string    `gorm:"column:url;not null" json:"url"`
	SecureURL        string    `gorm:"column:secure_url;not null" json:"secureUrl"`
	ResourceType     string    `gorm:"column:resource_type;not null;default:image" json:"resourceType"`
	Format           *string   `gorm:"column:format" json:"format,omitempty"`
	Width            *int      `gorm:"column:width" json:"width,omitempty"`
	Height           *int      `gorm:"column:height" json:"height,omitempty"`
	Bytes            *int      `gorm:"column:bytes" json:"bytes,omitempty"`
	Folder           *string   `gorm:"column:folder" json:"folder,omitempty"`
	OriginalFilename *string   `gorm:"column:original_filename" json:"originalFilename,omitempty"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

func (Asset) TableName() string { return "cloudinary_assets" }

type Article struct {
	ID           uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Slug         string          `gorm:"uniqueIndex;not null" json:"slug"`
	Title        string          `gorm:"not null" json:"title"`
	Excerpt      string          `gorm:"not null;default:''" json:"excerpt"`
	CoverAssetID *uuid.UUID      `gorm:"type:uuid;column:cover_asset_id" json:"coverAssetId,omitempty"`
	CoverURL     string          `gorm:"column:cover_url;not null;default:''" json:"coverUrl"`
	BodyHTML     string          `gorm:"column:body_html;not null;default:''" json:"bodyHtml"`
	BodyGJS      json.RawMessage `gorm:"column:body_gjs;type:jsonb;serializer:json" json:"bodyGjs,omitempty"`
	Status       string          `gorm:"not null;default:draft" json:"status"`
	PublishedAt  *time.Time      `gorm:"column:published_at" json:"publishedAt,omitempty"`
	CreatedAt    time.Time       `json:"createdAt"`
	UpdatedAt    time.Time       `json:"updatedAt"`
}

func (Article) TableName() string { return "articles" }

type BoardHero struct {
	Eyebrow    string            `json:"eyebrow"`
	Title      string            `json:"title"`
	Subtitle   string            `json:"subtitle"`
	Background map[string]string `json:"background"`
}

type BoardSettings struct {
	ID        int16           `gorm:"primaryKey" json:"id"`
	Hero      json.RawMessage `gorm:"type:jsonb;serializer:json;not null" json:"hero"`
	UpdatedAt time.Time       `json:"updatedAt"`
}

func (BoardSettings) TableName() string { return "board_settings" }

type BoardPost struct {
	ID                  uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	MinistryID          uuid.UUID       `gorm:"type:uuid;column:ministry_id;not null;index" json:"ministryId"`
	Slug                string          `gorm:"not null" json:"slug"`
	Title               string          `gorm:"not null" json:"title"`
	Body                string          `gorm:"not null;default:''" json:"body"`
	BodyHTML            string          `gorm:"column:body_html;not null;default:''" json:"bodyHtml"`
	BodyGJS             json.RawMessage `gorm:"column:body_gjs;type:jsonb;serializer:json" json:"bodyGjs,omitempty"`
	DateLabel           string          `gorm:"column:date_label;not null;default:''" json:"dateLabel"`
	Tag                 *string         `json:"tag,omitempty"`
	Pinned              bool            `gorm:"not null;default:false" json:"pinned"`
	ImageSrc            *string         `gorm:"column:image_src" json:"imageSrc,omitempty"`
	ImageAlt            *string         `gorm:"column:image_alt" json:"imageAlt,omitempty"`
	ImageObjectPosition *string         `gorm:"column:image_object_position" json:"imageObjectPosition,omitempty"`
	Variant             *string         `json:"variant,omitempty"`
	Palette             *string         `json:"palette,omitempty"`
	Align               *string         `gorm:"column:align_text" json:"align,omitempty"`
	SortOrder           int             `gorm:"column:sort_order;not null;default:0" json:"sortOrder"`
	Status              string          `gorm:"not null;default:published" json:"status"`
	CreatedAt           time.Time       `json:"createdAt"`
	UpdatedAt           time.Time       `json:"updatedAt"`
}

func (BoardPost) TableName() string { return "board_posts" }

type BoardMinistry struct {
	ID                  uuid.UUID   `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Slug                string      `gorm:"uniqueIndex;not null" json:"slug"`
	Title               string      `gorm:"not null" json:"title"`
	Tagline             string      `gorm:"not null;default:''" json:"tagline"`
	ImageSrc            string      `gorm:"column:image_src;not null;default:''" json:"imageSrc"`
	ImageAlt            string      `gorm:"column:image_alt;not null;default:''" json:"imageAlt"`
	ImageObjectPosition string      `gorm:"column:image_object_position;not null;default:''" json:"imageObjectPosition"`
	SortOrder           int         `gorm:"column:sort_order;not null;default:0" json:"sortOrder"`
	Posts               []BoardPost `gorm:"foreignKey:MinistryID" json:"posts,omitempty"`
	CreatedAt           time.Time   `json:"createdAt"`
	UpdatedAt           time.Time   `json:"updatedAt"`
}

func (BoardMinistry) TableName() string { return "board_ministries" }

type BoardContent struct {
	Hero       json.RawMessage `json:"hero"`
	Ministries []BoardMinistry `json:"ministries"`
}

type Activity struct {
	ID          uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Slug        string          `gorm:"uniqueIndex;not null" json:"slug"`
	Name        string          `gorm:"not null" json:"name"`
	Description string          `gorm:"not null;default:''" json:"description"`
	DateLabel   string          `gorm:"column:date_label;not null;default:''" json:"dateLabel"`
	Href        string          `gorm:"not null;default:''" json:"href"`
	CTA         string          `gorm:"column:cta;not null;default:''" json:"cta"`
	ImageSrc    string          `gorm:"column:image_src;not null;default:''" json:"imageSrc"`
	ImageAlt    string          `gorm:"column:image_alt;not null;default:''" json:"imageAlt"`
	Icon        string          `gorm:"not null;default:calendar" json:"icon"`
	ClassName   string          `gorm:"column:class_name;not null;default:''" json:"className"`
	BodyHTML    string          `gorm:"column:body_html;not null;default:''" json:"bodyHtml"`
	BodyGJS     json.RawMessage `gorm:"column:body_gjs;type:jsonb;serializer:json" json:"bodyGjs,omitempty"`
	SortOrder   int             `gorm:"column:sort_order;not null;default:0" json:"sortOrder"`
	Status      string          `gorm:"not null;default:published" json:"status"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

func (Activity) TableName() string { return "upcoming_activities" }
