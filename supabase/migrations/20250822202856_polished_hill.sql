/*
  # Adicionar configuração para desativar Supabase Storage

  1. Nova configuração
    - `supabase_storage_enabled` - Controla se o Supabase Storage está ativo
    - Por padrão ativo para compatibilidade com imagens existentes
    - Quando desativado, força uso exclusivo do Cloudinary

  2. Segurança
    - Apenas administradores podem alterar esta configuração
*/

-- Adicionar configuração para controlar Supabase Storage
INSERT INTO system_settings (key, value, description, is_encrypted) VALUES 
('supabase_storage_enabled', 'true', 'Habilita ou desabilita o uso do Supabase Storage. Quando desabilitado, força uso exclusivo do Cloudinary.', false)
ON CONFLICT (key) DO NOTHING;