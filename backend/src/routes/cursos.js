'use strict'
const { Router } = require('express')
const { query, queryOne } = require('../db')
const { verifyToken, requireEditor, requireAdmin, optionalToken } = require('../middleware/auth')

const router = Router()

const SELECT = `
  SELECT c.*,
    cat.id as cat_id, cat.nombre as cat_nombre, cat.slug as cat_slug, cat.icono as cat_icono,
    m.id as img_id, m.url as img_url, m.name as img_name
  FROM cursos c
  LEFT JOIN categorias cat ON c.categoria_id = cat.id
  LEFT JOIN media m ON c.imagen_id = m.id
`

function fmt(row) {
  if (!row) return null
  const { id, created_at, updated_at, published_at,
    cat_id, cat_nombre, cat_slug, cat_icono,
    img_id, img_url, img_name,
    imagen_id, categoria_id, ...rest } = row
  return {
    id,
    attributes: {
      ...rest,
      createdAt: created_at,
      updatedAt: updated_at,
      publishedAt: published_at || null,
      categoria: cat_id ? { data: { id: cat_id, attributes: { nombre: cat_nombre, slug: cat_slug, icono: cat_icono } } } : { data: null },
      imagen: img_url ? { data: { id: img_id, attributes: { url: img_url, name: img_name } } } : { data: null },
    },
  }
}

let cache = null

function clearCache() {
  cache = null
}

// GET /api/cursos
router.get('/cursos', optionalToken, async (req, res) => {
  try {
    const isAdmin = req.user != null
    const slugFilter = req.query['filters[slug][$eq]'] || req.query?.filters?.slug?.['$eq']
    const canUseCache = !isAdmin && !slugFilter

    if (canUseCache && cache !== null) {
      return res.json(cache)
    }

    const conditions = []
    const params = []

    if (!isAdmin) {
      conditions.push(`c.published_at IS NOT NULL AND c.activo = true`)
    }
    if (slugFilter) {
      params.push(slugFilter)
      conditions.push(`c.slug = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const rows = await query(`${SELECT} ${where} ORDER BY c.created_at DESC LIMIT 500`, params)
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

// POST /api/cursos/:id/view  (public — must be before /:id)
router.post('/cursos/:id/view', async (req, res) => {
  try {
    await queryOne('UPDATE cursos SET vistas = vistas + 1 WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch { res.json({ ok: false }) }
})

// GET /api/cursos/:id
router.get('/cursos/:id', optionalToken, async (req, res) => {
  try {
    const row = await queryOne(`${SELECT} WHERE c.id = $1`, [req.params.id])
    if (!row) return res.status(404).json({ error: 'No encontrado' })
    res.json({ data: fmt(row) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// POST /api/cursos
router.post('/cursos', verifyToken, requireEditor, async (req, res) => {
  try {
    const { titulo, slug, descripcion, objetivo, contenidos, precio, horas, modalidad, nivel,
      franquicia_sence, activo, categoria, imagen, publishedAt } = req.body.data || req.body

    const row = await queryOne(
      `INSERT INTO cursos (titulo, slug, descripcion, objetivo, contenidos, precio, horas, modalidad, nivel,
        franquicia_sence, activo, published_at, imagen_id, categoria_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [titulo, slug, descripcion || null, objetivo || null,
       contenidos ? JSON.stringify(contenidos) : null,
       precio || 0, horas || null, modalidad || 'Presencial', nivel || 'Básico-Intermedio',
       franquicia_sence || false, activo !== false,
       publishedAt || null, imagen || null, categoria || null]
    )
    const created = await queryOne(`${SELECT} WHERE c.id = $1`, [row.id])
    clearCache()
    res.status(201).json({ data: fmt(created) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al crear' })
  }
})

// PUT /api/cursos/:id
router.put('/cursos/:id', verifyToken, requireEditor, async (req, res) => {
  try {
    const body = req.body.data || req.body
    const fields = []
    const params = []

    const allowed = ['titulo', 'slug', 'descripcion', 'objetivo', 'precio', 'horas', 'modalidad',
      'nivel', 'franquicia_sence', 'activo', 'publishedAt']
    for (const key of allowed) {
      if (key in body) {
        const col = key === 'publishedAt' ? 'published_at' : key
        params.push(body[key])
        fields.push(`${col} = $${params.length}`)
      }
    }
    if ('contenidos' in body) {
      params.push(body.contenidos ? JSON.stringify(body.contenidos) : null)
      fields.push(`contenidos = $${params.length}`)
    }
    if ('imagen' in body) {
      params.push(body.imagen || null)
      fields.push(`imagen_id = $${params.length}`)
    }
    if ('categoria' in body) {
      params.push(body.categoria || null)
      fields.push(`categoria_id = $${params.length}`)
    }

    if (!fields.length) return res.status(400).json({ error: 'Sin campos para actualizar' })

    params.push(req.params.id)
    fields.push(`updated_at = NOW()`)
    await query(`UPDATE cursos SET ${fields.join(', ')} WHERE id = $${params.length}`, params)

    const updated = await queryOne(`${SELECT} WHERE c.id = $1`, [req.params.id])
    clearCache()
    res.json({ data: fmt(updated) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al actualizar' })
  }
})

// DELETE /api/cursos/:id
router.delete('/cursos/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM cursos WHERE id = $1', [req.params.id])
    clearCache()
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar' })
  }
})

module.exports = router
