'use strict'
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { migrate } = require('./migrate')

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Mount all routes under /api
const prefix = '/api'
app.use(prefix, require('./routes/auth'))
app.use(prefix, require('./routes/upload'))
app.use(prefix, require('./routes/cursos'))
app.use(prefix, require('./routes/noticias'))
app.use(prefix, require('./routes/categorias'))
app.use(prefix, require('./routes/descuentos'))
app.use(prefix, require('./routes/pedidos'))
app.use(prefix, require('./routes/pagos'))
app.use(prefix, require('./routes/leads'))
app.use(prefix, require('./routes/users'))
app.use(prefix, require('./routes/stats'))

app.get('/health', (req, res) => res.json({ ok: true }))

app.use((req, res) => res.status(404).json({ error: `Ruta no encontrada: ${req.path}` }))
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

const PORT = process.env.PORT || 3001

async function start() {
  try {
    await migrate()
    app.listen(PORT, () => console.log(`[CMS] Backend corriendo en http://localhost:${PORT}`))
  } catch (err) {
    console.error('[CMS] Error al iniciar:', err.message)
    process.exit(1)
  }
}

start()
