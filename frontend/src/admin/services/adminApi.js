const BASE = '/api'

function getJwt() {
  return sessionStorage.getItem('admin_jwt')
}

async function req(path, opts = {}) {
  const jwt = getJwt()
  const isFormData = opts.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    ...opts.headers,
  }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (res.status === 204) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Error ${res.status}`)
  }
  return res.json()
}

/* ── Auth ──────────────────────────────────────────────── */
export function login(identifier, password) {
  return req('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) })
}
export function getMe() {
  return req('/users/me')
}

/* ── Upload ────────────────────────────────────────────── */
export async function uploadFile(file) {
  const jwt = getJwt()
  const fd = new FormData()
  fd.append('files', file)
  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    body: fd,
  })
  if (!res.ok) throw new Error('Error al subir imagen')
  const data = await res.json()
  return data[0]
}

/* ── Cursos ────────────────────────────────────────────── */
export function getCursos(extra = {}) {
  const qs = new URLSearchParams({ populate: 'imagen,categoria', publicationState: 'preview', 'pagination[pageSize]': 200, ...extra })
  return req(`/cursos?${qs}`)
}
export function getCurso(id) {
  return req(`/cursos/${id}?populate=imagen,categoria`)
}
export function createCurso(data) {
  return req('/cursos', { method: 'POST', body: JSON.stringify({ data }) })
}
export function updateCurso(id, data) {
  return req(`/cursos/${id}`, { method: 'PUT', body: JSON.stringify({ data }) })
}
export function deleteCurso(id) {
  return req(`/cursos/${id}`, { method: 'DELETE' })
}

/* ── Noticias ──────────────────────────────────────────── */
export function getNoticias(extra = {}) {
  const qs = new URLSearchParams({ populate: 'imagen', publicationState: 'preview', 'pagination[pageSize]': 200, 'sort': 'createdAt:desc', ...extra })
  return req(`/noticias?${qs}`)
}
export function getNoticia(id) {
  return req(`/noticias/${id}?populate=imagen`)
}
export function createNoticia(data) {
  return req('/noticias', { method: 'POST', body: JSON.stringify({ data }) })
}
export function updateNoticia(id, data) {
  return req(`/noticias/${id}`, { method: 'PUT', body: JSON.stringify({ data }) })
}
export function deleteNoticia(id) {
  return req(`/noticias/${id}`, { method: 'DELETE' })
}

/* ── Categorias ────────────────────────────────────────── */
export function getCategorias() {
  return req('/categorias?pagination[pageSize]=100&sort=nombre:asc')
}
export function createCategoria(data) {
  return req('/categorias', { method: 'POST', body: JSON.stringify({ data }) })
}
export function updateCategoria(id, data) {
  return req(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify({ data }) })
}
export function deleteCategoria(id) {
  return req(`/categorias/${id}`, { method: 'DELETE' })
}

/* ── Descuentos ────────────────────────────────────────── */
export function getDescuentos() {
  return req('/descuentos?pagination[pageSize]=200&sort=createdAt:desc')
}
export function createDescuento(data) {
  return req('/descuentos', { method: 'POST', body: JSON.stringify({ data }) })
}
export function updateDescuento(id, data) {
  return req(`/descuentos/${id}`, { method: 'PUT', body: JSON.stringify({ data }) })
}
export function deleteDescuento(id) {
  return req(`/descuentos/${id}`, { method: 'DELETE' })
}

/* ── Pedidos ───────────────────────────────────────────── */
export function getPedidos(extra = {}) {
  const qs = new URLSearchParams({ 'pagination[pageSize]': 100, sort: 'createdAt:desc', ...extra })
  return req(`/pedidos?${qs}`)
}
export function updatePedido(id, data) {
  return req(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify({ data }) })
}

/* ── Leads ─────────────────────────────────────────────── */
export function getLeads(extra = {}) {
  const qs = new URLSearchParams({ 'pagination[pageSize]': 200, sort: 'createdAt:desc', ...extra })
  return req(`/contacto-leads?${qs}`)
}
export function markLeadRead(id) {
  return req(`/contacto-leads/${id}`, { method: 'PUT', body: JSON.stringify({ data: { leido: true } }) })
}
export function deleteLead(id) {
  return req(`/contacto-leads/${id}`, { method: 'DELETE' })
}
export function getLeadsStats() {
  return req('/contacto-leads/stats')
}
export async function downloadLeadsCSV(filters = {}) {
  const jwt = getJwt()
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)))
  const res = await fetch(`/api/contacto-leads/export.csv?${qs}`, {
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
  })
  if (!res.ok) throw new Error('Error al exportar')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'leads.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/* ── Users ─────────────────────────────────────────────── */
export function getUsers() {
  return req('/users')
}
export function getUser(id) {
  return req(`/users/${id}`)
}
export function createUser(data) {
  return req('/users', { method: 'POST', body: JSON.stringify(data) })
}
export function updateUser(id, data) {
  return req(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}
export function deleteUser(id) {
  return req(`/users/${id}`, { method: 'DELETE' })
}
export function getRoles() {
  return req('/roles')
}

/* ── Stats ─────────────────────────────────────────────── */
export function getStats() {
  return req('/admin/stats')
}
