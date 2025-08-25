/*
  # Criar tabela de Pastorais

  1. Nova Tabela
    - `pastorals`
      - `id` (uuid, primary key)
      - `name` (text, nome da pastoral)
      - `coordinator` (text, nome do coordenador)
      - `description` (text, descrição da pastoral)
      - `contact_phone` (text, telefone de contato)
      - `is_active` (boolean, se está ativa)
      - `order_index` (integer, ordem de exibição)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Enable RLS na tabela `pastorals`
    - Política para leitura pública de pastorais ativas
    - Política para gerenciamento por usuários autenticados
*/

CREATE TABLE IF NOT EXISTS pastorals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  coordinator text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  contact_phone text DEFAULT '',
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE pastorals ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Public can read active pastorals"
  ON pastorals
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage pastorals"
  ON pastorals
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS pastorals_active_idx ON pastorals (is_active, order_index);
CREATE INDEX IF NOT EXISTS pastorals_order_idx ON pastorals (order_index);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_pastorals_updated_at ON pastorals;
CREATE TRIGGER update_pastorals_updated_at
    BEFORE UPDATE ON pastorals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas pastorais de exemplo
INSERT INTO pastorals (name, coordinator, description, contact_phone, order_index) VALUES
('Pastoral da Criança', 'Maria Santos', 'Acompanhamento e cuidado das crianças da comunidade, promovendo seu desenvolvimento integral através de atividades educativas, recreativas e espirituais. Trabalhamos com crianças de 0 a 6 anos e suas famílias.', '(11) 99999-1111', 1),
('Pastoral da Juventude', 'João Silva', 'Formação e evangelização dos jovens da paróquia através de encontros, retiros e atividades missionárias. Nosso objetivo é formar jovens cristãos comprometidos com a fé e a sociedade.', '(11) 99999-2222', 2),
('Pastoral Familiar', 'Ana Costa', 'Fortalecimento dos vínculos familiares através da Palavra de Deus, oferecendo orientação, apoio e formação para casais e famílias da comunidade paroquial.', '(11) 99999-3333', 3),
('Pastoral da Saúde', 'Dr. Carlos Oliveira', 'Cuidado integral da pessoa humana, visitando enfermos, promovendo a saúde preventiva e oferecendo apoio espiritual aos que sofrem. Trabalhamos em hospitais, casas de repouso e domicílios.', '(11) 99999-4444', 4),
('Pastoral Social', 'Luiza Ferreira', 'Promoção da justiça social e cuidado com os mais necessitados através de ações concretas de caridade, distribuição de alimentos e apoio a famílias em situação de vulnerabilidade.', '(11) 99999-5555', 5),
('Ministério da Eucaristia', 'Pedro Almeida', 'Formação e coordenação dos Ministros Extraordinários da Sagrada Comunhão, levando a Eucaristia aos enfermos e auxiliando nas celebrações litúrgicas da paróquia.', '(11) 99999-6666', 6)
ON CONFLICT DO NOTHING;