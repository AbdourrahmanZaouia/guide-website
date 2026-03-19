import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../context/AuthContext'
import GuideCard from '../components/GuideCard'
import './Home.css'

const CATEGORIES = [
  'Handwerk & DIY', 'Kochen & Backen', 'Technik & Software',
  'Business', 'Fitness & Gesundheit', 'Garten', 'Finanzen', 'Kreativität'
]

const STATS = [
  { value: '100%', label: 'Echte Anleitungen' },
  { value: '85%', label: 'Für Verkäufer' },
  { value: '14 Tage', label: 'Rückgaberecht' },
  { value: '€0', label: 'Registrierung' },
]

const HOW = [
  { step: '01', title: 'Entdecke', desc: 'Durchsuche Anleitungen in allen Kategorien — von DIY bis Business.' },
  { step: '02', title: 'Kaufe sicher', desc: 'Sichere Zahlung via Stripe, Visa, PayPal, SEPA oder Klarna.' },
  { step: '03', title: 'Sofort-Download', desc: 'Nach dem Kauf lädst du die PDF oder DOCX sofort herunter.' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadFeatured() }, [])

  const loadFeatured = async () => {
    try {
      const { data } = await supabase
        .from('guides')
        .select('*')
        .eq('active', true)
        .order('downloads', { ascending: false })
        .limit(4)

      setFeatured(data || [])
    } catch (err) {
      console.error('Fehler:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span>✦</span> Der Marktplatz für Fachwissen
          </div>
          <h1 className="hero-title">
            Anleitungen von<br />
            <em>echten Experten</em>
          </h1>
          <p className="hero-sub">
            Kaufe und verkaufe Schritt-für-Schritt-Guides als PDF oder DOCX.
            Wissen das wirklich funktioniert — keine Abos, kein Bullshit.
          </p>
          <div className="hero-cta">
            <Link to="/browse" className="btn btn-primary btn-lg">Jetzt entdecken</Link>
            <Link to="/upload" className="btn btn-outline btn-lg">Anleitung verkaufen</Link>
          </div>
          <div className="hero-stats">
            {STATS.map(s => (
              <div key={s.label} className="hero-stat">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories strip */}
      <section className="categories-strip section-sm">
        <div className="container">
          <div className="categories-scroll">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/browse?cat=${encodeURIComponent(cat)}`} className="cat-chip">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Beliebte Anleitungen</h2>
              <p className="text-muted" style={{marginTop: 6}}>Die meistgekauften Guides</p>
            </div>
            <Link to="/browse" className="btn btn-outline btn-sm">Alle ansehen →</Link>
          </div>

          {loading ? (
            <div className="grid-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="card" style={{height: 320}}>
                  <div className="skeleton" style={{height: 140}}></div>
                  <div style={{padding: 18}}>
                    <div className="skeleton" style={{height: 16, marginBottom: 8, borderRadius: 4}}></div>
                    <div className="skeleton" style={{height: 12, marginBottom: 6, borderRadius: 4, width: '80%'}}></div>
                    <div className="skeleton" style={{height: 12, borderRadius: 4, width: '60%'}}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid-4">
              {featured.map(g => <GuideCard key={g.id} guide={g} isReal={true} />)}
            </div>
          ) : (
            <div style={{textAlign:'center', padding:'48px 0', color:'var(--ink-muted)'}}>
              <p style={{fontSize:'1.1rem', marginBottom:16}}>Noch keine Anleitungen verfügbar.</p>
              <Link to="/upload" className="btn btn-primary">Erste Anleitung hochladen</Link>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="how-section section">
        <div className="container">
          <div className="text-center" style={{marginBottom: 48}}>
            <h2>So funktioniert Guide</h2>
            <p className="text-muted" style={{marginTop: 8, fontSize: '1.05rem'}}>Einfach. Schnell. Sicher.</p>
          </div>
          <div className="how-grid">
            {HOW.map(h => (
              <div key={h.step} className="how-card">
                <div className="how-step">{h.step}</div>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sell CTA */}
      <section className="sell-cta section">
        <div className="container">
          <div className="sell-cta-inner">
            <div className="sell-cta-text">
              <h2>Dein Wissen ist wertvoll</h2>
              <p>Lade deine Anleitung hoch und verdiene Geld. Du behältst 85% jedes Verkaufs — wir kümmern uns um Zahlungen, Hosting und Support.</p>
              <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24}}>
                <Link to="/signup" className="btn btn-primary btn-lg">Kostenlos starten</Link>
                <Link to="/browse" className="btn btn-outline btn-lg" style={{borderColor: 'rgba(255,255,255,0.3)', color: '#fff'}}>Anleitungen entdecken</Link>
              </div>
            </div>
            <div className="sell-cta-visual">
              <div className="earnings-card">
                <div className="earnings-label">Beispielrechnung</div>
                <div className="earnings-row">
                  <span>Preis deiner Anleitung</span><span>€15,00</span>
                </div>
                <div className="earnings-row">
                  <span>Provision (15%)</span><span className="muted">−€2,25</span>
                </div>
                <div className="earnings-row earnings-total">
                  <span>Deine Auszahlung</span><span>€12,75</span>
                </div>
                <div className="earnings-note">Bei 100 Verkäufen = <strong>€1.275</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="trust-section section-sm">
        <div className="container">
          <div className="trust-grid">
            {[
              { icon: '🔒', title: 'Sichere Zahlung', desc: 'Verschlüsselt via Stripe — alle gängigen Methoden akzeptiert' },
              { icon: '⚡', title: 'Sofort-Download', desc: 'Direkt nach dem Kauf verfügbar — keine Wartezeit' },
              { icon: '↩️', title: '14 Tage Rückgabe', desc: 'Nicht zufrieden? Kein Problem, wir erstatten den Betrag' },
              { icon: '⭐', title: 'Geprüfte Qualität', desc: 'Jede Anleitung wird von unserem Team geprüft' },
            ].map(t => (
              <div key={t.title} className="trust-item">
                <span className="trust-icon">{t.icon}</span>
                <div>
                  <strong>{t.title}</strong>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
