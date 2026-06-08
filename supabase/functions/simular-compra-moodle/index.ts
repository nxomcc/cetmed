import { handleOptions, json } from '../_shared/cors.ts'
import { enrollOrderCourses } from '../_shared/enrollment.ts'
import { serviceClient } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  try {
    if (Deno.env.get('ENABLE_PAYMENT_SIMULATION') !== 'true') {
      return json(req, { error: 'La simulacion de compras no esta habilitada' }, 403)
    }

    const sb = serviceClient()
    const { items, nombre_cliente, email_cliente, telefono_cliente, codigo_descuento, descuento_monto, notas } = await req.json()

    if (!Array.isArray(items) || items.length === 0) return json(req, { error: 'No se recibieron cursos' }, 400)
    if (!nombre_cliente || !email_cliente) return json(req, { error: 'Nombre y email son obligatorios' }, 400)

    let subtotal = 0
    for (const item of items) {
      const { data: curso, error } = await sb.from('cursos').select('precio').eq('id', item.id).maybeSingle()
      if (error) throw error
      if (!curso) return json(req, { error: `Curso ${item.id} no encontrado` }, 404)
      subtotal += Number(curso.precio || 0)
    }

    const descVal = Number(descuento_monto || 0)
    const total = Math.max(0, subtotal - descVal)

    const { data: order, error: orderError } = await sb
      .from('pedidos')
      .insert({
        nombre_cliente,
        email_cliente: email_cliente.toLowerCase(),
        telefono_cliente: telefono_cliente || null,
        items: items.map((item: any) => ({ id: item.id })),
        subtotal,
        descuento_monto: descVal,
        total,
        codigo_descuento: codigo_descuento || null,
        estado: 'completado',
        payment_id: `SIM-${Date.now()}`,
        notas: notas || 'Compra simulada para pruebas de Moodle',
      })
      .select('*')
      .single()

    if (orderError) throw orderError
    const enrollment = await enrollOrderCourses(sb, order)
    return json(req, { orderId: order.id, status: order.estado, enrollment }, 201)
  } catch (error) {
    return json(req, { error: error.message || 'Error al simular compra' }, 500)
  }
})
