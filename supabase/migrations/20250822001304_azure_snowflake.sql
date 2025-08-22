/*
  # Criar tabela de eventos e avisos paroquiais

  1. Nova Tabela
    - `parish_announcements`
      - `id` (uuid, primary key)
      - `type` (text, 'event' ou 'announcement')
      - `title` (text, título do evento/aviso)
      - `content` (text, descrição completa)
      - `event_date` (timestamptz, data e hora do evento)
      - `is_published` (boolean, se está publicado)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Enable RLS na tabela `parish_announcements`
    - Política para usuários autenticados gerenciarem
    - Política para público ler apenas publicados
*/

CREATE TABLE IF NOT EXISTS parish_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'announcement',
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  event_date timestamptz,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('event', 'announcement'))
);

ALTER TABLE parish_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage announcements"
  ON parish_announcements
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read published announcements"
  ON parish_announcements
  FOR SELECT
  TO public
  USING (is_published = true);

-- Índices para performance
CREATE INDEX parish_announcements_published_idx ON parish_announcements (is_published, event_date DESC);
CREATE INDEX parish_announcements_type_idx ON parish_announcements (type, event_date DESC);
CREATE INDEX parish_announcements_date_idx ON parish_announcements (event_date DESC);