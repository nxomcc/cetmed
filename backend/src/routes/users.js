'use strict'
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const { query, queryOne } = require('../db')
const { verifyToken, requireAdmin } = require('../middleware/auth')

const router = Router()

const VALID_ROLES = ['admin-api', 'editor', 'authenticated']

function fmtUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    blocked: row.blocked,
    createdAt: row.created_at,
    role: { type: row.role, name: row.role === 'admin-api' ? 'Administrador' : row.role === 'editor' ? 'Editor' : 'Usuario' },
  }
}

router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const rows = await query('SELECT id, username, email, role, blocked, created_at FROM users ORDER BY created_at DESC')
    res.json(rows.map(fmtUser))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

router.post('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body
    if (!username || !email || !password) return res.status(400).json({ error: 'Faltan campos requeridos' })
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })

    const hash = await bcrypt.hash(password, 10)
    const userRole = VALID_ROLES.includes(role) ? role : 'editor'

    const row = await queryOne(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, username, email, role, blocked, created_at',
      [username.trim(), email.trim().toLowerCase(), hash, userRole]
    )
    res.status(201).json(fmtUser(row))
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'El usuario o email ya existe' })
    console.error(err)
    res.status(500).json({ error: 'Error al crear usuario' })
  }
})

router.put('/users/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, role, blocked } = req.body
    const fields = []
    const params = []

    if (username) { params.push(username.trim()); fields.push(`username = $${params.length}`) }
    if (email) { params.push(email.trim().toLowerCase()); fields.push(`email = $${params.length}`) }
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
      params.push(await bcrypt.hash(password, 10))
      fields.push(`password_hash = $${params.length}`)
    }
    if (role && VALID_ROLES.includes(role)) { params.push(role); fields.push(`role = $${params.length}`) }
    if (blocked !== undefined) { params.push(blocked); fields.push(`blocked = $${params.length}`) }

    if (!fields.length) return res.status(400).json({ error: 'Sin campos para actualizar' })

    params.push(req.params.id)
    const row = await queryOne(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING id, username, email, role, blocked, created_at`,
      params
    )
    res.json(fmtUser(row))
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'El usuario o email ya existe' })
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar' })
  }
})

router.delete('/users/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.userId) {
      return res.status(400).json({ error: 'No podés eliminar tu propia cuenta' })
    }
    await query('DELETE FROM users WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al eliminar' })
  }
})

// Roles list (for the user management UI)
router.get('/roles', verifyToken, requireAdmin, async (req, res) => {
  res.json({
    roles: [
      { id: 'admin-api', type: 'admin-api', name: 'Administrador' },
      { id: 'editor',    type: 'editor',    name: 'Editor' },
      { id: 'authenticated', type: 'authenticated', name: 'Usuario' },
    ]
  })
})

module.exports = router
