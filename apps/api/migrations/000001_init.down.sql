-- +migrate Down
DROP TABLE IF EXISTS upcoming_activities;
DROP TABLE IF EXISTS board_posts;
DROP TABLE IF EXISTS board_ministries;
DROP TABLE IF EXISTS board_settings;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS cloudinary_assets;
