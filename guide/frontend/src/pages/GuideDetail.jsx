import { useParams, Link, useNavigate } from 'react-router-dom'
import { getGuideById, GUIDES } from '../utils/data'
import { useCart } from '../context/CartContext'
import GuideCard from '../components/GuideCard'
import './GuideDetail.css'

const REVIEWS = [
  { name: 'Laura K.', rating: 5, text: 'Absolut top! Sehr detailliert und praxisnah. Genau das was ich gesucht habe.', date: 'Nov 2024' },
  { name: 'Michael R.', rating: 5, text: 'Professionell aufbereitet, klare Struktur. Den Preis auf jeden Fall wert.', date: 'Okt 2024' },
  { name: 'Julia M.', rating: 4, text: 'Sehr hilfreich, ein paar Punkte hätten etwas ausführlicher sein können, aber insgesamt sehr gut.', date: 'Okt 2024' },
]

export default function GuideDetail() {
  const { id } = useParams()
  const guide = getGuideById(id)
  const { addItem, hasItem } = useCart()
  const navigate = useNavigate()

  if (!guide) return (
    <div className="not-found container" style={{padding: '80px 0', textAlign:'center'}}>
      <h2>Anleitung nicht gefunden</h2>
      <Link to="/browse" className="btn btn-primary" style={{marginTop: 16}}>Zurück zur Übersicht</Link>
    </div>
  )

  const inCart = hasItem(guide.id)
  const related = GUIDES.filter(g => g.category === guide.category && g.id !== guide.id).slice(0, 3)
  const formatPrice = (p) => `€${p.toFixed(2).replace('.', ',')}`

  const stars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ opacity: i < Math.floor(rating) ? 1 : 0.25 }}>★</span>
  ))

  return (
    <div className="guide-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Startseite</Link>
          <span>›</span>
          <Link to="/browse">Anleitungen</Link>
          <span>›</span>
          <Link to={`/browse?cat=${encodeURIComponent(guide.category)}`}>{guide.category}</Link>
          <span>›</span>
          <span>{guide.title}</span>
        </nav>

        <div className="detail-layout">
          {/* Main */}
          <div className="detail-main">
            <div className="detail-cover" style={{ background: guide.coverColor }}>
              <span className="detail-icon">{guide.icon}</span>
              <div className="detail-cover-meta">
                <span className="badge badge-category">{guide.category}</span>
                <span className="detail-format">{guide.format} · {guide.pages} Seiten</span>
              </div>
            </div>

            <h1 className="detail-title">{guide.title}</h1>

            <div className="detail-author-row">
              <div className="author-info">
                <div className="author-avatar">{guide.authorAvatar}</div>
                <div>
                  <div className="author-name">{guide.author}</div>
                  <div className="author-bio text-faint">{guide.authorBio}</div>
                </div>
              </div>
              <div className="detail-stats">
                <div className="stars" style={{fontSize:'14px'}}>{stars(guide.rating)}</div>
                <span style={{fontSize:'0.875rem'}}>{guide.rating} <span className="text-faint">({guide.reviewCount} Bewertungen)</span></span>
                <span className="text-faint" style={{fontSize:'0.875rem'}}>·</span>
                <span className="text-faint" style={{fontSize:'0.875rem'}}>{guide.downloads.toLocaleString()} Downloads</span>
              </div>
            </div>

            <hr />

            <div className="detail-description">
              <h2 style={{marginBottom: 16}}>Über diese Anleitung</h2>
              <p style={{lineHeight: 1.8, color: 'var(--ink-muted)'}}>
                {guide.description}
              </p>
              <div className="detail-long" style={{marginTop: 20, whiteSpace: 'pre-line', color: 'var(--ink-muted)', lineHeight: 1.8}}>
                {guide.longDescription}
              </div>
            </div>

            <hr />

            {/* Tags */}
            <div className="detail-tags">
              {guide.tags.map(t => <span key={t} className="badge badge-category">{t}</span>)}
            </div>

            <hr />

            {/* Reviews */}
            <div className="reviews-section">
              <h2 style={{marginBottom: 24}}>Bewertungen</h2>
              <div className="reviews-summary">
                <div className="reviews-score">
                  <span className="score-big">{guide.rating}</span>
                  <div className="stars" style={{fontSize:'20px'}}>{stars(guide.rating)}</div>
                  <span className="text-muted" style={{fontSize:'0.875rem'}}>{guide.reviewCount} Bewertungen</span>
                </div>
                <div className="reviews-bars">
                  {[5,4,3,2,1].map(n => (
                    <div key={n} className="review-bar-row">
                      <span style={{fontSize:'0.8rem', width:12}}>{n}</span>
                      <div className="review-bar-bg">
                        <div className="review-bar-fill" style={{width: n === 5 ? '70%' : n === 4 ? '20%' : '5%'}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reviews-list">
                {REVIEWS.map((r, i) => (
                  <div key={i} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-avatar">{r.name.charAt(0)}</div>
                      <div>
                        <div className="reviewer-name">{r.name}</div>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <div className="stars" style={{fontSize:'12px'}}>{stars(r.rating)}</div>
                          <span className="text-faint" style={{fontSize:'0.75rem'}}>{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{fontSize:'0.9rem', color:'var(--ink-muted)', marginTop:10, lineHeight:1.6}}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
            <div className="purchase-card">
              <div className="purchase-price">
                <span className="price">{formatPrice(guide.price)}</span>
                <span className="text-faint" style={{fontSize:'0.8rem'}}>inkl. MwSt.</span>
              </div>
              <button
                className={`btn btn-lg btn-full ${inCart ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => { addItem(guide); if (!inCart) navigate('/checkout') }}
              >
                {inCart ? '✓ Im Warenkorb — Zur Kasse' : 'Jetzt kaufen'}
              </button>
              {!inCart && (
                <button className="btn btn-outline btn-full" onClick={() => addItem(guide)}>
                  In den Warenkorb
                </button>
              )}
              <div className="purchase-features">
                {[
                  ['📥', 'Sofort-Download nach Kauf'],
                  ['📄', `${guide.format}, ${guide.pages} Seiten`],
                  ['🔒', 'Sichere Zahlung via Stripe'],
                  ['↩️', '14 Tage Rückgaberecht'],
                  ['♾️', 'Lebenslanger Zugriff'],
                ].map(([icon, text]) => (
                  <div key={text} className="purchase-feature">
                    <span>{icon}</span> <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="share-card">
              <span className="text-muted" style={{fontSize:'0.85rem'}}>Teilen:</span>
              <button className="btn btn-outline btn-sm">🔗 Link kopieren</button>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="related-section">
            <h2 style={{marginBottom: 24}}>Ähnliche Anleitungen</h2>
            <div className="grid-3">
              {related.map(g => <GuideCard key={g.id} guide={g} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
