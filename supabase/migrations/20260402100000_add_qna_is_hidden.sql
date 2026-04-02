-- Add is_hidden column to qna_posts for admin hide feature
ALTER TABLE qna_posts ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false;
