import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const handle = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-icon">G</span>
            <span className="logo-text">guide</span>
          </Link>
          <h1>Willkommen zurück</h1>
          <p className="text-muted">Melde dich in deinem Account an</p>
        </div>

        <form onSubmit={handle} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input id="email" type="email" className="input" required
              placeholder="du@beispiel.de"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>

          <div className="form-group">
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <label htmlFor="password">Passwort</label>
              <a href="#" style={{fontSize:'0.8rem', color:'var(--accent)'}}>Vergessen?</a>
            </div>
            <input id="password" type="password" className="input" required
              placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>

        <div className="auth-divider"><span>oder</span></div>

        <button className="btn btn-outline btn-full" onClick={() => setError('Demo: OAuth noch nicht konfiguriert')}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Mit Google anmelden
        </button>

        <p className="auth-switch">
          Noch kein Konto? <Link to="/signup">Jetzt registrieren</Link>
        </p>

        <div className="demo-hint">
          <strong>Demo-Zugangsdaten:</strong> demo@guide.de / demo123
        </div>
      </div>
    </div>
  )
}
