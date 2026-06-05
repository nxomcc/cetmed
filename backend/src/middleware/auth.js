'use strict'
const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autenticado' })
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin-api') return res.status(403).json({ error: 'Se requiere rol administrador' })
  next()
}

function requireEditor(req, res, next) {
  if (!['editor', 'admin-api'].includes(req.user?.role)) return res.status(403).json({ error: 'Sin permisos' })
  next()
}

function optionalToken(req, res, next) {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    try { req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET) } catch {}
  }
  next()
}

module.exports = { verifyToken, requireAdmin, requireEditor, optionalToken }
