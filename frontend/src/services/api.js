const BASE = '/api'

async function fetchAPI(path, params = {}) {
  const qs = new URLSearchParams(params).toString()
  const url = `${BASE}${path}${qs ? '?' + qs : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`)
  return res.json()
}

/* ── Cursos ─────────────────────────────────────────── */
export async function getCursos(filters = {}) {
  const params = {
    'populate': 'imagen,categoria',
    'pagination[pageSize]': 100,
    ...filters,
  }
  return fetchAPI('/cursos', params)
}

export async function getCurso(slug) {
  const data = await fetchAPI('/cursos', {
    'filters[slug][$eq]': slug,
    'populate': 'imagen,categoria,instructor',
  })
  return data?.data?.[0] ?? null
}

/* ── Categorias ─────────────────────────────────────── */
export async function getCategorias() {
  return fetchAPI('/categorias', { 'pagination[pageSize]': 50 })
}

/* ── Noticias ───────────────────────────────────────── */
export async function getNoticias(filters = {}) {
  const params = {
    'populate': 'imagen,autor',
    'sort': 'publishedAt:desc',
    'pagination[pageSize]': 50,
    ...filters,
  }
  return fetchAPI('/noticias', params)
}

export async function getNoticia(slug) {
  const data = await fetchAPI('/noticias', {
    'filters[slug][$eq]': slug,
    'populate': 'imagen,autor',
  })
  return data?.data?.[0] ?? null
}

/* ── Pagos (Getnet Chile) ───────────────────────────── */
export async function crearPagoGetnet(datosPago) {
  const res = await fetch(`${BASE}/pagos/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosPago),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || 'Error al iniciar el pago con Getnet')
  }
  return res.json()
}

export async function consultarPagoGetnet(orderId) {
  const res = await fetch(`${BASE}/pagos/status/${orderId}`)
  if (!res.ok) throw new Error('Error al consultar el estado del pago')
  return res.json()
}

/* ── View tracking ─────────────────────────────────── */
export async function registerCursoView(id) {
  try { await fetch(`${BASE}/cursos/${id}/view`, { method: 'POST' }) } catch {}
}

export async function registerNoticiaView(id) {
  try { await fetch(`${BASE}/noticias/${id}/view`, { method: 'POST' }) } catch {}
}

/* ── Descuento ──────────────────────────────────────── */
export async function validarDescuento(codigo, subtotal) {
  const res = await fetch(`${BASE}/descuentos/validar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo, subtotal }),
  })
  if (!res.ok) throw new Error('Error validando descuento')
  return res.json()
}

/* ── Helpers ────────────────────────────────────────── */
export function imgUrl(media) {
  if (!media?.data) return null
  return media.data.attributes?.url || null
}
