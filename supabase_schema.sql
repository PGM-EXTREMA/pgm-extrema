-- ============================================================
-- SCHEMA DO BANCO DE DADOS - PGM EXTREMA
-- Execute este SQM no Supabase SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS secretarias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  sigla TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEAAULT4true,
  created_at TIMESTAMPT@ NOW()
);

CREATE TABLE IF NOT EXISTS usuarios_pgm (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cargo TEXT,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'assessor',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS protocolos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  secretaria_id UUID REFERENCES secretarias(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL,
  prioridade TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'recebido',
  responsavel_id UUID REFERENCES usuarios_pgm(id),
  prazo DATE,
  resposta TEXT,
  respondido_em TIMESTAMPTZ,
  created_at TIMESTAMPT@ NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historico_protocolo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo_id UUID REFERENCES protocolos(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  descricao TEXT,
  usuario TEXT,
  created_at TIMESTAMPT@ NOW()
);

CREATE TABLE IF NOT EXISTS demandas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT,
  assessor_id UUID REFERENCES usuarios_pgm(id),
  envio DATE,
  prazo DATE,
  prioridade TEXT DEFAULT 'normal',
  processo TEXT,
  obs TEXT,
  status TEXT DEFAULT 'pendente',
  obs_conclusao TEXT,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPT@ NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS processos_judiciais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, vara TEXT, numero TEXT NOT NULL, assunto TEXT NOT NULL, fase TEXT DEFAULT 'conhecimento', prazo DATE, valor DECIMAL, responsavel_id UUID REFERENCES usuarios_pgm(id), polo TEXT DEFAULT 'reu', obs TEXT, created_at TIMESTAMPT@ NOW()
);

CREATE TABLE IF NOT EXISTS licitacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, numero TEXT NOT NULL, modalidade TEXT, objeto TEXT, valor DECIMAL, recebido DATE, prazo DATE, responsavel_id UUID REFERENCES usuarios_pgm(id), obs TEXT, status TEXT DEFAULT 'analise', created_at TIMESTAMPT@ NOW()
);

