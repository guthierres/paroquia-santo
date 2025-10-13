/*
  # Create programs table

  1. New Tables
    - `programs`
      - `id` (uuid, primary key)
      - `title` (text) - Program title
      - `description` (text) - Program description
      - `featured_image` (text) - Featured image URL
      - `days_of_week` (jsonb) - Array of selected days
      - `time` (text) - Program time
      - `slug` (text, unique) - URL slug for the program
      - `is_active` (boolean) - Whether the program is active
      - `order_index` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `programs` table
    - Add policy for public read access
    - Add policy for authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  featured_image text,
  days_of_week jsonb DEFAULT '[]'::jsonb,
  time text NOT NULL,
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active programs"
  ON programs
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all programs"
  ON programs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert programs"
  ON programs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update programs"
  ON programs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete programs"
  ON programs
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS programs_slug_idx ON programs(slug);
CREATE INDEX IF NOT EXISTS programs_is_active_idx ON programs(is_active);
CREATE INDEX IF NOT EXISTS programs_order_index_idx ON programs(order_index);