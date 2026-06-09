import { handleOptions, json } from '../_shared/cors.ts'
import { isHoneypotFilled } from '../_shared/honeypot.ts'
import { sendLeadEmail } from '../_shared/mail.ts'
import { serviceClient } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  try {
    const body = await req.json()
    if (isHoneypotFilled(body)) return json(req, { ok: true }, 201)

    const nombre = String(body.nombre || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const mensaje = String(body.mensaje || '').trim()

    if (!nombre || !email || !mensaje) return json(req, { error: 'Faltan campos obligatorios' }, 400)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(req, { error: 'Email invalido' }, 400)

    const { data, error } = await serviceClient()
      .from('leads')
      .insert({
        nombre,
        email,
        telefono: body.telefono ? String(body.telefono).trim() : null,
        mensaje,
        rut: body.rut ? String(body.rut).trim() : null,
        empresa: body.empresa ? String(body.empresa).trim() : null,
        tipo: body.tipo ? String(body.tipo).trim() : null,
        area: body.area ? String(body.area).trim() : null,
        curso_id: body.curso_id ? Number(body.curso_id) : null,
      })
      .select('*')
      .single()

    if (error) throw error
    sendLeadEmail(data).catch((mailError) => {
      console.warn('[MAIL] Lead notification failed:', mailError?.message || mailError)
    })
    return json(req, data, 201)
  } catch (error) {
    return json(req, { error: error.message || 'Error creando lead' }, 500)
  }
})
