import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Checkout.css'

export default function Checkout() {
  const { items, total, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [payMethod, setPayMethod] = useState('card')
  const [form, setForm] = useState({ email: user?.email || '', name: user?.name || '' })

  const formatPrice = (p) => `€${p.toFixed(2).replace('.', ',')}`

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (items.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, email: form.email, name: form.name, payMethod })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        // Demo: simulate success
        clearCart()
        navigate('/success')
      }
    } catch {
      clearCart()
      navigate('/success')
    } finally { setLoading(false) }
  }

  if (items.length === 0) return (
    <div className="checkout-empty">
      <div className="container-narrow" style={{textAlign:'center', padding:'80px 0'}}>
        <div style={{fontSize:'3rem', marginBottom:16}}>🛒</div>
        <h2>Dein Warenkorb ist leer</h2>
        <p className="text-muted" style={{marginTop:8, marginBottom:24}}>Entdecke unsere Anleitungen und füge sie zum Warenkorb hinzu.</p>
        <Link to="/browse" className="btn btn-primary btn-lg">Anleitungen entdecken</Link>
      </div>
    </div>
  )

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-layout">
          {/* Left: Form */}
          <div className="checkout-main">
            <h1 style={{marginBottom:32}}>Zur Kasse</h1>

            <form onSubmit={handleCheckout}>
              {/* Contact */}
              <div className="checkout-section">
                <h3>Kontaktdaten</h3>
                <div className="form-row-checkout">
                  <div className="form-group">
                    <label>Vollständiger Name</label>
                    <input className="input" type="text" required
                      value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>E-Mail</label>
                    <input className="input" type="email" required
                      placeholder="für den Download-Link"
                      value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="checkout-section">
                <h3>Zahlungsmethode</h3>
                <div className="pay-methods">
                  {[
                    { id: 'card', label: 'Kredit-/Debitkarte', icon: '💳' },
                    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                    { id: 'sepa', label: 'SEPA-Lastschrift', icon: '🏦' },
                    { id: 'klarna', label: 'Klarna', icon: '🛍️' },
                  ].map(m => (
                    <button type="button" key={m.id}
                      className={`pay-method-btn ${payMethod === m.id ? 'active' : ''}`}
                      onClick={() => setPayMethod(m.id)}>
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {payMethod === 'card' && (
                  <div className="card-form fade-in">
                    <div className="form-group">
                      <label>Kartennummer</label>
                      <input className="input" placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div className="form-row-checkout">
                      <div className="form-group">
                        <label>Ablaufdatum</label>
                        <input className="input" placeholder="MM/JJ" maxLength={5} />
                      </div>
                      <div className="form-group">
                        <label>CVC</label>
                        <input className="input" placeholder="123" maxLength={4} />
                      </div>
                    </div>
                  </div>
                )}
                {payMethod === 'sepa' && (
                  <div className="card-form fade-in">
                    <div className="form-group">
                      <label>IBAN</label>
                      <input className="input" placeholder="DE89 3704 0044 0532 0130 00" />
                    </div>
                  </div>
                )}
                {(payMethod === 'paypal' || payMethod === 'klarna') && (
                  <div className="alert alert-info fade-in" style={{marginTop:16}}>
                    Du wirst nach dem Klick auf "Jetzt kaufen" zu {payMethod === 'paypal' ? 'PayPal' : 'Klarna'} weitergeleitet.
                  </div>
                )}
              </div>

              <div className="security-badges">
                <span>🔒 SSL-verschlüsselt</span>
                <span>Stripe Payments</span>
                <span>14 Tage Rückgabe</span>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{marginTop:8}}>
                {loading ? 'Weiterleitung…' : `Jetzt kaufen — ${formatPrice(total)}`}
              </button>
            </form>
          </div>

          {/* Right: Summary */}
          <div className="checkout-sidebar">
            <h3 style={{marginBottom:20}}>Bestellung ({items.length})</h3>
            <div className="order-items">
              {items.map(item => (
                <div key={item.id} className="order-item">
                  <div className="order-item-cover" style={{background: item.coverColor}}>
                    <span>{item.icon}</span>
                  </div>
                  <div className="order-item-info">
                    <div className="order-item-title">{item.title}</div>
                    <div className="text-faint" style={{fontSize:'0.78rem'}}>{item.format}</div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4}}>
                    <span style={{fontWeight:600}}>{formatPrice(item.price)}</span>
                    <button className="remove-btn" onClick={() => removeItem(item.id)}>Entfernen</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row"><span>Zwischensumme</span><span>{formatPrice(total)}</span></div>
              <div className="summary-row"><span>MwSt. (19%)</span><span>{formatPrice(total * 0.19 / 1.19)}</span></div>
              <div className="summary-row summary-total">
                <span>Gesamt</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="add-more">
              <Link to="/browse" className="btn btn-outline btn-full btn-sm">+ Weitere Anleitungen</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
