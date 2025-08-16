/*
  # Create timeline events table

  1. New Tables
    - `timeline_events`
      - `id` (uuid, primary key)
      - `year` (integer)
      - `title` (text)
      - `description` (text)
      - `image_url` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `timeline_events` table
    - Add policy for public read access
    - Add policy for authenticated admin access
*/

-- Create timeline_events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL DEFAULT 1984,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read timeline events"
  ON timeline_events
  FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users (admin access)
CREATE POLICY "Authenticated users can manage timeline events"
  ON timeline_events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS timeline_events_year_idx ON timeline_events(year);