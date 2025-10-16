/*
  # Create Site Settings Table
  
  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Identificador único da configuração
      - `logo_url` (text, nullable) - URL do logo
      - `logo_alt` (text, nullable) - Texto alternativo do logo
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `site_settings` table
    - Add policy for public read access
    - Add policy for authenticated users to manage settings
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  logo_url text,
  logo_alt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site settings"
  ON site_settings
  FOR DELETE
  TO authenticated
  USING (true);