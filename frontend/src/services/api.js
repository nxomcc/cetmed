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

/* ── Payment Intent (Stripe) ────────────────────────── */
export async function createPaymentIntent(items) {
  const res = await fetch(`${BASE}/pagos/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })
  if (!res.ok) throw new Error('Payment intent failed')
  return res.json()
}

/* ── Helpers ────────────────────────────────────────── */
export function imgUrl(media) {
  if (!media?.data) return null
  const url = media.data.attributes?.url
  if (!url) return null
  return url.startsWith('http') ? url : `http://localhost:1337${url}`
}
