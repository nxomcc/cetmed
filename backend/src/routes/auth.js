'use strict'
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { queryOne } = require('../db')
const { verifyToken } = require('../middleware/auth')

const router = Router()

router.post('/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body
    if (!identifier || !password) return res.status(400).json({ error: 'Faltan credenciales' })

    const user = await queryOne(
      'SELECT * FROM users WHERE (email = $1 OR username = $1) AND blocked = false',
      [identifier]
    )
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ jwt: token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

router.get('/users/me', verifyToken, async (req, res) => {
  try {
    const user = await queryOne(
      'SELECT id, username, email, role, blocked, created_at FROM users WHERE id = $1',
      [req.user.userId]
    )
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      blocked: user.blocked,
      createdAt: user.created_at,
      role: { type: user.role, name: user.role === 'admin-api' ? 'Administrador' : 'Editor' },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

module.exports = router
