import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">G</span>
              <span className="logo-text">guide</span>
            </Link>
            <p className="footer-tagline">Der Marktplatz für Anleitungen, Guides und Fachwissen — als PDF oder DOCX.</p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter" className="social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.852L2.25 2.25h6.773l4.25 5.626L18.244 2.25z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="social-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Entdecken</h4>
            <ul>
              <li><Link to="/browse">Alle Anleitungen</Link></li>
              <li><Link to="/browse?cat=Handwerk+%26+DIY">Handwerk & DIY</Link></li>
              <li><Link to="/browse?cat=Technik+%26+Software">Technik & Software</Link></li>
              <li><Link to="/browse?cat=Business">Business</Link></li>
              <li><Link to="/browse?cat=Kochen+%26+Backen">Kochen & Backen</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Verkäufer</h4>
            <ul>
              <li><Link to="/upload">Anleitung verkaufen</Link></li>
              <li><Link to="/signup">Konto erstellen</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><a href="#">Provisionen & Preise</a></li>
              <li><a href="#">Verkäufer-FAQ</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Unternehmen</h4>
            <ul>
              <li><a href="#">Über Guide</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Presse</a></li>
              <li><a href="#">Kontakt</a></li>
              <li><a href="#">Datenschutz</a></li>
              <li><a href="#">AGB</a></li>
              <li><a href="#">Impressum</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Guide. Alle Rechte vorbehalten. · 15% Provision auf alle Verkäufe · Zahlungen via Stripe</p>
          <div className="payment-icons">
            <span className="payment-icon">VISA</span>
            <span className="payment-icon">MC</span>
            <span className="payment-icon">PayPal</span>
            <span className="payment-icon">SEPA</span>
            <span className="payment-icon">Klarna</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
