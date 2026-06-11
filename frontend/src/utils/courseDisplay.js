export const COURSE_PLACEHOLDER = 'https://placehold.co/800x450/003d7a/ffffff?text=CETMED'

export const MODALIDAD_ICON = {
  Presencial: 'place',
  'E-Learning': 'computer',
  Blended: 'sync_alt',
  'B-Learning': 'sync_alt',
  'Online sincrónico': 'live_tv',
  Sincrónico: 'live_tv',
  'In Company': 'business',
}

export function fmtPrice(value) {
  const price = Number(value || 0)
  if (!price) return 'A consultar'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price)
}

export function getCourseImageUrl(media, title = 'CETMED') {
  const url = media?.data?.attributes?.url || media?.attributes?.url || media?.url
  if (!url) return `https://placehold.co/800x450/003d7a/ffffff?text=${encodeURIComponent(title || 'CETMED')}`
  if (url.startsWith('http') || url.startsWith('/')) return url
  const base = import.meta.env.VITE_CMS_URL || 'http://localhost:1337'
  return `${base}${url}`
}

export function getCourseMeta(attributes = {}) {
  return [
    {
      icon: 'schedule',
      label: 'Duración',
      value: attributes.horas ? `${attributes.horas} horas` : 'A coordinar',
    },
    {
      icon: MODALIDAD_ICON[attributes.modalidad] || 'school',
      label: 'Modalidad',
      value: attributes.modalidad || 'A coordinar',
    },
    {
      icon: 'verified',
      label: 'Certificado',
      value: 'Sí, incluido',
    },
    {
      icon: 'groups',
      label: 'Nivel',
      value: attributes.nivel || 'Básico-Intermedio',
    },
  ]
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}

function normalizeItem(value) {
  return normalizeText(value)
    .replace(/^[•*-]\s*/, '')
    .replace(/^\d{1,2}\s*[.)-]\s*/, '')
    .trim()
}

export function getTextBlocks(text) {
  const value = normalizeText(text)
  if (!value) return []
  return value
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
      const listLines = lines.filter(line => /^(?:[•*-]|\d{1,2}[.)-])\s+/.test(line))
      if (listLines.length >= Math.max(2, Math.ceil(lines.length * 0.6))) {
        return { type: 'list', items: lines.map(normalizeItem).filter(Boolean) }
      }
      return { type: 'paragraph', text: lines.join(' ') }
    })
}

function normalizeContentEntry(entry) {
  if (!entry) return null

  if (typeof entry === 'string') {
    const text = normalizeItem(entry)
    if (!text) return null
    const lines = text.split('\n').map(normalizeItem).filter(Boolean)
    return { title: null, items: lines.length > 1 ? lines : [text] }
  }

  if (typeof entry === 'object') {
    const title = normalizeText(entry.modulo || entry.módulo || entry.titulo || entry.title || entry.nombre)
    const rawItems = entry.temas || entry.contenidos || entry.items || entry.puntos || entry.detalle
    const items = Array.isArray(rawItems)
      ? rawItems.map(normalizeItem).filter(Boolean)
      : normalizeText(rawItems).split('\n').map(normalizeItem).filter(Boolean)

    if (!title && !items.length) return null
    return { title: title || null, items }
  }

  return null
}

export function getContentBlocks(contenidos) {
  const source = Array.isArray(contenidos)
    ? contenidos
    : contenidos && typeof contenidos === 'object'
      ? [contenidos]
      : normalizeText(contenidos).split('\n').filter(Boolean)

  return source
    .map(normalizeContentEntry)
    .filter(Boolean)
    .filter(block => block.title || block.items.length)
}
