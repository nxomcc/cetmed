import { assertAllowedOrigin, handleOptions, json } from '../_shared/cors.ts'
import { generateGetnetAuth, getnetEndpoint } from '../_shared/getnet.ts'
import { isHoneypotFilled } from '../_shared/honeypot.ts'
import { calculateOrderTotals } from '../_shared/orders.ts'
import { serviceClient } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  try {
    const sb = serviceClient()
    const body = await req.json()
    if (isHoneypotFilled(body)) return json(req, { error: 'No se pudo iniciar el pago' }, 400)

    const { items, nombre_cliente, email_cliente, telefono_cliente, rut_cliente, codigo_descuento, notas } = body

    if (!nombre_cliente || !email_cliente) return json(req, { error: 'Nombre y email son obligatorios' }, 400)

    const { items: normalizedItems, subtotal, descuentoMonto, total, codigoDescuento } = await calculateOrderTotals(sb, items, codigo_descuento)
    if (total <= 0) return json(req, { error: 'El monto total debe ser mayor a 0' }, 400)

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
        estado: 'pendiente',
        notas: notas || null,
      })
      .select('id')
      .single()

    if (orderError) throw orderError

    const origin = assertAllowedOrigin(req)
    const payload = {
      auth: await generateGetnetAuth(),
      locale: 'es_CL',
      payment: {
        reference: `PED-${order.id}`,
        description: 'Capacitaciones CETMED',
        amount: { currency: 'CLP', total },
      },
      buyer: {
        name: nombre_cliente,
        email: email_cliente.toLowerCase(),
        phone: telefono_cliente || undefined,
        document: rut_cliente || undefined,
        documentType: rut_cliente ? 'RUT' : undefined,
      },
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      returnUrl: `${origin}/checkout/retorno?order_id=${order.id}`,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Mozilla/5.0',
    }

    const response = await fetch(`${getnetEndpoint()}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json()

    if (!response.ok || data.status?.status === 'ERROR') {
      throw new Error(data.status?.message || 'Error de comunicacion con Getnet')
    }

    await sb.from('pedidos').update({ payment_id: String(data.requestId), updated_at: new Date().toISOString() }).eq('id', order.id)
    return json(req, { processUrl: data.processUrl, orderId: order.id })
  } catch (error) {
    if (error.message === 'ORIGIN_NOT_ALLOWED') return json(req, { error: 'Origen no permitido' }, 403)
    return json(req, { error: error.message || 'Error al iniciar pago' }, 500)
  }
})
