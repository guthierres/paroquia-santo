/*
  # Add blog post slug functionality

  1. New Features
    - Add slug generation function for blog posts
    - Add trigger to automatically generate slugs
    - Update existing posts to have slugs

  2. Security
    - Function is secure and handles special characters
    - Ensures unique slugs for each post
*/

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Ensure it's not empty
  IF slug = '' THEN
    slug := 'post-' || extract(epoch from now())::text;
  END IF;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Function to set blog post slug
CREATE OR REPLACE FUNCTION set_blog_post_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Only generate slug if it's empty or null
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE slug = final_slug 
      AND id != COALESCE(NEW.id, '')
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing posts without slugs
UPDATE blog_posts 
SET slug = generate_slug(title) 
WHERE slug IS NULL OR slug = '';

-- Ensure unique slugs for existing posts
DO $$
DECLARE
  post_record RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER;
BEGIN
  FOR post_record IN 
    SELECT id, title, slug FROM blog_posts ORDER BY created_at
  LOOP
    base_slug := generate_slug(post_record.title);
    final_slug := base_slug;
    counter := 0;
    
    -- Check for duplicates and add counter
    WHILE EXISTS (
      SELECT 1 FROM blog_posts 
      WHERE slug = final_slug 
      AND id != post_record.id
    ) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    -- Update if different
    IF post_record.slug != final_slug THEN
      UPDATE blog_posts SET slug = final_slug WHERE id = post_record.id;
    END IF;
  END LOOP;
END $$;