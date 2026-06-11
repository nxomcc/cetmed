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

export function getCourseObjective(attributes = {}) {
  return cleanObjective(attributes.objetivo)
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
  const value = prepareDisplayText(text)
  if (!value) return []
  return value
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .flatMap(parseTextBlock)
}

const TEXT_HEADING_SOURCE = '(Objetivo\\s+General|Objetivos?\\s+Espec[ií]ficos?|P[uú]blico\\s+Objetivo|Contenidos?\\s+del\\s+curso)'
const INLINE_HEADING_RE = new RegExp(`^${TEXT_HEADING_SOURCE}\\s*[:.-]?\\s+(.+)$`, 'i')
const HEADING_RE = new RegExp(`(^|\\s+)${TEXT_HEADING_SOURCE}\\s*[:.-]?\\s*`, 'gi')

function prepareDisplayText(value) {
  return normalizeText(value)
    .replace(/[ \t]+/g, ' ')
    .replace(HEADING_RE, (_match, prefix, heading) => {
      const separator = prefix && prefix.trim() ? prefix : ''
      return `${separator}\n\n${heading}\n`
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeHeading(value = '') {
  const key = normalizeText(value)
    .replace(/[:.-]+$/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (key === 'objetivo general') return 'Objetivo general'
  if (key === 'objetivos especificos' || key === 'objetivo especifico') return 'Objetivos específicos'
  if (key === 'publico objetivo') return 'Público objetivo'
  if (key === 'contenidos del curso' || key === 'contenido del curso') return 'Contenidos del curso'
  return ''
}

function splitLongParagraph(text) {
  const clean = normalizeText(text)
  if (clean.length < 280) return [clean]

  const sentences = clean
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿])/)
    .map(item => item.trim())
    .filter(Boolean)

  if (sentences.length <= 1) return [clean]

  const paragraphs = []
  let current = ''
  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence
    if (current && next.length > 330) {
      paragraphs.push(current)
      current = sentence
    } else {
      current = next
    }
  }
  if (current) paragraphs.push(current)
  return paragraphs
}

function splitObjectiveItems(text) {
  return normalizeText(text)
    .replace(/\s+(?=(?:Conocer|Aplicar|Administrar|Identificar|Reconocer|Desarrollar|Utilizar|Comprender|Seleccionar|Diseñar|Fortalecer|Manejar|Implementar|Evaluar|Distinguir)\b)/g, '\n')
    .split('\n')
    .map(normalizeItem)
    .filter(item => item.length > 8)
}

function parseTextBlock(block) {
  const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
  if (!lines.length) return []

  const inlineHeading = lines[0].match(INLINE_HEADING_RE)
  if (inlineHeading) {
    const rest = [inlineHeading[2], ...lines.slice(1)].join('\n').trim()
    return parseTextBlock(`${inlineHeading[1]}\n${rest}`)
  }

  const heading = normalizeHeading(lines[0])
  if (heading) {
    const rest = lines.slice(1).join('\n').replace(/^[:.-]\s*/, '').trim()
    const parsedRest = heading === 'Objetivos específicos' && rest
      ? [{ type: 'list', items: splitObjectiveItems(rest) }]
      : parseTextBlock(rest)

    return [
      { type: 'heading', text: heading },
      ...parsedRest.filter(item => item.type !== 'list' || item.items.length),
    ]
  }

  const listLines = lines.filter(line => /^(?:[•*-]|\d{1,2}[.)-])\s+/.test(line))
  if (listLines.length >= Math.max(2, Math.ceil(lines.length * 0.6))) {
    return [{ type: 'list', items: lines.map(normalizeItem).filter(Boolean) }]
  }

  return splitLongParagraph(lines.join(' ')).map(item => ({ type: 'paragraph', text: item }))
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
