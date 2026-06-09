import { requireEditor } from '../_shared/auth.ts'
import { handleOptions, json } from '../_shared/cors.ts'
import { enrollOrderCourses } from '../_shared/enrollment.ts'
import { sendEnrollmentEmails } from '../_shared/mail.ts'
import { normalizeItems } from '../_shared/orders.ts'
import { serviceClient } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  try {
    await requireEditor(req)

    const body = await req.json()
    const nombre = String(body.nombre_cliente || body.nombre || '').trim()
    const email = String(body.email_cliente || body.email || '').trim().toLowerCase()
    const telefono = body.telefono_cliente || body.telefono ? String(body.telefono_cliente || body.telefono).trim() : null
    const rut = body.rut_cliente || body.rut ? String(body.rut_cliente || body.rut).trim() : null
    const notas = String(body.notas || '').trim()
    const items = normalizeItems(body.items || [])

    if (!nombre || !email) return json(req, { error: 'Nombre y email son obligatorios' }, 400)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(req, { error: 'Email invalido' }, 400)
    if (!items.length) return json(req, { error: 'Selecciona al menos un curso' }, 400)

    const sb = serviceClient()
    const normalizedItems = []
    for (const item of items) {
      const { data: curso, error } = await sb
        .from('cursos')
        .select('id,titulo,slug,precio,activo,published_at,moodle_course_id')
        .eq('id', item.id)
        .maybeSingle()

      if (error) throw error
      if (!curso) return json(req, { error: `Curso ${item.id} no encontrado` }, 404)

      normalizedItems.push({
        id: curso.id,
        titulo: curso.titulo,
        slug: curso.slug,
        precio: Number(curso.precio || 0),
        moodle_course_id: curso.moodle_course_id || null,
      })
    }

    const { data: order, error: orderError } = await sb
      .from('pedidos')
      .insert({
        nombre_cliente: nombre,
        email_cliente: email,
        telefono_cliente: telefono,
        items: normalizedItems,
        subtotal: 0,
        descuento_monto: 0,
        total: 0,
        codigo_descuento: null,
        estado: 'completado',
        payment_id: `MANUAL-${Date.now()}`,
        notas: [notas || 'Matricula manual desde CMS', rut ? `RUT: ${rut}` : ''].filter(Boolean).join(' | '),
      })
      .select('*')
      .single()

    if (orderError) throw orderError

    const enrollment = await enrollOrderCourses(sb, order)
    const mail = await sendEnrollmentEmails(order, enrollment).catch((mailError) => ({ error: mailError.message }))

    if (!mail?.error) {
      await sb
        .from('pedidos')
        .update({ mail_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', order.id)
    }

    return json(req, { orderId: order.id, enrollment, mail }, 201)
  } catch (error) {
    const message = error.message || 'Error matriculando alumno'
    const status = message === 'UNAUTHORIZED' ? 401 : message === 'FORBIDDEN' ? 403 : 500
    return json(req, { error: message }, status)
  }
})
