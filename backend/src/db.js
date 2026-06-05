'use strict'
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false },
})

async function query(sql, params = []) {
  const { rows } = await pool.query(sql, params)
  return rows
}

async function queryOne(sql, params = []) {
  const { rows } = await pool.query(sql, params)
  return rows[0] || null
}

module.exports = { pool, query, queryOne }
