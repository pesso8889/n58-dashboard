import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setError('✓ Cuenta creada. Revisa tu email para confirmar.')
      setMode('login')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#060810', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { outline: none; }
        input:focus { border-color: #00D4FF !important; }
      `}</style>

      <div style={{
        background: '#0B0F1E', border: '1px solid #192338', borderRadius: 12,
        padding: '40px 36px', width: '100%', maxWidth: 420
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: 'rgba(0,212,255,.08)',
            border: '1px solid #008BAA', borderRadius: 12,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500,
            color: '#00D4FF', letterSpacing: -1, marginBottom: 16
          }}>N58</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#DCE8FF' }}>N58 Banco Digital</div>
          <div style={{ fontSize: 11, color: '#415070', fontFamily: "'DM Mono', monospace", marginTop: 4, letterSpacing: '.5px' }}>
            PANEL ESTRATÉGICO · SISTEMA BANCARIO VZ
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 24, background: '#101525', borderRadius: 6, padding: 3 }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '7px 0', border: 'none', borderRadius: 4, cursor: 'pointer',
              fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '.5px',
              background: mode === m ? '#162035' : 'transparent',
              color: mode === m ? '#00D4FF' : '#415070',
              transition: 'all .15s'
            }}>
              {m === 'login' ? 'INGRESAR' : 'REGISTRARSE'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, color: '#415070', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@n58.com"
              style={{
                width: '100%', padding: '10px 12px',
                background: '#101525', border: '1px solid #223050',
                borderRadius: 6, color: '#DCE8FF', fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", transition: 'border-color .15s'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, color: '#415070', fontFamily: "'DM Mono', monospace", display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Contraseña
            </label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 12px',
                background: '#101525', border: '1px solid #223050',
                borderRadius: 6, color: '#DCE8FF', fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", transition: 'border-color .15s'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '8px 12px', borderRadius: 5, marginBottom: 14, fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              background: error.startsWith('✓') ? 'rgba(29,185,122,.1)' : 'rgba(232,64,64,.1)',
              border: `1px solid ${error.startsWith('✓') ? 'rgba(29,185,122,.3)' : 'rgba(232,64,64,.3)'}`,
              color: error.startsWith('✓') ? '#1DB97A' : '#E84040'
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px 0',
            background: loading ? 'rgba(0,212,255,.05)' : 'rgba(0,212,255,.12)',
            border: '1px solid #008BAA', borderRadius: 6,
            color: '#00D4FF', fontSize: 11, fontWeight: 500,
            fontFamily: "'DM Mono', monospace", letterSpacing: '1px',
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .15s'
          }}>
            {loading ? 'PROCESANDO...' : mode === 'login' ? 'INGRESAR AL DASHBOARD' : 'CREAR CUENTA'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 10, color: '#415070', fontFamily: "'DM Mono', monospace" }}>
          Datos reales · Score Bancario GlobalScope · Sudeban
        </div>
      </div>
    </div>
  )
}
