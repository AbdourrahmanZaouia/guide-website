import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'buyer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return setError('Passwörter stimmen nicht überein')
    if (form.password.length < 6) return setError('Passwort muss mindestens 6 Zeichen haben')
    setError(''); setLoading(true)
    try {
      await signup(form.name, form.email, form.password)
      navigate('/dashboard')
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
          <h1>Konto erstellen</h1>
          <p className="text-muted">Kostenlos registrieren, sofort loslegen</p>
        </div>

        <div className="role-tabs">
          <button className={`role-tab ${form.role==='buyer'?'active':''}`} onClick={() => setForm({...form, role:'buyer'})}>
            🛍️ Käufer
          </button>
          <button className={`role-tab ${form.role==='seller'?'active':''}`} onClick={() => setForm({...form, role:'seller'})}>
            📤 Verkäufer
          </button>
        </div>

        <form onSubmit={handle} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Vollständiger Name</label>
            <input id="name" type="text" className="input" required
              placeholder="Max Mustermann"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input id="email" type="email" className="input" required
              placeholder="du@beispiel.de"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input id="password" type="password" className="input" required
              placeholder="Mindestens 6 Zeichen"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Passwort bestätigen</label>
            <input id="confirm" type="password" className="input" required
              placeholder="••••••••"
              value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} />
          </div>

          <p style={{fontSize:'0.78rem', color:'var(--ink-faint)', lineHeight:1.5}}>
            Mit der Registrierung akzeptierst du unsere <a href="#" style={{color:'var(--accent)'}}>AGB</a> und <a href="#" style={{color:'var(--accent)'}}>Datenschutzrichtlinie</a>.
          </p>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Registrieren…' : 'Kostenlos registrieren'}
          </button>
        </form>

        <p className="auth-switch">
          Bereits ein Konto? <Link to="/login">Jetzt anmelden</Link>
        </p>
      </div>
    </div>
  )
}
