export function normalizeItems(items: any[]) {
  return (items || [])
    .map((item) => ({ id: Number(item?.id || item?.curso_id || item?.courseId || item) }))
    .filter((item) => Number.isFinite(item.id) && item.id > 0)
}

export async function calculateOrderTotals(sb: any, items: any[], codigoDescuento?: string | null) {
  const normalizedItems = normalizeItems(items)
  if (!normalizedItems.length) throw new Error('No se recibieron cursos')

  let subtotal = 0
  const pricesByCourseId = new Map<number, number>()
  for (const item of normalizedItems) {
    const { data: curso, error } = await sb
      .from('cursos')
      .select('precio,activo,published_at')
      .eq('id', item.id)
      .maybeSingle()

    if (error) throw error
    if (!curso || !curso.activo || !curso.published_at) throw new Error(`Curso ${item.id} no disponible`)
    const price = Number(curso.precio || 0)
    pricesByCourseId.set(item.id, price)
    subtotal += price
  }

  const code = String(codigoDescuento || '').trim().toUpperCase()
  let descuentoMonto = 0
  let descuento = null

  if (code) {
    const { data, error } = await sb
      .from('descuentos')
      .select('codigo,tipo,valor,fecha_expiracion,limite_usos,usos_actuales,activo,curso_id')
      .eq('codigo', code)
      .eq('activo', true)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Codigo de descuento invalido')
    if (data.fecha_expiracion && new Date(data.fecha_expiracion) < new Date()) throw new Error('Codigo de descuento expirado')
    if (data.limite_usos && Number(data.usos_actuales || 0) >= Number(data.limite_usos)) throw new Error('Codigo de descuento sin usos disponibles')

    const applicableSubtotal = data.curso_id
      ? Number(pricesByCourseId.get(Number(data.curso_id)) || 0)
      : subtotal
    if (applicableSubtotal <= 0) throw new Error('Codigo de descuento no aplica a los cursos seleccionados')

    const valor = Number(data.valor || 0)
    descuentoMonto = data.tipo === 'porcentaje' ? Math.round(applicableSubtotal * valor / 100) : valor
    descuentoMonto = Math.max(0, Math.min(descuentoMonto, applicableSubtotal))
    descuento = { codigo: data.codigo, tipo: data.tipo, valor, monto: descuentoMonto, curso_id: data.curso_id || null }
  }

  return {
    items: normalizedItems,
    subtotal,
    descuentoMonto,
    total: Math.max(0, subtotal - descuentoMonto),
    codigoDescuento: descuento?.codigo || null,
    descuento,
  }
}
