import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './GuideCard.css'

export default function GuideCard({ guide }) {
  const { addItem, hasItem } = useCart()
  const inCart = hasItem(guide.id)

  const formatPrice = (p) => `€${p.toFixed(2).replace('.', ',')}`

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ opacity: i < Math.floor(guide.rating) ? 1 : 0.25 }}>★</span>
  ))

  return (
    <div className="guide-card card">
      <Link to={`/guide/${guide.id}`} className="guide-card-cover" style={{ background: guide.coverColor }}>
        <span className="guide-icon">{guide.icon}</span>
        <span className="badge badge-category">{guide.category}</span>
        <div className="guide-format">{guide.format} · {guide.pages}S.</div>
      </Link>
      <div className="guide-card-body">
        <Link to={`/guide/${guide.id}`} className="guide-card-title">{guide.title}</Link>
        <p className="guide-card-desc">{guide.description.slice(0, 90)}…</p>
        <div className="guide-card-meta">
          <span className="guide-author">{guide.author}</span>
          <div className="guide-rating">
            <div className="stars">{stars}</div>
            <span className="rating-count">({guide.reviewCount})</span>
          </div>
        </div>
        <div className="guide-card-footer">
          <span className="price">{formatPrice(guide.price)}</span>
          <button
            className={`btn btn-sm ${inCart ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => addItem(guide)}
            disabled={inCart}
          >
            {inCart ? '✓ Im Warenkorb' : 'Kaufen'}
          </button>
        </div>
      </div>
    </div>
  )
}
