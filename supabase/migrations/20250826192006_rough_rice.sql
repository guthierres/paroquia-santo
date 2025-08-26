/*
  # Criar tabela de pop-ups urgentes

  1. Nova Tabela
    - `urgent_popups`
      - `id` (uuid, primary key)
      - `title` (text, título do pop-up)
      - `content` (text, conteúdo/descrição)
      - `image_url` (text, URL da imagem)
      - `cloudinary_public_id` (text, ID do Cloudinary)
      - `link_url` (text, URL do botão de ação)
      - `link_text` (text, texto do botão)
      - `is_active` (boolean, se está ativo)
      - `priority` (integer, prioridade de exibição)
      - `auto_close_seconds` (integer, segundos para fechar automaticamente)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Enable RLS na tabela
    - Política para leitura pública de pop-ups ativos
    - Política para gerenciamento por usuários autenticados
*/

CREATE TABLE IF NOT EXISTS urgent_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image_url text,
  cloudinary_public_id text,
  link_url text,
  link_text text DEFAULT 'Saiba mais',
  is_active boolean DEFAULT false,
  priority integer DEFAULT 1,
  auto_close_seconds integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE urgent_popups ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Public can read active popups"
  ON urgent_popups
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage popups"
  ON urgent_popups
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS urgent_popups_active_idx ON urgent_popups (is_active, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS urgent_popups_priority_idx ON urgent_popups (priority DESC);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_urgent_popups_updated_at ON urgent_popups;
CREATE TRIGGER update_urgent_popups_updated_at
    BEFORE UPDATE ON urgent_popups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();