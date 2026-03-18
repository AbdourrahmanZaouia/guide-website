# Guide.de — Anleitungs-Marktplatz

> Der Marktplatz für Anleitungen, Guides und Fachwissen — als PDF oder DOCX.
> Verkäufer behalten 85%, Guide nimmt 15% Provision.

---

## 🚀 Schnellstart (Lokal)

### Voraussetzungen
- Node.js 18+
- npm 9+
- Netlify CLI (für lokales Backend-Testing)

### 1. Installation

```bash
# Repository klonen / Ordner öffnen
cd guide

# Frontend-Dependencies installieren
cd frontend
npm install

# Backend-Dependencies installieren
cd ../backend
npm install
cd ..
```

### 2. Umgebungsvariablen einrichten

```bash
cp .env.example .env
# .env öffnen und Werte eintragen (mind. JWT_SECRET)
```

### 3. Lokal starten (mit Netlify CLI)

```bash
# Netlify CLI installieren (einmalig)
npm install -g netlify-cli

# Starten (Frontend + Functions gleichzeitig)
netlify dev
```

→ Öffne http://localhost:8888

**Ohne Netlify CLI (nur Frontend):**
```bash
cd frontend
npm run dev
```
→ Öffne http://localhost:5173  
(Backend-Calls schlagen ohne Netlify CLI fehl — Demo-Modus greift automatisch)

---

## 🌐 Deployment auf Netlify

### Methode 1: Netlify CLI (empfohlen)

```bash
# Einloggen
netlify login

# Site initialisieren
netlify init

# Deployen
netlify deploy --prod
```

### Methode 2: GitHub + Auto-Deploy

1. Code in GitHub pushen
2. netlify.com → "New site from Git"
3. Repository auswählen
4. Build-Einstellungen werden aus `netlify.toml` übernommen
5. Environment Variables unter Site Settings → Environment → Environment Variables eintragen

### Benötigte Netlify Environment Variables

| Variable | Wo holen |
|---|---|
| `JWT_SECRET` | Selbst generieren: `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | stripe.com → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | stripe.com → Developers → Webhooks |

---

## 💳 Stripe einrichten

### 1. Stripe Account erstellen
→ https://stripe.com → Registrieren

### 2. API Keys kopieren
→ Dashboard → Developers → API Keys  
→ `STRIPE_SECRET_KEY` = Secret key (sk_test_...)

### 3. Webhook einrichten (für Kauf-Bestätigungen)
→ Dashboard → Developers → Webhooks → Add endpoint  
→ URL: `https://DEINE-SITE.netlify.app/.netlify/functions/stripe-webhook`  
→ Events: `checkout.session.completed`, `payment_intent.payment_failed`  
→ `STRIPE_WEBHOOK_SECRET` = Signing secret (whsec_...)

### Unterstützte Zahlungsmethoden
- Kredit-/Debitkarte (Visa, Mastercard, Amex)
- PayPal
- SEPA-Lastschrift
- Klarna (Ratenkauf)

*Hinweis: Nicht alle Methoden sind in jedem Stripe-Konto standardmäßig aktiviert.*

---

## 🗂️ Projektstruktur

```
guide/
├── netlify.toml              # Netlify-Konfiguration
├── .env.example              # Umgebungsvariablen-Vorlage
│
├── frontend/                 # React + Vite
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           # Routing
│       ├── index.css         # Design-System
│       ├── context/
│       │   ├── AuthContext.jsx   # Login-Status
│       │   └── CartContext.jsx   # Warenkorb
│       ├── components/
│       │   ├── Navbar.jsx/css
│       │   ├── GuideCard.jsx/css
│       │   └── Footer.jsx/css
│       ├── pages/
│       │   ├── Home.jsx/css      # Startseite
│       │   ├── Browse.jsx/css    # Suche & Filter
│       │   ├── GuideDetail.jsx   # Einzelne Anleitung
│       │   ├── Login.jsx/css     # Anmeldung
│       │   ├── Signup.jsx        # Registrierung
│       │   ├── Dashboard.jsx     # Nutzer-Dashboard
│       │   ├── Upload.jsx        # Anleitung hochladen
│       │   ├── Checkout.jsx      # Kasse
│       │   └── Success.jsx       # Bestellung erfolgreich
│       └── utils/
│           └── data.js           # Demo-Anleitungen
│
└── backend/
    ├── package.json
    └── functions/            # Netlify Functions (Serverless)
        ├── auth-login.js     # POST /auth-login
        ├── auth-signup.js    # POST /auth-signup
        ├── create-checkout.js # POST /create-checkout (Stripe)
        └── stripe-webhook.js  # POST /stripe-webhook
```

---

## 🔐 Demo-Login

| E-Mail | Passwort |
|---|---|
| demo@guide.de | demo123 |

---

## 📦 Produktions-Upgrade (Empfehlungen)

### Datenbank
Aktuell sind Nutzer und Anleitungen im Frontend-Code gespeichert.  
Für Produktion empfehlen wir **Supabase** (PostgreSQL + Auth + Storage):

```bash
npm install @supabase/supabase-js
```

Tabellen:
- `users` — Nutzer-Profile
- `guides` — Anleitungen (Metadaten)
- `purchases` — Käufe (user_id, guide_id, stripe_session_id)
- `files` — Supabase Storage für PDFs/DOCXs

### E-Mail
Für Kauf-Bestätigungen: **Resend** (resend.com)

```bash
npm install resend
```

### Seller-Auszahlungen
Für automatische Auszahlungen an Verkäufer: **Stripe Connect**  
Jeder Verkäufer verbindet sein Stripe-Konto → Auszahlung automatisch bei Kauf.

---

## 📊 Geschäftsmodell

| | |
|---|---|
| Provision | 15% pro Verkauf |
| Verkäufer-Anteil | 85% pro Verkauf |
| Zahlungsabwicklung | Stripe (Gebühren ~1.4% + 0.25€ für EU-Karten) |
| Hosting | Netlify Free Tier (bis 100GB Bandwidth/Monat) |

**Beispiel:** Anleitung für €14,90  
→ Guide erhält: €2,24  
→ Verkäufer erhält: €12,67 (nach Stripe-Gebühren)

---

## ⚖️ Rechtliches (DE)

Vor dem Launch checken:
- [ ] Impressum (§5 TMG)
- [ ] Datenschutzerklärung (DSGVO)
- [ ] AGB mit Widerrufsbelehrung (14 Tage bei digitalen Gütern)
- [ ] Steuer-Setup (Kleinunternehmer oder Regelbesteuerung)
- [ ] OSS-Verfahren für EU-Mehrwertsteuer (wenn international)

---

## 🛠️ Tech Stack

| | |
|---|---|
| Frontend | React 18, React Router 6, Vite 5 |
| Styling | Vanilla CSS, DM Serif Display + DM Sans |
| Backend | Netlify Functions (Node.js Serverless) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Payments | Stripe Checkout + Webhooks |
| Hosting | Netlify |

---

Viel Erfolg mit Guide! 🚀
