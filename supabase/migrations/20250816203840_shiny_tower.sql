/*
  # Criar tabelas para Blog e Horários

  1. Novas Tabelas
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, título do post)
      - `content` (text, conteúdo HTML do post)
      - `excerpt` (text, resumo do post)
      - `featured_image` (text, URL da imagem destacada)
      - `author` (text, nome do autor)
      - `is_published` (boolean, se está publicado)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `schedules`
      - `id` (uuid, primary key)
      - `day_of_week` (text, dia da semana)
      - `time` (text, horário)
      - `description` (text, descrição da celebração)
      - `is_active` (boolean, se está ativo)
      - `created_at` (timestamp)

  2. Segurança
    - Enable RLS em ambas as tabelas
    - Políticas para leitura pública e gerenciamento por usuários autenticados
*/

-- Criar tabela de posts do blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  excerpt text DEFAULT '',
  featured_image text,
  author text NOT NULL DEFAULT 'Administrador',
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de horários
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week text NOT NULL DEFAULT 'sunday',
  time text NOT NULL DEFAULT '',
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Políticas para blog_posts
CREATE POLICY "Public can read published posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para schedules
CREATE POLICY "Public can read active schedules"
  ON schedules
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage schedules"
  ON schedules
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS schedules_active_idx ON schedules (is_active, day_of_week);