const stripe = require('stripe')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  try {
    const { items, email, name } = JSON.parse(event.body || '{}')

    if (!items || items.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Keine Artikel im Warenkorb' }) }
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      // Demo mode: return success without Stripe
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ demo: true, message: 'Demo mode — Stripe not configured' })
      }
    }

    const stripeClient = stripe(stripeKey)

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.title,
          description: `${item.format} · ${item.pages} Seiten · ${item.category}`,
          metadata: { guide_id: item.id }
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: 1
    }))

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card', 'paypal', 'sepa_debit', 'klarna'],
      mode: 'payment',
      customer_email: email,
      line_items: lineItems,
      success_url: `${process.env.URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:5173'}/checkout`,
      metadata: {
        customer_name: name,
        guide_ids: items.map(i => i.id).join(',')
      },
      payment_intent_data: {
        // Guide takes 15% as application fee
        // In production: use Stripe Connect for seller payouts
        description: `Guide.de — ${items.length} Anleitung(en)`
      }
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url, sessionId: session.id })
    }
  } catch (err) {
    console.error('Stripe error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Zahlungsfehler: ' + err.message })
    }
  }
}
