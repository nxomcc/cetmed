'use strict'
const { Router } = require('express')
const { query, queryOne } = require('../db')
const { verifyToken, requireEditor, requireAdmin } = require('../middleware/auth')

const router = Router()

function fmt(row) {
  if (!row) return null
  const { id, created_at, curso_titulo, ...rest } = row
  return {
    id,
    attributes: {
      ...rest,
      cursoTitulo: curso_titulo || null,
      createdAt: created_at,
    },
  }
}

// GET /api/contacto-leads/stats
router.get('/contacto-leads/stats', verifyToken, requireEditor, async (req, res) => {
  try {
    const byArea = await query(
      `SELECT COALESCE(area, 'Sin especificar') AS label, COUNT(*)::int AS total
       FROM leads GROUP BY label ORDER BY total DESC`
    )
    const byCurso = await query(
      `SELECT COALESCE(c.titulo, 'Sin especificar') AS label, COUNT(*)::int AS total
       FROM leads l
       LEFT JOIN cursos c ON c.id = l.curso_id
       GROUP BY label ORDER BY total DESC`
    )
    res.json({ byArea, byCurso })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// GET /api/contacto-leads/export.csv
router.get('/contacto-leads/export.csv', verifyToken, requireEditor, async (req, res) => {
  try {
    const { area, curso_id } = req.query
    const conditions = []
    const params = []
    if (area) { params.push(area); conditions.push(`l.area = $${params.length}`) }
    if (curso_id) { params.push(curso_id); conditions.push(`l.curso_id = $${params.length}`) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const rows = await query(
      `SELECT l.nombre, l.email, l.telefono, l.rut, l.empresa, l.tipo, l.area,
              c.titulo AS curso_interes, l.mensaje, l.created_at
       FROM leads l
       LEFT JOIN cursos c ON c.id = l.curso_id
       ${where}
       ORDER BY l.created_at DESC`,
      params
    )

    const headers = ['Nombre','Email','Teléfono','RUT','Empresa','Tipo','Área de interés','Curso de interés','Mensaje','Fecha']
    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [
      headers.map(escape).join(','),
      ...rows.map(r => [
        r.nombre, r.email, r.telefono, r.rut, r.empresa, r.tipo, r.area,
        r.curso_interes, r.mensaje, r.created_at,
      ].map(escape).join(',')),
    ]

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"')
    res.send('﻿' + lines.join('\r\n')) // BOM for Excel
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// GET /api/contacto-leads
router.get('/contacto-leads', verifyToken, requireEditor, async (req, res) => {
  try {
    const { area, curso_id } = req.query
    const conditions = []
    const params = []
    if (area) { params.push(area); conditions.push(`l.area = $${params.length}`) }
    if (curso_id) { params.push(curso_id); conditions.push(`l.curso_id = $${params.length}`) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const rows = await query(
      `SELECT l.*, c.titulo AS curso_titulo
       FROM leads l
       LEFT JOIN cursos c ON c.id = l.curso_id
       ${where}
       ORDER BY l.created_at DESC LIMIT 500`,
      params
    )
    res.json({ data: rows.map(fmt), meta: { pagination: { total: rows.length } } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// POST /api/contacto-leads — public
router.post('/contacto-leads', async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje, rut, empresa, tipo, area, curso_id } = req.body.data || req.body
    const row = await queryOne(
      `INSERT INTO leads (nombre, email, telefono, mensaje, rut, empresa, tipo, area, curso_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [nombre, email, telefono || null, mensaje || null,
       rut || null, empresa || null, tipo || null, area || null, curso_id || null]
    )
    res.status(201).json({ data: fmt(row) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al guardar' })
  }
})

// PUT /api/contacto-leads/:id — mark read
router.put('/contacto-leads/:id', verifyToken, requireEditor, async (req, res) => {
  try {
    const { leido } = req.body.data || req.body
    const row = await queryOne(
      'UPDATE leads SET leido = $1 WHERE id = $2 RETURNING *',
      [leido, req.params.id]
    )
    res.json({ data: fmt(row) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar' })
  }
})

// DELETE /api/contacto-leads/:id
router.delete('/contacto-leads/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM leads WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar' })
  }
})

module.exports = router
