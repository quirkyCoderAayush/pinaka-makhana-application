-- Update image_url column to support large base64 images
ALTER TABLE product MODIFY COLUMN image_url LONGTEXT;
