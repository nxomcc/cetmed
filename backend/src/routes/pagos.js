'use strict'
const { Router } = require('express')
const { queryOne } = require('../db')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const router = Router()

// POST /api/pagos/intent
router.post('/pagos/intent', async (req, res) => {
  try {
    const { items } = req.body.data || req.body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No se recibieron productos' })
    }

    let amount = 0
    for (const item of items) {
      const curso = await queryOne('SELECT precio FROM cursos WHERE id = $1', [item.id])
      if (!curso) {
        return res.status(404).json({ error: `Curso con ID ${item.id} no encontrado` })
      }
      amount += Number(curso.precio)
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'El monto total debe ser mayor a 0' })
    }

    // Stripe uses smallest currency unit — CLP has no decimals (already integer)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'clp',
      automatic_payment_methods: { enabled: true },
      metadata: {
        curso_ids: items.map(i => i.id).join(','),
      },
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('[STRIPE ERROR]', err)
    res.status(500).json({ error: err.message || 'Error al crear PaymentIntent' })
  }
})

module.exports = router
