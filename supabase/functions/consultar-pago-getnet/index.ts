import { handleOptions, json } from '../_shared/cors.ts'
import { enrollOrderCourses } from '../_shared/enrollment.ts'
import { generateGetnetAuth, getnetEndpoint } from '../_shared/getnet.ts'
import { sendEnrollmentEmails } from '../_shared/mail.ts'
import { serviceClient } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  try {
    const sb = serviceClient()
    const { orderId } = await req.json()
    if (!orderId) return json(req, { error: 'Falta orderId' }, 400)

    const { data: order, error: orderError } = await sb.from('pedidos').select('*').eq('id', orderId).maybeSingle()
    if (orderError) throw orderError
    if (!order) return json(req, { error: 'Pedido no encontrado' }, 404)
    if (order.estado !== 'pendiente') return json(req, { status: order.estado })
    if (!order.payment_id) return json(req, { error: 'Pedido sin transaccion Getnet' }, 400)

    const response = await fetch(`${getnetEndpoint()}/api/session/${order.payment_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ auth: await generateGetnetAuth() }),
    })
    const data = await response.json()
    if (!response.ok || data.status?.status === 'ERROR') {
      throw new Error(data.status?.message || 'Error de comunicacion con Getnet')
    }

    const getnetStatus = data.status?.status
    let finalState = 'pendiente'
    let enrollment = null
    let mail = null

    if (getnetStatus === 'APPROVED') {
      finalState = 'completado'
      await sb.from('pedidos').update({ estado: finalState, updated_at: new Date().toISOString() }).eq('id', order.id)
      enrollment = await enrollOrderCourses(sb, order)
      mail = await sendEnrollmentEmails(order, enrollment).catch((mailError) => ({ error: mailError.message }))
    } else if (getnetStatus === 'REJECTED') {
      finalState = 'rechazado'
      await sb.from('pedidos').update({ estado: finalState, updated_at: new Date().toISOString() }).eq('id', order.id)
    }

    return json(req, { status: finalState, getnetStatus, enrollment, mail })
  } catch (error) {
    return json(req, { error: error.message || 'Error al consultar pago' }, 500)
  }
})
