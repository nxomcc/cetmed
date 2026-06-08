import { handleOptions, json } from '../_shared/cors.ts'
import { calculateOrderTotals } from '../_shared/orders.ts'
import { serviceClient } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  try {
    const { items, codigo_descuento } = await req.json()
    if (!codigo_descuento) return json(req, { error: 'Falta codigo de descuento' }, 400)

    const totals = await calculateOrderTotals(serviceClient(), items || [], codigo_descuento)
    if (!totals.descuento) return json(req, { error: 'Codigo de descuento invalido' }, 404)

    return json(req, totals.descuento)
  } catch (error) {
    return json(req, { error: error.message || 'Error validando descuento' }, 400)
  }
})