CREATE TABLE IF NOT EXISTS contratos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, numero TEXT NOT NULL, fornecedor TEXT NOT NULL, objeto TEXT, valor DECIMAL, inicio DATE, fim DATE NOT NULL, responsavel_id UUID REFERENCES usuarios_pgm(id), obs TEXT, status TEXT DEFAULT 'vigente', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pareceres (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, numero TEXT NOT NULL UNIQUE, tipo TEXT, assunto TEXT NOT NULL, solicitante TEXT, emissor_id UUID REFERENCES usuarios_pgm(id), data DATE, conclusao TEXT DEFAULT 'favoravel', sintese TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS oficios (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, assunto TEXT NOT NULL, numero TEXT, origem TEXT NOT NULL, recebido DATE, prazo DATE, responsavel_id UUID REFERENCES usuarios_pgm(id), obs TEXT, status TEXT DEFAULT 'pendente', created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS pae (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, numero TEXT NOT NULL, interessado TEXT NOT NULL, tipo TEXT, assunto TEXT NOT NULL, recebido DATE, prazo DATE, responsavel_id UUID REFERENCES usuarios_pgm(id), obs TEXT, status TEXT DEFAULT 'analise', created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS projetos_lei (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, numero TEXT NOT NULL, autor TEXT, ementa TEXT NOT NULL, aprovado DATE NOT NULL, prazo DATE, obs TEXT, status TEXT DEFAULT 'aguardando', created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS feedbacks (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, assessor_id UUID REFERENCES usuarios_pgm(id), demanda_id UUID REFERENCES demandas(id), tipo TEXT DEFAULT 'neutro', estrelas INTEGER DEFAULT 3, texto TEXT NOT NULL, created_at TIMESTAMPT@ NOW());

INSERT INTO secretarias (nome, sigla, email) VALUES
  ('Administração', 'SADM', 'sadm@extrema.mg.gov.br'),
  ('Assistência Social', 'SOAS', 'soas@extrema.mg.gov.br'),
  ('Agropecuária', 'SAGR', 'sagr@extrema.mg.gov.br'),
  ('Comunicação', 'SCOM', 'scom@extrema.mg.gov.br'),
  ('Controladoria Geral', 'CGM', 'cgm@extrema.mg.gov.br'),
  ('Cultura', 'SCULT', 'scult@extrema.mg.gov.br'),
  ('Educação', 'SEDU', 'sedu@extrema.mg.gov.br'),
  ('Esporte, Lazer e Juventude', 'SELJ', 'selj@extrema.mg.gov.br'),
  ('Gabinete do Prefeito Municipal', 'GAB', 'gab@extrema.mg.gov.br'),
  ('Habitação', 'SHAB', 'shab@extrema.mg.gov.br'),
  ('Indústria e Comércio', 'SMIC', 'smic@extrema.mg.gov.br'),
  ('Meio Ambiente', 'SMAM', 'smam@extrema.mg.gov.br'),
  ('Obras', 'SOBR', 'sobr@extrema.mg.gov.br'),
  ('Planejamento e Finanças', 'SPOF', 'spof@extrema.mg.gov.br'),
  ('Recursos Humanos', 'SRH', 'srh@extrema.mg.gov.br'),
  ('Relações Governamentais', 'SRG', 'srg@extrema.mg.gov.br'),
  ('Saúde', 'SSAU', 'ssau@extrema.mg.gov.br'),
  ('Setor de Licitação', 'SLIC', 'slic@extrema.mg.gov.br'),
  ('Turismo', 'STUR', 'stur@extrema.mg.gov.br')
ON CONFLICT (sigla) DO NOTHING;

INSERT INTO usuarios_pgm (nome, cargo, email, role) VALUES
  ('Procurador-Geral', 'Procurador-Geral do Município', 'bertolotti.bruno@gmail.com', 'procurador'),
  ('Felipe', 'Assessor Jurídico', 'felipe@extrema.mg.gov.br', 'assessor'),
  ('Natanael', 'Assessor Jurídico', 'natanael@extrema.mg.gov.br', 'assessor'),
  ('Lucas', 'Assessor Jurídico', 'lucas@extrema.mg.gov.br', 'assessor'),
  ('Mayara', 'Assessora Jurídica', 'mayara@extrema.mg.gov.br', 'assessor'),
  ('Matheus', 'Assessor Jurídico', 'matheus@extrema.mg.gov.br', 'assessor'),
  ('Gleice', 'Assistente', 'gleice@extrema.mg.gov.br', 'assistente'),
  ('Amanda', 'Assistente', 'amanda@extrema.mg.gov.br', 'assistente'),
  ('Marcela', 'Assistente', 'marcela@extrema.mg.gov.br', 'assistente')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE protocolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE secretarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_protocolo ENABLE ROW LEVEL SECURITY;
ALTER TABLE demandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_pgm ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos_judiciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE licitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pareceres ENABLE ROW LEVEL SECURITY;
ALTER TABLE oficios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pae ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos_lei ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON protocolos FOR ALL USING (true);
CREATE POLICY "allow_all" ON secretarias FOR ALL USING (true);
CREATE POLICY "allow_all" ON historico_protocolo FOR ALL USING (true);
CREATE POLICY "allow_all" ON demandas FOR ALL USING (true);
CREATE POLICY "allow_all" On usuarios_pgm FOR ALL USING (true);
CREATE POLICY "allow_all" ON processos_judiciais FOR ALL USING (true);
CREATE POLICY "allow_all" ON licitacoes FOR ALL USING (true);
CREATE POLICY "allow_all" ON contratos FOR ALL USING (true);
CREATE POLICY "allow_all" ON pareceres FOR ALL USING (true);
CREATE POLICY "allow_all" ON oficios FOR ALL USING (true);
CREATE POLICY "allow_all" ON pae FOR ALL USING (true);
CREATE POLICY "allow_all" ON projetos_lei FOR ALL USING (true);
CREATE POLICY "allow_all" ON feedbacks FOR ALL USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "allow_all" ON storage.objects FOR ALL USING (bucket_id = 'documentos');