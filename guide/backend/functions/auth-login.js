const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Demo users — in production: replace with real DB (Supabase, PlanetScale, etc.)
const USERS = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@guide.de',
    passwordHash: bcrypt.hashSync('demo123', 10),
    role: 'seller'
  }
]

const JWT_SECRET = process.env.JWT_SECRET || 'guide-secret-dev-key-change-in-production'

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
    const { email, password } = JSON.parse(event.body || '{}')

    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'E-Mail und Passwort erforderlich' }) }
    }

    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'E-Mail oder Passwort falsch' }) }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      })
    }
  } catch (err) {
    console.error('Login error:', err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Interner Serverfehler' }) }
  }
}
