import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../context/AuthContext'
import './Dashboard.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [myGuides, setMyGuides] = useState([])
  const [purchases, setPurchases] = useState([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/dashboard' } }); return }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      // Eigene Anleitungen laden
      const { data: guides } = await supabase
        .from('guides')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      setMyGuides(guides || [])

      // Käufe laden
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*, guides(*)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      setPurchases(purchaseData || [])

      // Einnahmen berechnen
      const { data: salesData } = await supabase
        .from('purchases')
        .select('price_paid, guides!inner(author_id)')
        .eq('guides.author_id', user.id)

      if (salesData) {
        const total = salesData.reduce((sum, s) => sum + (s.price_paid * 0.85), 0)
        setTotalEarnings(total)
        setTotalSales(salesData.length)
      }
    } catch (err) {
      console.error('Fehler beim Laden:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  if (loading) return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh'}}>
      <p style={{color:'var(--ink-muted)'}}>Laden…</p>
    </div>
  )

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
            { label: 'Gesamteinnahmen', value: `€${totalEarnings.toFixed(2).replace('.',',')}`, sub: '85% deiner Verkäufe', color: 'var(--accent)' },
            { label: 'Verkaufte Anleitungen', value: totalSales, sub: 'Gesamt', color: 'var(--green)' },
            { label: 'Eigene Anleitungen', value: myGuides.length, sub: 'Hochgeladen', color: '#5a3e99' },
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
          {/* Meine Anleitungen */}
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
                    <div className="dash-guide-cover" style={{background: g.cover_color || '#f0d4c2'}}>
                      <span style={{fontSize:'1.4rem'}}>{g.icon || '📄'}</span>
                    </div>
                    <div className="dash-guide-info">
                      <span className="dash-guide-title">{g.title}</span>
                      <div className="dash-guide-meta text-faint">
                        {g.format} · {g.downloads || 0} Downloads · €{((g.price || 0) * 0.85).toFixed(2).replace('.',',')} / Verkauf
                      </div>
                    </div>
                    <div className="dash-guide-actions">
                      <span className="badge badge-new">Aktiv</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meine Käufe */}
          <div className="dash-section">
            <div className="dash-section-header">
              <h2>Meine Käufe</h2>
            </div>
            {purchases.length === 0 ? (
              <div className="dash-empty">
                <p>Noch keine Anleitungen gekauft.</p>
                <Link to="/browse" className="btn btn-primary btn-sm">Anleitungen entdecken</Link>
              </div>
            ) : (
              <div className="dash-guide-list">
                {purchases.map(p => (
                  <div key={p.id} className="dash-guide-row">
                    <div className="dash-guide-cover" style={{background: p.guides?.cover_color || '#e6f1fb'}}>
                      <span style={{fontSize:'1.4rem'}}>{p.guides?.icon || '📄'}</span>
                    </div>
                    <div className="dash-guide-info">
                      <span className="dash-guide-title">{p.guides?.title}</span>
                      <div className="dash-guide-meta text-faint">{p.guides?.format} · {p.guides?.pages} Seiten</div>
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
            )}
          </div>
        </div>

        {/* Konto */}
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
