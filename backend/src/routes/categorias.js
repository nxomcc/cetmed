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

let cache = null

function clearCache() {
  cache = null
}

router.get('/categorias', async (req, res) => {
  try {
    if (cache !== null) {
      return res.json(cache)
    }
    const rows = await query('SELECT * FROM categorias ORDER BY nombre ASC')
    const responseData = { data: rows.map(fmt), meta: { pagination: { total: rows.length } } }
    cache = responseData
    res.json(responseData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

router.post('/categorias', verifyToken, requireEditor, async (req, res) => {
  try {
    const { nombre, slug, icono } = req.body.data || req.body
    const row = await queryOne(
      'INSERT INTO categorias (nombre, slug, icono) VALUES ($1,$2,$3) RETURNING *',
      [nombre, slug, icono || null]
    )
    clearCache()
    res.status(201).json({ data: fmt(row) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al crear' })
  }
})

router.put('/categorias/:id', verifyToken, requireEditor, async (req, res) => {
  try {
    const { nombre, slug, icono } = req.body.data || req.body
    const row = await queryOne(
      'UPDATE categorias SET nombre=$1, slug=$2, icono=$3, updated_at=NOW() WHERE id=$4 RETURNING *',
      [nombre, slug, icono || null, req.params.id]
    )
    clearCache()
    res.json({ data: fmt(row) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al actualizar' })
  }
})

router.delete('/categorias/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM categorias WHERE id = $1', [req.params.id])
    clearCache()
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar' })
  }
})

module.exports = router
