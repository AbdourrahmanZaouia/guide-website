import { Link } from 'react-router-dom'
import './Success.css'

export default function Success() {
  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-check">✓</div>
        <h1>Zahlung erfolgreich!</h1>
        <p>Vielen Dank für deinen Kauf. Du erhältst in wenigen Minuten eine E-Mail mit deinem Download-Link.</p>
        <div className="success-info">
          <div className="info-item">
            <span>📥</span>
            <div>
              <strong>Sofort-Download</strong>
              <p>Die Anleitungen stehen in deinem Dashboard zum Download bereit.</p>
            </div>
          </div>
          <div className="info-item">
            <span>📧</span>
            <div>
              <strong>E-Mail-Bestätigung</strong>
              <p>Du erhältst eine Bestätigung mit Rechnung und Download-Links.</p>
            </div>
          </div>
          <div className="info-item">
            <span>↩️</span>
            <div>
              <strong>14 Tage Rückgabe</strong>
              <p>Nicht zufrieden? Kontaktiere uns und wir erstatten den Betrag.</p>
            </div>
          </div>
        </div>
        <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
          <Link to="/dashboard" className="btn btn-primary btn-lg">Zu meinen Käufen</Link>
          <Link to="/browse" className="btn btn-outline btn-lg">Weitere entdecken</Link>
        </div>
      </div>
    </div>
  )
}
