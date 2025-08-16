/*
  # Create parish website tables

  1. New Tables
    - `parishes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `history` (text)
      - `founded_year` (integer)
      - `address` (text)
      - `phone` (text)
      - `email` (text)
      - `logo_url` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `photos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, nullable)
      - `image_url` (text)
      - `category` (text with check constraint)
      - `created_at` (timestamp)
    
    - `slides`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
  
  2. Storage
    - Create bucket for parish photos with public access
  
  3. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated admin access
*/

-- Create parishes table
CREATE TABLE IF NOT EXISTS parishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  history text NOT NULL DEFAULT '',
  founded_year integer DEFAULT 1984,
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text,
  image_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'community',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_category CHECK (category IN ('history', 'events', 'celebrations', 'community'))
);

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE parishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read parishes"
  ON parishes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read photos"
  ON photos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read active slides"
  ON slides
  FOR SELECT
  TO public
  USING (is_active = true);

-- Create policies for authenticated users (admin access)
CREATE POLICY "Authenticated users can manage parishes"
  ON parishes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage photos"
  ON photos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage slides"
  ON slides
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('parish-photos', 'parish-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public can view photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'parish-photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'parish-photos');

CREATE POLICY "Authenticated users can update photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'parish-photos');

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'parish-photos');