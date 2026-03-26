import { useState } from 'react'
import { autenticarPGM, autenticarSecretaria } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [tipo, setTipo] = useState('pgm')
  const [email, setEmail] = useState('')
  const [sigla, setSigla] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    let result
    if (tipo === 'pgm') {
      result = await autenticarPGM(email, senha)
    } else {
      result = await autenticarSecretaria(sigla, senha)
    }

    setLoading(false)
    if (result.error) {
      setErro(result.error)
    } else {
      onLogin(result.data)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b2a 0%, #162032 50%, #0d1b2a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif",
      padding: 20
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #c9a84c, #e2c27d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(201,168,76,0.3)' }}>⎥</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#c9a84c', fontSize: 20, fontWeight: 600, margin: 0 }}>
            Procuradoria-Geral do Município
          </h1>
          <p style={{ color: '#8a9bb0', fontSize: 12, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
            Extrema — MG
          </p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 4, marginBottom: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
          {'[{ id: 'pgm', label: '⎥ Procuradoria' }, { id: 'secretaria', label: '🔏 Secretaria' }]'.map(t => (
            <button key={t.id} onClick={() => { setTipo(t.id); setErro('') }} style={{
              flex: 1, padding: '9px 0px', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
              background: tipo === t.id ? '#c9a84c' : 'transparent',
              color: tipo === t.id ? '#0d1b2a' : '#8a9bb0'
            }}>{t.label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'rgba(22,32,50,0.9)', borderRadius: 14, padding: 28, border: '1px solid rgba(201,168,76,0.2)' }}>
          <h2 style={{ color: '#f0ece3', fontSize: 16, fontWeight: 600, marginBottom: 20, marginTop: 0 }}>
            {tipo === 'pgm' ? 'Acesso à Procuradoria' : 'Acesso da Secretaria'}
          </h2>

          {tipo === 'pgm' ? (
            <div style={{ marginBottom: 16 }}>
              <label style={inputLabel}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required style={inputSt} />
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <label style={inputLabel}>Secretaria</label>
              <select value={sigla} onChange={e => setSigla(e.target.value)} required style={inputSt}>
                <option value="">Selecione a secretaria...</option>
                <option value="SADM">Administração</option>
                <option value="SOAS">Assistência Social</option>
                <option value="SAGR">Agropecuária</option>
                <option value="SCOM">Comunicação</option>
                <option value="CGM">Controladoria Geral</option>
                <option value="SCULT">Cultura</option>
                <option value="SEDU">Educação</option>
                <option value="SELH�>Esporte, Lazer e Juventude</option>
                <option value="GAB">Gabinete do Prefeito Municipal</option>
                <option value="SHAB">Habitação</option>
                <option value="SMIC">Indústria e Comércio</option>
                <option value="SMAM">Meio Ambiente</option>
                <option value="SOBR">Obras</option>
                <option value="SPOF">Planejamento e Finanças</option>
                <option value="SRH">Recursos Humanos</option>
                <option value="SRG">Relações Governamentais</option>
                <option value="SSAU">Saúde</option>
                <option value="SLIC">Setor de Licitação</option>
                <option value="STUR">Turismo</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={inputLabel}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="……………………" required style={inputSt} />
          </div>

          {erro && (
            <div style={{ background: 'rgba(224,92,92,0.15)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#e05c5c' }}>
              ❌ {erro}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px 0px', background: loading ? 'rgba(201,168,76,0.5)' : '#c9a84c',
            color: '#0d1b2a', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif"
          }}>
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>

          {tipo === 'secretaria' && (
            <p style={{ fontSize: 11, color: '#8a9bb0', textAlign: 'center', marginTop: 14, marginBottom: 0 }}>
              Senha padrão: <strong style={{ color: '#c9a84c' }}>sigla@extrema</strong> (ex: sadm@extrema)
            </p>
          )}
          {tipo === 'pgm' && (
            <p style={{ fontSize: 11, color: '#8a9bb0', textAlign: 'center', marginTop: 14, marginBottom: 0 }}>
              Senha padrão: <strong style={{ color: '#c9a84c' }}>pgm@extrema2025</strong>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

const inputLabel = { display: 'block', fontSize: 11, color: '#8a9bb0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }
const inputSt = {
  width: '100%', padding: '9px 13px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13,
  color: '#f0ece3', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box'
}
