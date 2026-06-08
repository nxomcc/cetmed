'use strict'
const { Router } = require('express')
const crypto = require('crypto')
const { query, queryOne } = require('../db')
const moodle = require('../lib/moodle')
const { enrollOrderCourses } = require('../lib/enrollment')

const router = Router()

// Helper to generate Placetopay WSSE-like authentication
function generateAuth() {
  const login = process.env.GETNET_LOGIN
  const secretKey = process.env.GETNET_SECRET_KEY

  if (!login || !secretKey) {
    throw new Error('Faltan credenciales de Getnet en el servidor (GETNET_LOGIN o GETNET_SECRET_KEY)')
  }

  const seed = new Date().toISOString()
  const nonceBytes = crypto.randomBytes(16)
  const nonceBase64 = nonceBytes.toString('base64')

  const hasher = crypto.createHash('sha256')
  hasher.update(nonceBytes)
  hasher.update(seed)
  hasher.update(secretKey)
  const tranKey = hasher.digest('base64')

  return {
    login,
    tranKey,
    nonce: nonceBase64,
    seed
  }
}

// POST /api/pagos/intent
// Creates order in database and initiates Getnet checkout session
router.post('/pagos/intent', async (req, res) => {
  try {
    const { items, nombre_cliente, email_cliente, telefono_cliente, rut_cliente, codigo_descuento, descuento_monto, notas } = req.body.data || req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No se recibieron productos' })
    }

    if (!nombre_cliente || !email_cliente) {
      return res.status(400).json({ error: 'Nombre y correo electrónico del cliente son obligatorios' })
    }

    // 1. Calculate amount from database (prevent client tampering)
    let subtotal = 0
    for (const item of items) {
      const curso = await queryOne('SELECT precio FROM cursos WHERE id = $1', [item.id])
      if (!curso) {
        return res.status(404).json({ error: `Curso con ID ${item.id} no encontrado` })
      }
      subtotal += Number(curso.precio)
    }

    const descVal = Number(descuento_monto) || 0
    const total = Math.max(0, subtotal - descVal)

    if (total <= 0) {
      return res.status(400).json({ error: 'El monto total debe ser mayor a 0' })
    }

    // 2. Create "pendiente" order in database
    const order = await queryOne(
      `INSERT INTO pedidos (nombre_cliente, email_cliente, telefono_cliente, items, subtotal,
        descuento_monto, total, codigo_descuento, estado, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [
        nombre_cliente,
        email_cliente.toLowerCase(),
        telefono_cliente || null,
        JSON.stringify(items),
        subtotal,
        descVal,
        total,
        codigo_descuento || null,
        'pendiente',
        notas || null
      ]
    )

    // Increment discount usage if used
    if (codigo_descuento) {
      await query('UPDATE descuentos SET usos_actuales = usos_actuales + 1 WHERE codigo = $1', [codigo_descuento])
    }

    // 3. Prepare Getnet session payload
    const endpoint = process.env.GETNET_ENDPOINT || 'https://checkout.getnet.cl'
    const auth = generateAuth()

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1'
    const userAgent = req.get('User-Agent') || 'Mozilla/5.0'

    // Expiration date (30 minutes from now)
    const expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    // Base URL of client to build returnUrl
    const referer = req.get('Referer')
    const origin = referer ? new URL(referer).origin : 'http://localhost:5173'
    const returnUrl = `${origin}/checkout/retorno?order_id=${order.id}`

    const payload = {
      auth,
      locale: 'es_CL',
      payment: {
        reference: `PED-${order.id}`,
        description: 'Capacitaciones CETMED',
        amount: {
          currency: 'CLP',
          total: total
        }
      },
      buyer: {
        name: nombre_cliente,
        email: email_cliente.toLowerCase(),
        phone: telefono_cliente || undefined,
        document: rut_cliente || undefined,
        documentType: rut_cliente ? 'RUT' : undefined
      },
      expiration,
      returnUrl,
      ipAddress,
      userAgent
    }

    // 4. Request Getnet checkout session
    console.log(`[GETNET] Iniciando pago para pedido #${order.id} - Monto: $${total} CLP`)
    const response = await fetch(`${endpoint}/api/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok || data.status?.status === 'ERROR') {
      console.error('[GETNET ERROR RESPONSE]', data)
      throw new Error(data.status?.message || 'Error de comunicación con Getnet')
    }

    // 5. Update order with payment session ID (requestId)
    await query('UPDATE pedidos SET payment_id = $1 WHERE id = $2', [data.requestId.toString(), order.id])

    // 6. Return redirection URL to frontend
    res.json({ processUrl: data.processUrl, orderId: order.id })
  } catch (err) {
    console.error('[GETNET EXCEPTION]', err)
    res.status(500).json({ error: err.message || 'Error al procesar el pago con Getnet' })
  }
})

// POST /api/pagos/simular-compra
// Test-only purchase flow: creates a completed order and enrolls the buyer in Moodle.
router.post('/pagos/simular-compra', async (req, res) => {
  try {
    if (process.env.ENABLE_PAYMENT_SIMULATION !== 'true') {
      return res.status(403).json({ error: 'La simulacion de compras no esta habilitada en este entorno' })
    }

    const { items, nombre_cliente, email_cliente, telefono_cliente, codigo_descuento, descuento_monto, notas } = req.body.data || req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No se recibieron cursos para simular la compra' })
    }

    if (!nombre_cliente || !email_cliente) {
      return res.status(400).json({ error: 'Nombre y correo electronico del cliente son obligatorios' })
    }

    let subtotal = 0
    for (const item of items) {
      const curso = await queryOne('SELECT precio FROM cursos WHERE id = $1', [item.id])
      if (!curso) {
        return res.status(404).json({ error: `Curso con ID ${item.id} no encontrado` })
      }
      subtotal += Number(curso.precio)
    }

    const descVal = Number(descuento_monto) || 0
    const total = Math.max(0, subtotal - descVal)

    const order = await queryOne(
      `INSERT INTO pedidos (nombre_cliente, email_cliente, telefono_cliente, items, subtotal,
        descuento_monto, total, codigo_descuento, estado, payment_id, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        nombre_cliente,
        email_cliente.toLowerCase(),
        telefono_cliente || null,
        JSON.stringify(items.map(i => ({ id: i.id }))),
        subtotal,
        descVal,
        total,
        codigo_descuento || null,
        'completado',
        `SIM-${Date.now()}`,
        notas || 'Compra simulada para pruebas de Moodle',
      ]
    )

    const enrollment = await enrollOrderCourses(order)
    res.status(201).json({ orderId: order.id, status: order.estado, enrollment })
  } catch (err) {
    console.error('[SIMULACION COMPRA ERROR]', err)
    res.status(500).json({ error: err.message || 'Error al simular la compra' })
  }
})

