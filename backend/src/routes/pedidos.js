'use strict'
const { Router } = require('express')
const { query, queryOne } = require('../db')
const { verifyToken, requireEditor, requireAdmin } = require('../middleware/auth')

const router = Router()

function fmt(row) {
  if (!row) return null
  const { id, created_at, updated_at, ...rest } = row
  return { id, attributes: { ...rest, createdAt: created_at, updatedAt: updated_at } }
}

router.get('/pedidos', verifyToken, requireEditor, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 500')
    res.json({ data: rows.map(fmt), meta: { pagination: { total: rows.length } } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Public: create order (from checkout)
router.post('/pedidos', async (req, res) => {
  try {
    const { nombre_cliente, email_cliente, telefono_cliente, items, subtotal,
      descuento_monto, total, codigo_descuento, estado, payment_id, notas } = req.body.data || req.body

    const row = await queryOne(
      `INSERT INTO pedidos (nombre_cliente, email_cliente, telefono_cliente, items, subtotal,
        descuento_monto, total, codigo_descuento, estado, payment_id, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [nombre_cliente, email_cliente, telefono_cliente || null,
       items ? JSON.stringify(items) : null,
       subtotal || 0, descuento_monto || 0, total || 0,
       codigo_descuento || null, estado || 'pendiente', payment_id || null, notas || null]
    )

    // Increment discount usage if a code was used
    if (codigo_descuento) {
      await query('UPDATE descuentos SET usos_actuales = usos_actuales + 1 WHERE codigo = $1', [codigo_descuento])
    }

    res.status(201).json({ data: fmt(row) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al crear pedido' })
  }
})

router.put('/pedidos/:id', verifyToken, requireEditor, async (req, res) => {
  try {
    const body = req.body.data || req.body
    const fields = []
    const params = []

    for (const key of ['nombre_cliente', 'email_cliente', 'telefono_cliente', 'estado', 'payment_id', 'notas']) {
      if (key in body) { params.push(body[key]); fields.push(`${key} = $${params.length}`) }
    }
    if (!fields.length) return res.status(400).json({ error: 'Sin campos para actualizar' })

    params.push(req.params.id)
    fields.push(`updated_at = NOW()`)
    await query(`UPDATE pedidos SET ${fields.join(', ')} WHERE id = $${params.length}`, params)

    const updated = await queryOne('SELECT * FROM pedidos WHERE id = $1', [req.params.id])
    res.json({ data: fmt(updated) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al actualizar' })
  }
})

router.delete('/pedidos/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM pedidos WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar' })
  }
})

module.exports = router
