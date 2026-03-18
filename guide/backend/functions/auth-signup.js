const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const JWT_SECRET = process.env.JWT_SECRET || 'guide-secret-dev-key-change-in-production'

// In production: store in DB (Supabase, FaunaDB, PlanetScale etc.)
// For demo, we accept any signup and return a valid token
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  try {
    const { name, email, password } = JSON.parse(event.body || '{}')

    if (!name || !email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Alle Felder sind erforderlich' }) }
    }

    if (password.length < 6) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Passwort muss mindestens 6 Zeichen haben' }) }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ungültige E-Mail-Adresse' }) }
    }

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const token = jwt.sign(
      { userId, email, role: 'buyer' },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        token,
        user: { id: userId, name, email, role: 'buyer' }
      })
    }
  } catch (err) {
    console.error('Signup error:', err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Interner Serverfehler' }) }
  }
}