// GET /api/pagos/status/:order_id
// Checks payment status of a given order from Getnet and updates DB
router.get('/pagos/status/:order_id', async (req, res) => {
  try {
    const orderId = req.params.order_id
    const order = await queryOne('SELECT * FROM pedidos WHERE id = $1', [orderId])

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    // If already updated to a final state, return it immediately
    if (order.estado !== 'pendiente') {
      return res.json({ status: order.estado })
    }

    if (!order.payment_id) {
      return res.status(400).json({ error: 'El pedido no tiene una transacción de Getnet asociada' })
    }

    // Request session status from Getnet
    const endpoint = process.env.GETNET_ENDPOINT || 'https://checkout.getnet.cl'
    const auth = generateAuth()

    const response = await fetch(`${endpoint}/api/session/${order.payment_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ auth })
    })

    const data = await response.json()

    if (!response.ok || data.status?.status === 'ERROR') {
      console.error('[GETNET STATUS ERROR RESPONSE]', data)
      throw new Error(data.status?.message || 'Error de comunicación con Getnet')
    }

    const getnetStatus = data.status?.status // 'APPROVED', 'REJECTED', 'PENDING', etc.
    console.log(`[GETNET STATUS] Pedido #${orderId} - Getnet responde: ${getnetStatus}`)

    let finalState = 'pendiente'
    if (getnetStatus === 'APPROVED') {
      finalState = 'completado'

      // Matricular en Moodle de forma asíncrona sin bloquear la respuesta de la petición HTTP
      ;(async () => {
        try {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
          if (Array.isArray(items)) {
            console.log(`[MOODLE] Iniciando matrícula automática para pedido #${orderId} (${order.email_cliente})`)
            
            // 1. Buscar si el usuario ya existe en Moodle
            let userMoodle = await moodle.obtenerUsuarioPorEmail(order.email_cliente)
            let isNewUser = false
            let tempPassword = null

            if (!userMoodle) {
              // 2. Si no existe, crear la cuenta en Moodle
              const result = await moodle.crearUsuarioMoodle(
                order.nombre_cliente,
                order.email_cliente,
                null,
                order.telefono_cliente
              )
              userMoodle = { id: result.id, username: result.username }
              isNewUser = true
              tempPassword = result.password
            }

            // 3. Matricular al estudiante en cada curso comprado
            for (const item of items) {
              const curso = await queryOne('SELECT moodle_course_id FROM cursos WHERE id = $1', [item.id])
              if (curso && curso.moodle_course_id) {
                await moodle.matricularUsuarioEnCurso(userMoodle.id, curso.moodle_course_id)
              } else {
                console.warn(`[MOODLE WARNING] El curso ID #${item.id} no tiene un moodle_course_id configurado en la base de datos.`)
              }
            }

            console.log(`[MOODLE] ¡Matrícula exitosa para el estudiante Moodle ID #${userMoodle.id}!`)
            if (isNewUser) {
              console.log(`[MOODLE] Envía estos datos al estudiante -> Usuario: ${userMoodle.username} | Password temporal: ${tempPassword}`)
              // TODO: Conectar con un servicio de correos aquí para notificar al estudiante
            }
          }
        } catch (moodleErr) {
          console.error('[MOODLE INTEGRATION ERROR]', moodleErr.message)
        }
      })()

    } else if (getnetStatus === 'REJECTED') {
      finalState = 'rechazado'
    }

    // Update database order state if changed
    if (finalState !== 'pendiente') {
      await query('UPDATE pedidos SET estado = $1, updated_at = NOW() WHERE id = $2', [finalState, orderId])
    }

    res.json({ status: finalState, getnetStatus })
  } catch (err) {
    console.error('[GETNET STATUS CHECK EXCEPTION]', err)
    res.status(500).json({ error: err.message || 'Error al consultar estado del pago' })
  }
})

module.exports = router
