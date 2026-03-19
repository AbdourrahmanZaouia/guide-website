import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../context/AuthContext'
import './GuideCard.css'

export default function GuideCard({ guide, isReal = false }) {
  const { addItem, hasItem } = useCart()
  const inCart = hasItem(guide.id)

  const formatPrice = (p) => `€${(+p).toFixed(2).replace('.', ',')}`

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ opacity: i < Math.floor(guide.rating || 0) ? 1 : 0.25 }}>★</span>
  ))

  // Cover-Bild URL aus Supabase Storage holen
  const getCoverUrl = () => {
    if (guide.cover_image_path) {
      const { data } = supabase.storage.from('guides').getPublicUrl(guide.cover_image_path)
      return data.publicUrl
    }
    return null
  }

  const coverUrl = isReal ? getCoverUrl() : null
  const coverColor = guide.cover_color || guide.coverColor || '#f0d4c2'
  const icon = guide.icon || '📄'
  const category = guide.category || ''
  const title = guide.title || ''
  const description = guide.description || ''
  const author = guide.author_name || guide.author || ''
  const price = guide.price || 0
  const format = guide.format || 'PDF'
  const pages = guide.pages || ''
  const rating = guide.rating || 0
  const reviewCount = guide.review_count || guide.reviewCount || 0

  const cartItem = {
    id: guide.id,
    title,
    price: +price,
    format,
    pages,
    category,
    coverColor,
    icon,
    cover_image_path: guide.cover_image_path
  }

  return (
    <div className="guide-card card">
      <Link to={`/guide/${guide.id}`} className="guide-card-cover" style={{ background: coverColor }}>
        {coverUrl ? (
          <img src={coverUrl} alt={title} style={{width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0}} />
        ) : (
          <span className="guide-icon">{icon}</span>
        )}
        <span className="badge badge-category">{category}</span>
        <div className="guide-format">{format}{pages ? ` · ${pages}S.` : ''}</div>
      </Link>
      <div className="guide-card-body">
        <Link to={`/guide/${guide.id}`} className="guide-card-title">{title}</Link>
        <p className="guide-card-desc">{description.slice(0, 90)}…</p>
        <div className="guide-card-meta">
          <span className="guide-author">{author}</span>
          <div className="guide-rating">
            <div className="stars">{stars}</div>
            <span className="rating-count">({reviewCount})</span>
          </div>
        </div>
        <div className="guide-card-footer">
          <span className="price">{formatPrice(price)}</span>
          <button
            className={`btn btn-sm ${inCart ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => addItem(cartItem)}
            disabled={inCart}
          >
            {inCart ? '✓ Im Warenkorb' : 'Kaufen'}
          </button>
        </div>
      </div>
    </div>
  )
}
