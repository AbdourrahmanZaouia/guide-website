const stripe = require('stripe')

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    console.log('Stripe not configured — webhook skipped')
    return { statusCode: 200, headers, body: JSON.stringify({ received: true }) }
  }

  const stripeClient = stripe(stripeKey)
  const sig = event.headers['stripe-signature']

  let stripeEvent
  try {
    stripeEvent = stripeClient.webhooks.constructEvent(event.body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return { statusCode: 400, body: `Webhook Error: ${err.message}` }
  }

  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object
      console.log('Payment completed:', {
        sessionId: session.id,
        email: session.customer_email,
        amount: session.amount_total,
        guideIds: session.metadata?.guide_ids
      })

      // TODO: 
      // 1. Mark guides as purchased for user in DB
      // 2. Send download email via Resend/SendGrid
      // 3. Record sale for seller payout tracking
      // 4. Update download counters
      break
    }
    case 'payment_intent.payment_failed': {
      console.log('Payment failed:', stripeEvent.data.object.id)
      break
    }
    default:
      console.log('Unhandled event type:', stripeEvent.type)
  }

  return { statusCode: 200, headers, body: JSON.stringify({ received: true }) }
}
