import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ugioavmdfzajsarvlbtf.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_G2P6G2eHLqix33TomxNWCA_9JyUuc8C'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ===== PROTOCOLAS =====
export async function criarProtocolo(dados) {
  const ano = new Date().getFullYear()
  const { data: ultimos } = await supabase
    .from('protocolos')
    .select('numero')
    .ilike('numero', `%/${ano}`)
    .order('created_at', { ascending: false })
    .limit(1)

  let seq = 1
  if (ultimos && ultimos.length > 0) {
    const match = ultimos[0].numero.match(/^(\d+)/)
    if (match) seq = parseInt(match[1]) + 1
  }
  const numero = `${String(seq).padStart(4, '0')}/${ano}`

  const { data, error } = await supabase
    .from('protocolos')
    .insert([{ ...dados, numero }])
    .select()
    .single()

  if (!error) {
    await supabase.from('historico_protocolo').insert([{
      protocolo_id: data.id,
      acao: 'criado',
      descricao: 'Protocolo registrado pela secretaria',
      usuario: dados.secretaria_id
    }])
  }

  return { data, error }
}

export async function listarProtocolos(filtros = {}) {
  let query = supabase
    .from('protocolos')
    .select(`*, secretaria:secretarias(nome, sigla), responsavel:usuarios_pgm(nome)`)
    .order('created_at', { ascending: false })

  if (filtros.secretaria_id) query = query.eq('secretaria_id', filtros.secretaria_id)
  if (filtros.status) query = query.eq('status', filtros.status)

  return query
}

export async function responderProtocolo(id, resposta, usuarioNome) {
  const { data, error } = await supabase
    .from('protocolos')
    .update({ resposta, status: 'respondido', respondido_em: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (!error) {
    await supabase.from('historico_protocolo').insert([{
      protocolo_id: id,
      acao: 'respondido',
      descricao: 'Resposta enviada pela Procuradoria',
      usuario: usuarioNome
    }])
  }

  return { data, error }
}

export async function atualizarStatusProtocolo(id, status, usuarionome) {
  const { data, error } = await supabase
    .from('protocolos')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (!error) {
    await supabase.from('historico_protocolo').insert([{
      protocolo_id: id,
      acao: 'status',
      descricao: `Status alterado para: ${status}`,
      usuarioonome
    }])
  }

  return { data, error }
}

// ===== SECRETAIB�A =====
export async function listarSecretarias() {
  return supabase.from('secretarias').select('*').eq('ativo', true).order('nome')
}

export async function autenticarSecretaria(sigla, senha) {
  const { data, error } = await supabase
    .from('secretarias')
    .select('*')
    .eq('sigla', sigla.toUpperCase())
    .eq('ativo', true)
    .single()

  if (error || !data) return { error: 'Secretaria não encontrada' }

  const senhaEsperada = sigla.toLowerCase() + '@extrema'
  if (senha !== senhaEsperada) return { error: 'Senha incorreta' }

  return { data: { tipo: 'secretaria', dados: data } }
}

// ===== USUÁRIOS PGM =====
export async function listarUsuariosPGM() {
  return supabase.from('usuarios_pgm').select('*').eq('ativo', true).order('nome')
}

export async function autenticarPGM(email, senha) {
  const { data, error } = await supabase
    .from('usuarios_pgm')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('ativo', true)
    .single()

  if (error || !data) return { error: 'Usuário não encontrado' }

  const senhaEsperada = 'pgm@extrema2025'
  if (senha !== senhaEsperada) return { error: 'Senha incorreta' }

  return { data: { tipo: 'pgm', dados: data } }
}

// ===== DEMANDAS =====
export async function listarDemandas() {
  return supabase
    .from('demandas')
    .select(`*, assessor:usuarios_pgm(nome, cargo)`)
    .order('created_at', { ascending: false })
}

export async function criarDemanda(dados) {
  return supabase.from('demandas').insert([dados]).select().single()
}

export async function atualizarDemanda(id, dados) {
  return supabase.from('demandas').update({ ...dados, updated_at: new Date().toISOString() }).eq('id', id).select().single()
}

export async function excluirDemanda(id) {
  return supabase.from('demandas').delete().eq('id', id)
}

// ===== TABELAS GENÍRICAS =====
export async function listar(tabela, select = '*') {
  return supabase.from(tabela).select(select).order('created_at', { ascending: false })
}

export async function inserir(tabela, dados) {
  return supabase.from(tabela).insert([dados]).select().single()
}

export async function atualizar(tabela, id, dados) {
  return supabase.from(tabela).update(dados).eq('id', id).select().single()
}

export async function excluir(tabela, id) {
  return supabase.from(tabela).delete().eq('id', id)
}

// ===== UPLOAD DOcUMENTOS =====
export async function uploadDocumento(file, pasta) {
  const nomeArquivo = `${pasta}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { data, error } = await supabase.storage.from('documentos').upload(nomeArquivo, file)
  if (error) return { error }
  const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(nomeArquivo)
  return { data: { path: nomeArquivo, url: urlData.publicUrl } }
}
