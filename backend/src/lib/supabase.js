'use strict'
const { createClient } = require('@supabase/supabase-js')

let _client = null

function getClient() {
  if (!_client) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Faltan variables SUPABASE_URL y SUPABASE_SERVICE_KEY en .env')
    }
    _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  }
  return _client
}

async function uploadFile(buffer, filename, mimeType) {
  const sb = getClient()
  const bucket = process.env.SUPABASE_BUCKET || 'cetmed'
  const ext = filename.split('.').pop()
  const storagePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await sb.storage.from(bucket).upload(storagePath, buffer, {
    contentType: mimeType,
    upsert: false,
  })
  if (error) throw new Error(`Error subiendo a Supabase: ${error.message}`)

  const { data } = sb.storage.from(bucket).getPublicUrl(storagePath)
  return { url: data.publicUrl, path: storagePath }
}

module.exports = { uploadFile }
