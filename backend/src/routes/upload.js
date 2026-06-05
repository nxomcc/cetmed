'use strict'
const { Router } = require('express')
const multer = require('multer')
const { uploadFile } = require('../lib/supabase')
const { queryOne } = require('../db')
const { verifyToken } = require('../middleware/auth')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
const router = Router()

router.post('/upload', verifyToken, upload.single('files'), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'No se recibió ningún archivo' })

    const { url } = await uploadFile(file.buffer, file.originalname, file.mimetype)

    const media = await queryOne(
      'INSERT INTO media (url, name, mime_type, size) VALUES ($1, $2, $3, $4) RETURNING *',
      [url, file.originalname, file.mimetype, file.size]
    )

    res.json([{ id: media.id, url: media.url, name: media.name }])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Error al subir el archivo' })
  }
})

module.exports = router
