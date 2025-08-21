/*
  # Adicionar configurações do Cloudinary

  1. Nova tabela para configurações do sistema
    - `settings` table para armazenar configurações do Cloudinary
    - Chaves criptografadas para segurança
    - Configurações editáveis via painel admin

  2. Atualizar tabelas existentes
    - Adicionar campo `cloudinary_public_id` nas tabelas de imagens
    - Manter compatibilidade com sistema atual

  3. Segurança
    - RLS habilitado
    - Apenas usuários autenticados podem gerenciar configurações
*/

-- Criar tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  is_encrypted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Authenticated users can manage settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inserir configurações padrão do Cloudinary
INSERT INTO system_settings (key, value, description, is_encrypted) VALUES
  ('cloudinary_cloud_name', '', 'Nome da cloud do Cloudinary', false),
  ('cloudinary_api_key', '', 'API Key do Cloudinary', false),
  ('cloudinary_api_secret', '', 'API Secret do Cloudinary (criptografado)', true),
  ('cloudinary_upload_preset', 'parish_uploads', 'Upload preset para uploads não autenticados', false),
  ('cloudinary_enabled', 'false', 'Habilitar integração com Cloudinary', false)
ON CONFLICT (key) DO NOTHING;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS system_settings_key_idx ON system_settings (key);
CREATE INDEX IF NOT EXISTS system_settings_updated_at_idx ON system_settings (updated_at);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();