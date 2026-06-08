import { handleOptions, json } from '../_shared/cors.ts'
import { enrollOrderCourses } from '../_shared/enrollment.ts'
import { sendEnrollmentEmails } from '../_shared/mail.ts'
import { calculateOrderTotals } from '../_shared/orders.ts'
import { serviceClient } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  try {
    if (Deno.env.get('ENABLE_PAYMENT_SIMULATION') !== 'true') {
      return json(req, { error: 'La simulacion de compras no esta habilitada' }, 403)
    }
    const simulationToken = Deno.env.get('SIMULATION_WEBHOOK_TOKEN')
    if (!simulationToken || req.headers.get('x-simulation-token') !== simulationToken) {
      return json(req, { error: 'Simulacion no autorizada' }, 403)
    }

    const sb = serviceClient()
    const { items, nombre_cliente, email_cliente, telefono_cliente, codigo_descuento, notas } = await req.json()

    if (!nombre_cliente || !email_cliente) return json(req, { error: 'Nombre y email son obligatorios' }, 400)

    const { items: normalizedItems, subtotal, descuentoMonto, total, codigoDescuento } = await calculateOrderTotals(sb, items, codigo_descuento)

    const { data: order, error: orderError } = await sb
      .from('pedidos')
      .insert({
        nombre_cliente,
        email_cliente: email_cliente.toLowerCase(),
        telefono_cliente: telefono_cliente || null,
        items: normalizedItems,
        subtotal,
        descuento_monto: descuentoMonto,
        total,
        codigo_descuento: codigoDescuento,
        estado: 'completado',
        payment_id: `SIM-${Date.now()}`,
        notas: notas || 'Compra simulada para pruebas de Moodle',
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
    return json(req, { orderId: order.id, status: order.estado, enrollment, mail }, 201)
  } catch (error) {
    return json(req, { error: error.message || 'Error al simular compra' }, 500)
  }
})
