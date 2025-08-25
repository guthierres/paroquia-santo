/*
  # Atualizar ano de fundação padrão

  1. Alterações
    - Atualizar ano padrão de fundação de 1984 para 1985
    - Atualizar registros existentes se necessário
    - Atualizar eventos da timeline
*/

-- Atualizar ano padrão na tabela parishes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parishes' AND column_name = 'founded_year'
  ) THEN
    -- Atualizar registros existentes com ano 1984 para 1985
    UPDATE parishes 
    SET founded_year = 1985, updated_at = now()
    WHERE founded_year = 1984;
  END IF;
END $$;

-- Atualizar eventos da timeline se existirem
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'timeline_events'
  ) THEN
    -- Atualizar evento de fundação se existir
    UPDATE timeline_events 
    SET year = 1985
    WHERE year = 1984 AND title ILIKE '%fundação%';
  END IF;
END $$;