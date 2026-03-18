import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GUIDES } from '../utils/data'
import './Dashboard.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (!user) navigate('/login', { state: { from: '/dashboard' } }) }, [user])
  if (!user) return null

  const myGuides = GUIDES.slice(0, 2)
  const purchases = GUIDES.slice(2, 5)
  const totalEarnings = myGuides.reduce((s, g) => s + g.price * 12, 0) * 0.85

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Hallo, {user.name?.split(' ')[0]} 👋</h1>
            <p className="text-muted">Willkommen zurück in deinem Dashboard</p>
          </div>
          <Link to="/upload" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Anleitung hochladen
          </Link>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {[
            { label: 'Gesamteinnahmen', value: `€${totalEarnings.toFixed(2).replace('.',',')}`, sub: '+12% diesen Monat', color: 'var(--accent)' },
            { label: 'Verkaufte Anleitungen', value: '24', sub: '8 diesen Monat', color: 'var(--green)' },
            { label: 'Eigene Anleitungen', value: myGuides.length, sub: '1 in Review', color: '#5a3e99' },
            { label: 'Käufe', value: purchases.length, sub: 'Alle verfügbar', color: '#0369a1' },
          ].map(s => (
            <div key={s.label} className="dash-stat-card">
              <div className="dash-stat-value" style={{color: s.color}}>{s.value}</div>
              <div className="dash-stat-label">{s.label}</div>
              <div className="dash-stat-sub text-faint">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="dash-grid">
          {/* My guides */}
          <div className="dash-section">
            <div className="dash-section-header">
              <h2>Meine Anleitungen</h2>
              <Link to="/upload" className="btn btn-sm btn-outline">+ Neue hinzufügen</Link>
            </div>
            {myGuides.length === 0 ? (
              <div className="dash-empty">
                <p>Noch keine Anleitungen hochgeladen.</p>
                <Link to="/upload" className="btn btn-primary btn-sm">Erste Anleitung hochladen</Link>
              </div>
            ) : (
              <div className="dash-guide-list">
                {myGuides.map(g => (
                  <div key={g.id} className="dash-guide-row">
                    <div className="dash-guide-cover" style={{background: g.coverColor}}>
                      <span style={{fontSize:'1.4rem'}}>{g.icon}</span>
                    </div>
                    <div className="dash-guide-info">
                      <Link to={`/guide/${g.id}`} className="dash-guide-title">{g.title}</Link>
                      <div className="dash-guide-meta text-faint">
                        {g.format} · {g.downloads} Downloads · €{(g.price * 0.85).toFixed(2).replace('.',',')} / Verkauf
                      </div>
                    </div>
                    <div className="dash-guide-actions">
                      <span className="badge badge-new">Aktiv</span>
                      <button className="btn btn-ghost btn-sm">Bearbeiten</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Purchases */}
          <div className="dash-section">
            <div className="dash-section-header">
              <h2>Meine Käufe</h2>
            </div>
            <div className="dash-guide-list">
              {purchases.map(g => (
                <div key={g.id} className="dash-guide-row">
                  <div className="dash-guide-cover" style={{background: g.coverColor}}>
                    <span style={{fontSize:'1.4rem'}}>{g.icon}</span>
                  </div>
                  <div className="dash-guide-info">
                    <Link to={`/guide/${g.id}`} className="dash-guide-title">{g.title}</Link>
                    <div className="dash-guide-meta text-faint">{g.format} · {g.pages} Seiten</div>
                  </div>
                  <button className="btn btn-sm btn-outline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="dash-section dash-account">
          <h2>Konto-Einstellungen</h2>
          <div className="account-grid">
            <div className="account-card">
              <div className="account-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
              <div>
                <div style={{fontWeight:500}}>{user.name}</div>
                <div className="text-faint" style={{fontSize:'0.875rem'}}>{user.email}</div>
              </div>
              <button className="btn btn-sm btn-outline" style={{marginLeft:'auto'}}>Bearbeiten</button>
            </div>
            <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
              <button className="btn btn-outline btn-sm">Zahlungsmethoden</button>
              <button className="btn btn-outline btn-sm">Benachrichtigungen</button>
              <button className="btn btn-outline btn-sm">Auszahlungen einrichten</button>
              <button className="btn btn-ghost btn-sm" style={{color:'#b91c1c'}} onClick={() => { logout(); navigate('/') }}>Abmelden</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
