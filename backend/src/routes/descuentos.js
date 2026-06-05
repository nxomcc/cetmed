'use strict'
const { Router } = require('express')
const { query, queryOne } = require('../db')
const { verifyToken, requireAdmin } = require('../middleware/auth')

const router = Router()

function fmt(row) {
  if (!row) return null
  const { id, created_at, ...rest } = row
  return { id, attributes: { ...rest, createdAt: created_at } }
}

router.get('/descuentos', verifyToken, requireAdmin, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM descuentos ORDER BY created_at DESC')
    res.json({ data: rows.map(fmt), meta: { pagination: { total: rows.length } } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Public: validate a discount code
router.post('/descuentos/validar', async (req, res) => {
  try {
    const { codigo, subtotal } = req.body
    if (!codigo) return res.json({ valido: false, error: 'Código requerido' })

    const d = await queryOne(
      'SELECT * FROM descuentos WHERE codigo = $1 AND activo = true',
      [codigo.toUpperCase().trim()]
    )

    if (!d) return res.json({ valido: false, error: 'Código no válido' })
    if (d.fecha_expiracion && new Date(d.fecha_expiracion) < new Date())
      return res.json({ valido: false, error: 'Código expirado' })
    if (d.limite_usos && d.usos_actuales >= d.limite_usos)
      return res.json({ valido: false, error: 'Código sin usos disponibles' })

    const sub = Number(subtotal) || 0
    const montoDescuento = d.tipo === 'porcentaje'
      ? Math.round(sub * d.valor / 100)
      : Math.min(Number(d.valor), sub)

    res.json({
      valido: true,
      descuento: { id: d.id, codigo: d.codigo, tipo: d.tipo, valor: d.valor },
      montoDescuento,
      total: Math.max(0, sub - montoDescuento),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

router.post('/descuentos', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { codigo, tipo, valor, activo, fecha_expiracion, limite_usos, descripcion } = req.body.data || req.body
    const row = await queryOne(
      `INSERT INTO descuentos (codigo, tipo, valor, activo, fecha_expiracion, limite_usos, descripcion)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [codigo.toUpperCase().trim(), tipo, valor, activo !== false,
       fecha_expiracion || null, limite_usos || null, descripcion || null]
    )
    res.status(201).json({ data: fmt(row) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al crear' })
  }
})

router.put('/descuentos/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { codigo, tipo, valor, activo, fecha_expiracion, limite_usos, descripcion } = req.body.data || req.body
    const row = await queryOne(
      `UPDATE descuentos SET codigo=$1, tipo=$2, valor=$3, activo=$4,
        fecha_expiracion=$5, limite_usos=$6, descripcion=$7 WHERE id=$8 RETURNING *`,
      [codigo?.toUpperCase().trim(), tipo, valor, activo,
       fecha_expiracion || null, limite_usos || null, descripcion || null, req.params.id]
    )
    res.json({ data: fmt(row) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al actualizar' })
  }
})

router.delete('/descuentos/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM descuentos WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar' })
  }
})

module.exports = router
