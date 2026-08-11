package cloudinary

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"
)

type Config struct {
	CloudName string
	APIKey    string
	APISecret string
	Folder    string
}

type Client struct {
	cfg    Config
	client *http.Client
}

type UploadResult struct {
	PublicID         string `json:"public_id"`
	URL              string `json:"url"`
	SecureURL        string `json:"secure_url"`
	ResourceType     string `json:"resource_type"`
	Format           string `json:"format"`
	Width            int    `json:"width"`
	Height           int    `json:"height"`
	Bytes            int    `json:"bytes"`
	OriginalFilename string `json:"original_filename"`
}

func New(cfg Config) (*Client, error) {
	if cfg.CloudName == "" || cfg.APIKey == "" || cfg.APISecret == "" {
		return nil, fmt.Errorf("cloudinary cloud name, api key, and api secret are required")
	}
	if cfg.Folder == "" {
		cfg.Folder = "church-dev"
	}
	return &Client{
		cfg: cfg,
		client: &http.Client{
			Timeout: 60 * time.Second,
		},
	}, nil
}

func (c *Client) Upload(ctx context.Context, filename string, r io.Reader) (*UploadResult, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, err
	}
	if _, err := io.Copy(part, r); err != nil {
		return nil, err
	}
	_ = writer.WriteField("folder", c.cfg.Folder)
	_ = writer.Close()

	endpoint := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/upload", url.PathEscape(c.cfg.CloudName))
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, &body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.SetBasicAuth(c.cfg.APIKey, c.cfg.APISecret)

	res, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	payload, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	if res.StatusCode >= 300 {
		return nil, fmt.Errorf("cloudinary upload failed (%d): %s", res.StatusCode, strings.TrimSpace(string(payload)))
	}

	var out UploadResult
	if err := json.Unmarshal(payload, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *Client) Destroy(ctx context.Context, publicID string) error {
	form := url.Values{}
	form.Set("public_id", publicID)

	endpoint := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/destroy", url.PathEscape(c.cfg.CloudName))
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetBasicAuth(c.cfg.APIKey, c.cfg.APISecret)

	res, err := c.client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	payload, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}
	if res.StatusCode >= 300 {
		return fmt.Errorf("cloudinary destroy failed (%d): %s", res.StatusCode, strings.TrimSpace(string(payload)))
	}
	return nil
}

func FolderFromPublicID(publicID string) string {
	dir := path.Dir(publicID)
	if dir == "." {
		return ""
	}
	return dir
}
