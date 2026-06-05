'use strict'
const { readFileSync } = require('fs')
const path = require('path')
const { pool } = require('./db')

async function migrate() {
  const sql = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(sql)
  console.log('[DB] Schema applied')
}

module.exports = { migrate }
