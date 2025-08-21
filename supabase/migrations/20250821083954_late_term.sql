/*
  # Adicionar campos Cloudinary

  1. Alterações nas tabelas
    - Adicionar campo `cloudinary_public_id` em todas as tabelas que armazenam imagens
    - Manter compatibilidade com URLs existentes
    
  2. Tabelas afetadas
    - `photos` - Galeria de fotos
    - `slides` - Slides do carrossel
    - `blog_posts` - Imagens dos posts
    - `priests` - Fotos dos padres
    - `parishes` - Logo da paróquia
    - `timeline_events` - Imagens da linha do tempo
*/

-- Adicionar campo cloudinary_public_id na tabela photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'cloudinary_public_id'
  ) THEN
    ALTER TABLE photos ADD COLUMN cloudinary_public_id text;
  END IF;
END $$;

-- Adicionar campo cloudinary_public_id na tabela slides
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'slides' AND column_name = 'cloudinary_public_id'
  ) THEN
    ALTER TABLE slides ADD COLUMN cloudinary_public_id text;
  END IF;
END $$;

-- Adicionar campo cloudinary_public_id na tabela blog_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'cloudinary_public_id'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN cloudinary_public_id text;
  END IF;
END $$;

-- Adicionar campo cloudinary_public_id na tabela priests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'priests' AND column_name = 'cloudinary_public_id'
  ) THEN
    ALTER TABLE priests ADD COLUMN cloudinary_public_id text;
  END IF;
END $$;

-- Adicionar campo cloudinary_public_id na tabela parishes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parishes' AND column_name = 'cloudinary_public_id'
  ) THEN
    ALTER TABLE parishes ADD COLUMN cloudinary_public_id text;
  END IF;
END $$;

-- Adicionar campo cloudinary_public_id na tabela timeline_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timeline_events' AND column_name = 'cloudinary_public_id'
  ) THEN
    ALTER TABLE timeline_events ADD COLUMN cloudinary_public_id text;
  END IF;
END $$;

-- Criar índices para melhor performance nas consultas por cloudinary_public_id
CREATE INDEX IF NOT EXISTS photos_cloudinary_public_id_idx ON photos(cloudinary_public_id);
CREATE INDEX IF NOT EXISTS slides_cloudinary_public_id_idx ON slides(cloudinary_public_id);
CREATE INDEX IF NOT EXISTS blog_posts_cloudinary_public_id_idx ON blog_posts(cloudinary_public_id);
CREATE INDEX IF NOT EXISTS priests_cloudinary_public_id_idx ON priests(cloudinary_public_id);
CREATE INDEX IF NOT EXISTS parishes_cloudinary_public_id_idx ON parishes(cloudinary_public_id);
CREATE INDEX IF NOT EXISTS timeline_events_cloudinary_public_id_idx ON timeline_events(cloudinary_public_id);