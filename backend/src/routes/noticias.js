'use strict'
const { Router } = require('express')
const { query, queryOne } = require('../db')
const { verifyToken, requireEditor, requireAdmin, optionalToken } = require('../middleware/auth')

const router = Router()

const SELECT = `
  SELECT n.*,
    m.id as img_id, m.url as img_url, m.name as img_name
  FROM noticias n
  LEFT JOIN media m ON n.imagen_id = m.id
`

function fmt(row) {
  if (!row) return null
  const { id, created_at, updated_at, published_at,
    img_id, img_url, img_name, imagen_id, ...rest } = row
  return {
    id,
    attributes: {
      ...rest,
      createdAt: created_at,
      updatedAt: updated_at,
      publishedAt: published_at || null,
      imagen: img_url ? { data: { id: img_id, attributes: { url: img_url, name: img_name } } } : { data: null },
    },
  }
}

let cache = null

function clearCache() {
  cache = null
}

// GET /api/noticias
router.get('/noticias', optionalToken, async (req, res) => {
  try {
    const isAdmin = req.user != null
    const slugFilter = req.query['filters[slug][$eq]'] || req.query?.filters?.slug?.['$eq']
    const canUseCache = !isAdmin && !slugFilter

    if (canUseCache && cache !== null) {
      return res.json(cache)
    }

    const conditions = []
    const params = []

    if (!isAdmin) conditions.push('n.published_at IS NOT NULL')
    if (slugFilter) {
      params.push(slugFilter)
      conditions.push(`n.slug = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const rows = await query(`${SELECT} ${where} ORDER BY n.published_at DESC, n.created_at DESC LIMIT 500`, params)
    const responseData = { data: rows.map(fmt), meta: { pagination: { total: rows.length } } }

    if (canUseCache) {
      cache = responseData
    }

    res.json(responseData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// POST /api/noticias/:id/view
router.post('/noticias/:id/view', async (req, res) => {
  try {
    await queryOne('UPDATE noticias SET vistas = vistas + 1 WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch { res.json({ ok: false }) }
})

// GET /api/noticias/:id
router.get('/noticias/:id', optionalToken, async (req, res) => {
  try {
    const row = await queryOne(`${SELECT} WHERE n.id = $1`, [req.params.id])
    if (!row) return res.status(404).json({ error: 'No encontrado' })
    res.json({ data: fmt(row) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// POST /api/noticias
router.post('/noticias', verifyToken, requireEditor, async (req, res) => {
  try {
    const { titulo, slug, resumen, contenido, publishedAt, imagen } = req.body.data || req.body
    const row = await queryOne(
      `INSERT INTO noticias (titulo, slug, resumen, contenido, published_at, imagen_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [titulo, slug, resumen || null, contenido || null, publishedAt || null, imagen || null]
    )
    const created = await queryOne(`${SELECT} WHERE n.id = $1`, [row.id])
    clearCache()
    res.status(201).json({ data: fmt(created) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al crear' })
  }
})

// PUT /api/noticias/:id
router.put('/noticias/:id', verifyToken, requireEditor, async (req, res) => {
  try {
    const body = req.body.data || req.body
    const fields = []
    const params = []

    for (const key of ['titulo', 'slug', 'resumen', 'contenido']) {
      if (key in body) { params.push(body[key]); fields.push(`${key} = $${params.length}`) }
    }
    if ('publishedAt' in body) { params.push(body.publishedAt || null); fields.push(`published_at = $${params.length}`) }
    if ('imagen' in body) { params.push(body.imagen || null); fields.push(`imagen_id = $${params.length}`) }

    if (!fields.length) return res.status(400).json({ error: 'Sin campos para actualizar' })

    params.push(req.params.id)
    fields.push(`updated_at = NOW()`)
    await query(`UPDATE noticias SET ${fields.join(', ')} WHERE id = $${params.length}`, params)

    const updated = await queryOne(`${SELECT} WHERE n.id = $1`, [req.params.id])
    clearCache()
    res.json({ data: fmt(updated) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al actualizar' })
  }
})

// DELETE /api/noticias/:id
router.delete('/noticias/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM noticias WHERE id = $1', [req.params.id])
    clearCache()
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar' })
  }
})

module.exports = router
