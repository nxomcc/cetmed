import { LEGACY_COURSE_IMAGES } from './legacyCourseImages'

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

export function getCourseImageUrl(media, title = 'CETMED', slug = '') {
  const url = media?.data?.attributes?.url || media?.attributes?.url || media?.url
  if (!url) {
    return getLegacyCourseImageUrl(slug) || getCoursePlaceholder(title)
  }
  if (url.startsWith('http') || url.startsWith('/')) return url
  const base = import.meta.env.VITE_CMS_URL || 'http://localhost:1337'
  return `${base}${url}`
}

export function getLegacyCourseImageUrl(slug = '') {
  return LEGACY_COURSE_IMAGES[slug] || ''
}

export function getCoursePlaceholder(title = 'CETMED') {
  return `https://placehold.co/800x450/003d7a/ffffff?text=${encodeURIComponent(title || 'CETMED')}`
}

export function handleCourseImageError(event, slug = '', title = 'CETMED') {
  const image = event.currentTarget
  const legacyUrl = getLegacyCourseImageUrl(slug)
  const currentPath = (() => {
    try {
      return new URL(image.currentSrc || image.src, window.location.origin).pathname
    } catch {
      return image.getAttribute('src') || ''
    }
  })()

  if (legacyUrl && currentPath !== legacyUrl) {
    image.src = legacyUrl
    return
  }

  image.onerror = null
  image.src = getCoursePlaceholder(title)
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

export function getCourseDescription(attributes = {}, slug = '') {
  const description = normalizeText(attributes.descripcion)
  if (!isMissingCourseText(description)) return description
  return COURSE_DESCRIPTION_FALLBACKS[slug] || buildCourseDescription(attributes)
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
}

function isMissingCourseText(value = '') {
  const text = normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.+$/g, '')
  return !text || text === 'sin descripcion' || text === 'descripcion no disponible'
}

function getCategoryName(attributes = {}) {
  return attributes.categoria?.data?.attributes?.nombre || ''
}

function cleanObjective(value = '') {
  const objective = normalizeText(value)
  if (isMissingCourseText(objective)) return ''
  const normalized = objective
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  if (normalized.includes('adquirir competencias y habilidades practicas en el area del curso')) return ''
  return objective.replace(/\.$/, '')
}

function buildCourseDescription(attributes = {}) {
  const title = attributes.titulo || 'este curso'
  const category = getCategoryName(attributes)
  const modality = attributes.modalidad
  const objective = cleanObjective(attributes.objetivo)
  const area = category ? ` en el área de ${category}` : ''
  const mode = modality ? ` en modalidad ${modality}` : ''
  const objectiveText = objective ? ` Su propósito principal es ${objective.toLowerCase()}.` : ''

  return `El curso ${title} entrega una formación práctica${area}${mode}, orientada a fortalecer competencias técnicas y habilidades aplicables al contexto laboral.${objectiveText} Esta capacitación permite avanzar con una base clara, criterios de trabajo responsables y herramientas útiles para el desempeño profesional.`
}

const COURSE_DESCRIPTION_FALLBACKS = {
  'trabajo-en-equipo-y-comunicacion-efectiva-en-el-lugar-de-trabajo': 'Este curso entrega herramientas prácticas para fortalecer la colaboración, la comunicación efectiva y la coordinación dentro de equipos de trabajo. Está orientado a desarrollar habilidades para organizar tareas, resolver diferencias, entregar retroalimentación y mejorar la convivencia laboral, favoreciendo un desempeño más eficiente y participativo.',
  'inspector-educacional-y-mediacion-escolar': 'Este curso prepara a los participantes para desempeñar funciones de apoyo administrativo, convivencia escolar y mediación dentro de comunidades educativas. La formación aborda herramientas para acompañar procesos escolares, orientar a estudiantes y colaborar en la prevención y resolución de conflictos desde un enfoque práctico y formativo.',
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
