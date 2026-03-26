import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { criarProtocolo, listarProtocolos, uploadDocumento } from '../lib/supabase'

const S = {
  recebido: { label: 'Recebido', color: '#c9a84c', bg: 'rgba(201,168,76,0.15)' },
  em_analise: { label: 'Em Análise', color: '#4a90d9', bg: 'rgba(74,144,217,0.15)' },
  em_andamento: { label: 'Em Andamento', color: '#e09440', bg: 'rgba(224,148,64,0.15)' },
  respondido: { label: 'Respondido', color: '#4caf82', bg: 'rgba(76,175,130,0.15)' },
  arquivado: { label: 'Arquivado', color: '#8a9bb0', bg: 'rgba(138,155,176,0.15)' },
}

export default function PortalSecretaria() {
  const { perfil, logout } = useAuth()
  const secretaria = perfil?.dados
  const [aba, setAba] = useState('meus')
  const [protocolos, setProtocolos] = useState([])
  const [loading, setLoading] = useState(true)
  const [detalhe, setDetalhe] = useState(null)
  const [form, setForm] = useState({ titulo: '', descricao: '', tipo: 'Parecer Jurídico', prioridade: 'normal' })
  const [arquivos, setArquivos] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(null)

  useEffect(() => { carregarProtocolos() }, [])

  async function carregarProtocolos() {
    setLoading(true)
    const { data } = await listarProtocolos({ secretaria_id: secretaria?.id })
    setProtocolos(data || [])
    setLoading(false)
  }

  async function handleEnviar(e) {
    e.preventDefault()
    if (!form.titulo.trim()) return
    setEnviando(true)
    const { data, error } = await criarProtocolo({ ...form, secretaria_id: secretaria.id })
    if (error) { setEnviando(false); alert('Erro: ' + error.message); return }
    setEnviando(false); setSucesso(data); setForm({ titulo: '', descricao: '', tipo: 'Parecer Jurídico', prioridade: 'normal' })
    setArquivos([]); await carregarProtocolos(); setAba('meus')
  }

  const pendentes = protocolos.filter(p => p.status !== 'respondido' && p.status !== 'arquivado').length
  const respondidos = protocolos.filter(p => p.status === 'respondido').length

  return (
    <div style={{ minHeight: '100vh', background: '#0d1b2a', fontFamily: "'DM Sans', sans-serif", color: '#f0ece3' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <header style={{ background: '#162032', borderBottom: '1px solid rgba(201,168,76,0.2)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ fontSize: 24 }}>⚖�</div><div><div style={{ fontFamily: "'Playfair Display', serif", color: '#c9a84c', fontSize: 14, fontWeight: 600 }}>Portal da Procuradoria-Geral</div><div style={{ fontSize: 11, color: '#8a9bb0' }}>Município de Extrema — MG</div></div></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 600 }}>{secretaria?.nome}</div><div style={{ fontSize: 11, color: '#c9a84c' }}>Sigla: {secretaria?.sigla}</div></div><button onClick={logout} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#8a9bb0', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Sair</button></div>
      </header>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[{ label: 'Total', value: protocolos.length, icon: '�+', color: '#c9a84c' },{ label: 'Aguardando', value: pendentes, icon: '⏳', color: '#e09440' },{ label: 'Respondidos', value: respondidos, icon: '✅', color: '#4caf82' }].map(s => (
            <div key={s.label} style={{ background: '#1e2d40', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 18px', borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 11, color: '#8a9bb0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
          {[{ id: 'meus', label: '📋 Protocolos' },{ id: 'novo', label: '+ Novo Protocolo' }].map(t => (
            <button key={t.id} onClick={() => { setAba(t.id); setSucesso(null) }} style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: aba === t.id ? '#c9a84c' : '#8a9bb0', borderBottom: aba === t.id ? '2px solid #c9a84c' : '2px solid transparent', marginBottom: -1 }}>{t.label}</button>
          ))}
        </div>
        {aba === 'meus' && (
          <div>{loading ? <div style={{ textAlign: 'center', padding: 40, color: '#8a9bb0' }}>Carregando...</div> : protocolos.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: '#8a9bb0' }}><div style={{ fontSize: 40, marginBottom: 12 }}>💭</div><div>Nenhum protocolo inda.</div><button onClick={() => setAba('novo')} style={{ marginTop: 16, background: '#c9a84c', color: '#0d1b2a', border: 'none', padding: '9px 20px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Enviar primeiro protocolo →</button></div> : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{protocolos.map(p => {const st=S[p.status]||S.recebido;return(<div key={p.id} style={{ background: '#1e2d40', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 20px', borderLeft: `4px solid ${st.color}` }}><div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}><div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#c9a84c', fontWeight: 700 }}>#{p.numero}</span><span style={{ fontSize: 10, background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 20 }}>{st.label}</span></div><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.titulo}</div><div style={{ fontSize: 11, color: '#8a9bb0' }}>{p.tipo} ‗ {new Date(p.created_at).toLocaleDateString('pt-BR')}</div>{p.status==='respondido')&&p.resposta&&<div style={{ marginTop: 10, background: 'rgba(76,175,130,0.1)', border: '1px solid rgba(76,175,130,0.2)', borderRadius: 7, padding: '10px 12px' }}><div style={{ fontSize: 10, color: '#4caf82', fontWeight: 600, marginBottom: 4 }}>✅ Resposta</div><div style={{ fontSize: 13, lineHeight: 1.5 }}>{p.resposta}</div></div>}</div></div></div>)})}</div>}</div>
        )}
        {aba === 'novo' && (
          <div style={{ background: '#1e2d40', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 28 }}>
            {sucesso ? (<div style={{ textAlign: 'center', padding: 20 }}><div style={{ fontSize: 48, marginBottom: 12 }}>✅</div><h3 style={{ color: '#4caf82', fontSize: 20, marginBottom: 8 }}>Protocolo Registrado!</h3><div style={{ fontSize: 28, fontWeight: 700, color: '#c9a84c', marginBottom: 8, fontFamily: 'monospace' }}>#{sucesso.numero}</div><p style={{ color: '#8a9bb0', fontSize: 13 }}>Guarde este número.</p><div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}><button onClick={() => setSucesso(null)} style={{ background: '#c9a84c', color: '#0d1b2a', border: 'none', padding: '9px 20px', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Enviar outro</button><button onClick={() => { setSucesso(null); setAba('meus') }} style={{ background: 'rgba(255,255,255,0.06)', color: '#8a9bb0', border: '1px solid rgba(255,255,255,0.1)', padding: '9px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}>Ver meus</button></div></div>) : (
              <form onSubmit={handleEnviar}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#f0ece3', fontSize: 16, marginBottom: 20, marginTop: 0 }}>📋 Solicitação Jurídica</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1/-1' }}><label style={lSt}>Título *</label><input value={form.titulo} onChange={e => setForm({...form,titulo:e.target.value})} placeholder="Assunto..." required style={fSt} /></div>
                  <div><label style={lSt}>Tipo</label><select value={form.tipo} onChange={e => setForm({...form,tipo:e.target.value})} style={fSt}><option>Parecer Jurídico</option><option>Anɾlise de Contrato</option><option>Licitação / Edital</option><option>Consulta Jurídica</option><option>Recurso Administrativo</option><option>Outro</option></select></div>
                  <div><label style={lSt}>Prioridade</label><select value={form.prioridade} onChange={e => setForm({...form,prioridade:e.target.value})} style={fSt}><option value="normal">Normal</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></div>
                  <div style={{ gridColumn: '1/-1' }}><label style={lSt}>Descrição</label><textarea value={form.descricao} onChange={e => setForm({...form,descricao:e.target.value})} placeholder="Detalhes..." rows={5} style={{...fSt,resize:'vertical'}} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setAba('meus')} style={{ background: 'rgba(255,255,255,0.06)', color: '#8a9bb0', border: '1px solid rgba(255,255,255,0.1)', padding: '9px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
                  <button type="submit" disabled={enviando} style={{ background: enviando?'rgba(201,168,76,0.5)':'#c9a84c', color: '#0d1b2a', border: 'none', padding: '9px 22px', borderRadius: 7, cursor: enviando?'not-allowed':'pointer', fontSize: 13, fontWeight: 600 }}>
                    {enviando ? 'Enviando...' : '💨 Enviar Protocolo'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
const lSt={display:'block',fontSize:11,color:'#8a9bb0',textTransform:'uppercase',letterSpacing:0.8,marginBottom:6}
const fSt={width:'100%',padding:'8px 12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,fontSize:13,color:'#f0ece3',fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}
