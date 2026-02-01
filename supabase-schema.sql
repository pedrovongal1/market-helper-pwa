-- ====================================
-- MARKET HELPER - SCHEMA DO BANCO DE DADOS
-- Supabase PostgreSQL
-- ====================================

-- ===== TABELA DE LISTAS =====
CREATE TABLE IF NOT EXISTS listas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  orcamento DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_gasto DECIMAL(10, 2) DEFAULT 0,
  total_comprado DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_listas_user_id ON listas(user_id);
CREATE INDEX IF NOT EXISTS idx_listas_status ON listas(status);
CREATE INDEX IF NOT EXISTS idx_listas_created_at ON listas(created_at DESC);

-- ===== TABELA DE PRODUTOS =====
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lista_id UUID REFERENCES listas(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10, 2) DEFAULT 1,
  unidade VARCHAR(20) DEFAULT 'un',
  preco_unitario DECIMAL(10, 2) DEFAULT 0,
  preco_total DECIMAL(10, 2) DEFAULT 0,
  comprado BOOLEAN DEFAULT FALSE,
  categoria VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_lista_id ON produtos(lista_id);
CREATE INDEX IF NOT EXISTS idx_produtos_comprado ON produtos(comprado);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);

-- ===== TABELA DE CATEGORIAS (OPCIONAL) =====
CREATE TABLE IF NOT EXISTS categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  icone VARCHAR(50),
  cor VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categorias padrão
INSERT INTO categorias (nome, icone, cor) VALUES
  ('Frutas e Verduras', '🥬', '#10b981'),
  ('Carnes e Frangos', '🥩', '#ef4444'),
  ('Laticínios', '🧀', '#f59e0b'),
  ('Bebidas', '🥤', '#3b82f6'),
  ('Limpeza', '🧹', '#8b5cf6'),
  ('Higiene', '🧼', '#ec4899'),
  ('Padaria', '🍞', '#f97316'),
  ('Mercearia', '🛒', '#6366f1'),
  ('Congelados', '🧊', '#06b6d4'),
  ('Outros', '📦', '#6b7280')
ON CONFLICT (nome) DO NOTHING;

-- ===== TABELA DE PERFIL DO USUÁRIO =====
CREATE TABLE IF NOT EXISTS perfis (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome VARCHAR(255),
  avatar_url TEXT,
  preferencias JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE =====
CREATE OR REPLACE FUNCTION criar_perfil_automatico()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfis (id, nome)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_criar_perfil
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION criar_perfil_automatico();

-- ===== TRIGGER PARA ATUALIZAR updated_at =====
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_listas_updated_at
  BEFORE UPDATE ON listas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_perfis_updated_at
  BEFORE UPDATE ON perfis
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_updated_at();

-- ===== ROW LEVEL SECURITY (RLS) =====

-- Habilitar RLS
ALTER TABLE listas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- Políticas para LISTAS
-- Usuários só podem ver suas próprias listas
CREATE POLICY "Usuários podem ver suas listas"
  ON listas FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias listas
CREATE POLICY "Usuários podem criar listas"
  ON listas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias listas
CREATE POLICY "Usuários podem atualizar suas listas"
  ON listas FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias listas
CREATE POLICY "Usuários podem deletar suas listas"
  ON listas FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para PRODUTOS
-- Usuários podem ver produtos de suas listas
CREATE POLICY "Usuários podem ver produtos de suas listas"
  ON produtos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listas
      WHERE listas.id = produtos.lista_id
      AND listas.user_id = auth.uid()
    )
  );

-- Usuários podem criar produtos em suas listas
CREATE POLICY "Usuários podem criar produtos"
  ON produtos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listas
      WHERE listas.id = produtos.lista_id
      AND listas.user_id = auth.uid()
    )
  );

-- Usuários podem atualizar produtos de suas listas
CREATE POLICY "Usuários podem atualizar produtos"
  ON produtos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM listas
      WHERE listas.id = produtos.lista_id
      AND listas.user_id = auth.uid()
    )
  );

-- Usuários podem deletar produtos de suas listas
CREATE POLICY "Usuários podem deletar produtos"
  ON produtos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listas
      WHERE listas.id = produtos.lista_id
      AND listas.user_id = auth.uid()
    )
  );

-- Políticas para PERFIS
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON perfis FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON perfis FOR UPDATE
  USING (auth.uid() = id);

-- Categorias são públicas (apenas leitura)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias são públicas"
  ON categorias FOR SELECT
  TO authenticated
  USING (true);

-- ===== VIEWS ÚTEIS =====

-- View de estatísticas do usuário
CREATE OR REPLACE VIEW estatisticas_usuario AS
SELECT 
  user_id,
  COUNT(*) as total_listas,
  SUM(CASE WHEN status = 'ativa' THEN 1 ELSE 0 END) as listas_ativas,
  SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) as listas_concluidas,
  SUM(orcamento) as orcamento_total,
  SUM(total_gasto) as gasto_total,
  AVG(total_gasto) as media_gasto
FROM listas
GROUP BY user_id;

-- ===== FUNÇÕES ÚTEIS =====

-- Função para obter resumo de uma lista
CREATE OR REPLACE FUNCTION resumo_lista(lista_uuid UUID)
RETURNS TABLE (
  total_produtos BIGINT,
  produtos_comprados BIGINT,
  valor_total DECIMAL,
  valor_comprado DECIMAL,
  percentual_concluido DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_produtos,
    COUNT(*) FILTER (WHERE comprado = true)::BIGINT as produtos_comprados,
    COALESCE(SUM(preco_total), 0) as valor_total,
    COALESCE(SUM(preco_total) FILTER (WHERE comprado = true), 0) as valor_comprado,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE comprado = true)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
      ELSE 0
    END as percentual_concluido
  FROM produtos
  WHERE lista_id = lista_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== DADOS DE EXEMPLO (OPCIONAL) =====
-- Descomente para popular com dados de teste

/*
-- Inserir lista de exemplo (substitua 'USER_ID' pelo ID real do usuário)
INSERT INTO listas (user_id, nome, orcamento, status) VALUES
  ('USER_ID', 'Compras do Mês', 500.00, 'ativa'),
  ('USER_ID', 'Churrasco', 200.00, 'concluida');

-- Inserir produtos de exemplo
INSERT INTO produtos (lista_id, nome, quantidade, unidade, preco_unitario, preco_total, categoria) VALUES
  ((SELECT id FROM listas WHERE nome = 'Compras do Mês' LIMIT 1), 'Arroz', 5, 'kg', 4.50, 22.50, 'Mercearia'),
  ((SELECT id FROM listas WHERE nome = 'Compras do Mês' LIMIT 1), 'Feijão', 2, 'kg', 6.00, 12.00, 'Mercearia'),
  ((SELECT id FROM listas WHERE nome = 'Compras do Mês' LIMIT 1), 'Leite', 3, 'L', 4.20, 12.60, 'Laticínios');
*/

-- ===== COMENTÁRIOS =====
COMMENT ON TABLE listas IS 'Armazena as listas de compras dos usuários';
COMMENT ON TABLE produtos IS 'Armazena os produtos de cada lista';
COMMENT ON TABLE categorias IS 'Categorias predefinidas para organização';
COMMENT ON TABLE perfis IS 'Perfil estendido dos usuários';

-- ===== FIM DO SCHEMA =====
-- Execute este script no SQL Editor do Supabase
-- Dashboard → SQL Editor → New Query → Cole este código → Run
