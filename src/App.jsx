import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import PainelPGM from './pages/PainelPGM'
import PortalSecretaria from './pages/PortalSecretaria'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('pgm_session')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.tipo) {
          setSession(parsed)
          setPerfil(parsed)
        }
      } catch (e) {}
    }
    setLoading(false)
  }, [])

  function handleLogin(sessionData) {
    localStorage.setItem('pgm_session', JSON.stringify(sessionData))
    setSession(sessionData)
    setPerfil(sessionData)
  }

  function handleLogout() {
    localStorage.removeItem('pgm_session')
    setSession(null)
    setPerfil(null)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d1b2a' }}>
        <div style={{ color: '#c9a84c', fontFamily: 'sans-serif', fontSize: 14 }}>Carregando...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ session, perfil, logout: handleLogout }}>
      {!session ? (
        <Login onLogin={handleLogin} />
      ) : perfil?.tipo === 'secretaria' ? (
        <PortalSecretaria />
      ) : (
        <PainelPGM />
      )}
    </AuthContext.Provider>
  )
}
