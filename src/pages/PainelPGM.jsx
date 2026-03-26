// PainelPGM placeholder - will be replaced
import { useState } from 'react'
import { useAuth } from '../App'
export default function PainelPGM() {
  const { logout } = useAuth()
  return <div style={{padding:40,color:'#f0ece3',background:'#0d1b2a',minHeight:'100vh',fontFamily:'sans-serif'}}>
    <h1 style={{color:'#c9a84c'}}>⚖️ PGM Extrema</h1>
    <p>Sistema carregando... Arquivo principal em processamento.</p>
    <button onClick={logout} style={{background:'#c9a84c',color:'#0d1b2a',border:'none',padding:'8px 16px',borderRadius:6,cursor:'pointer'}}>Sair</button>
  </div>
}