'use strict'
/**
 * Creates the first admin user.
 * Usage: node src/seed.js <username> <email> <password>
 * Example: node src/seed.js admin admin@cetmed.cl miClave123
 */
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { migrate } = require('./migrate')
const { queryOne, pool } = require('./db')

async function seed() {
  const [, , username, email, password] = process.argv
  if (!username || !email || !password) {
    console.error('Uso: node src/seed.js <username> <email> <password>')
    process.exit(1)
  }

  await migrate()

  const exists = await queryOne('SELECT id FROM users WHERE role = $1', ['admin-api'])
  if (exists) {
    console.log('Ya existe un administrador. Para crear otro, usá el panel de usuarios.')
    await pool.end()
    return
  }

  const hash = await bcrypt.hash(password, 10)
  const user = await queryOne(
    'INSERT INTO users (username, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, username, email',
    [username, email.toLowerCase(), hash, 'admin-api']
  )

  console.log(`✓ Administrador creado: ${user.username} (${user.email})`)
  await pool.end()
}

seed().catch(err => { console.error(err.message); process.exit(1) })
