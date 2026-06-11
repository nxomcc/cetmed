'use strict'

/**
 * Extracts CETMED courses from the old WordPress site and optionally imports
 * them into the current CMS database.
 *
 * Dry run:
 *   node backend/src/import-old-courses.js --dry-run
 *
 * Import into DB, keeping old image URLs:
 *   node backend/src/import-old-courses.js --import
 *
 * Import into DB and copy images into Supabase Storage:
 *   node backend/src/import-old-courses.js --import --upload-images
 */
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

const OLD_SITE_URL = (process.env.OLD_WP_URL || 'http://old.cetmed.cl').replace(/\/+$/, '')
const OUTPUT_PATH = path.resolve(__dirname, '../../scratch/old-wordpress-courses.json')
const COURSE_ROOT_SLUG = 'cursos'
const MODALITY_SLUGS = new Set(['a-distancia', 'b-learning', 'e-learning', 'presencial'])
const EXCLUDED_POST_SLUGS = new Set(['hello-world'])
const DEFAULT_OBJECTIVE = 'Adquirir competencias y habilidades prácticas en el área del curso.'

const args = new Set(process.argv.slice(2))
const shouldImport = args.has('--import')
const dryRun = args.has('--dry-run') || !shouldImport
const uploadImages = args.has('--upload-images')

const ENTITY_MAP = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  aacute: 'á',
  eacute: 'é',
  iacute: 'í',
  oacute: 'ó',
  uacute: 'ú',
  Aacute: 'Á',
  Eacute: 'É',
  Iacute: 'Í',
  Oacute: 'Ó',
  Uacute: 'Ú',
  ntilde: 'ñ',
  Ntilde: 'Ñ',
  iquest: '¿',
  iexcl: '¡',
  ordm: 'º',
  ndash: '-',
  mdash: '-',
  lsquo: "'",
  rsquo: "'",
  ldquo: '"',
  rdquo: '"',
}

const AREA_META = {
  administracion: { nombre: 'Administración', slug: 'administracion', icono: 'business_center' },
  'alimentacion-gastronomia-y-turismo': { nombre: 'Alimentación, Gastronomía y Turismo', slug: 'alimentacion-gastronomia-turismo', icono: 'restaurant' },
  'artes-artesanias-y-graficas': { nombre: 'Artes, Artesanías y Gráficas', slug: 'artes-artesanias-graficas', icono: 'palette' },
  'ciencias-y-tecnicas-aplicadas': { nombre: 'Ciencias y Técnicas Aplicadas', slug: 'ciencias-tecnicas', icono: 'science' },
  'computacion-e-informatica': { nombre: 'Computación e Informática', slug: 'computacion', icono: 'computer' },
  construccion: { nombre: 'Construcción', slug: 'construccion', icono: 'construction' },
  ecologia: { nombre: 'Ecología', slug: 'ecologia', icono: 'eco' },
  'educacion-y-capacitacion': { nombre: 'Educación y Capacitación', slug: 'educacion-capacitacion', icono: 'school' },
  'electricidad-y-electronica': { nombre: 'Electricidad y Electrónica', slug: 'electricidad', icono: 'bolt' },
  idiomas: { nombre: 'Idiomas y Comunicación', slug: 'idiomas-comunicacion', icono: 'translate' },
  'mecanica-industrial': { nombre: 'Mecánica Industrial', slug: 'mecanica-industrial', icono: 'precision_manufacturing' },
  mineria: { nombre: 'Minería', slug: 'mineria', icono: 'terrain' },
  'procesos-industriales': { nombre: 'Procesos Industriales', slug: 'procesos-industriales', icono: 'factory' },
  salud: { nombre: 'Salud, Nutrición y Dietética', slug: 'salud', icono: 'medical_services' },
  'servicio-a-personas': { nombre: 'Servicio a las Personas', slug: 'servicio-personas', icono: 'people' },
}

function decodeHtml(value = '') {
  return String(value)
    .replace(/&#(x?[0-9a-f]+);/gi, (_, code) => {
      const numeric = code.toLowerCase().startsWith('x')
        ? parseInt(code.slice(1), 16)
        : parseInt(code, 10)
      return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : ''
    })
    .replace(/&([a-z][a-z0-9]+);/gi, (entity, name) => ENTITY_MAP[name] || entity)
}

function stripTags(html = '') {
  return decodeHtml(String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<(br|\/p|\/li|\/tr|\/h[1-6]|\/div)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeText(value = '') {
  return stripTags(value).replace(/\s+/g, ' ').trim()
}

function normalizeKey(value = '') {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function titleMatchKey(value = '') {
  return normalizeKey(value)
    .replace(/^(presencial|e-learning|online|a distancia)\s*[-:]\s*/, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugMatchKey(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/^(presencial|e-learning|online|a-distancia)-/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function filenameFromUrl(url = '', fallback = 'course-image.jpg') {
  const pathname = new URL(url || `http://x/${fallback}`).pathname
  return decodeURIComponent(path.basename(pathname) || fallback)
}

function contentTypeFromFilename(filename) {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'image/jpeg'
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`)
  return res.json()
}

async function fetchBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`)
  const contentType = res.headers.get('content-type') || contentTypeFromFilename(filenameFromUrl(url))
  return { buffer: Buffer.from(await res.arrayBuffer()), contentType }
}

function extractAccordionSections(html) {
  const sections = []
  const re = /<details\b[\s\S]*?<summary\b[\s\S]*?e-n-accordion-item-title-text[^>]*>([\s\S]*?)<\/div>[\s\S]*?<\/summary>([\s\S]*?)<\/details>/gi
  let match
  while ((match = re.exec(html)) !== null) {
    const title = normalizeText(match[1])
    const raw = match[2]
    const text = stripTags(raw)
    if (title && text) sections.push({ title, key: normalizeKey(title), raw, text })
  }
  return sections
}

function extractHeadingSections(html) {
  const headingRe = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi
  const headings = []
  let match
  while ((match = headingRe.exec(html)) !== null) {
    const title = normalizeText(match[2])
    if (title) headings.push({ title, key: normalizeKey(title), index: match.index, end: headingRe.lastIndex })
  }

  const sections = []
  for (let i = 0; i < headings.length; i += 1) {
    const start = headings[i].end
    const end = headings[i + 1]?.index || html.length
    const raw = html.slice(start, end)
    const text = stripTags(raw)
    if (text) sections.push({ title: headings[i].title, key: headings[i].key, raw, text })
  }
  return sections
}

function getSections(html) {
  const seen = new Set()
  return [...extractAccordionSections(html), ...extractHeadingSections(html)]
    .filter(section => {
      const identity = `${section.key}:${section.text.slice(0, 80)}`
      if (seen.has(identity)) return false
      seen.add(identity)
      return true
    })
}

function findSection(sections, include, exclude = []) {
  return sections.find(section => {
    const key = section.key
    return include.some(word => key.includes(word)) && !exclude.some(word => key.includes(word))
  })
}

function trimEmbeddedSectionLabels(text = '') {
  return String(text)
    .split(/\n\s*(?:Contenidos?\s+del\s+Curso|Temario|Modalidad|Fecha\s+de\s+Inicio|Duraci[oó]n|Cupos)\b/i)[0]
    .trim()
}

function splitContentItems(section) {
  if (!section) return []

  const liItems = []
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let liMatch
  while ((liMatch = liRe.exec(section.raw)) !== null) {
    const item = normalizeText(liMatch[1])
    if (item) liItems.push(item)
  }
  if (liItems.length) return cleanItems(liItems)

  let text = section.text
    .replace(/\r/g, '\n')
    .replace(/([^\n])\s+(\d{1,2})\s*(?:\.|-|\))\s+/g, '$1\n$2. ')
    .replace(/([^\n])\s+(M[oó]dulo\s+\d+)/gi, '$1\n$2')
    .replace(/[•●]/g, '\n')

  const items = text
    .split(/\n+/)
    .flatMap(line => line.split(/(?=\b\d{1,2}\.\s+)/g))
    .map(item => item.trim())

  return cleanItems(items)
}

function extractListItems(raw = '') {
  const items = []
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let match
  while ((match = liRe.exec(raw)) !== null) {
    const item = normalizeText(match[1])
    if (item) items.push(item)
  }
  return cleanItems(items)
}

function extractParagraphs(raw = '') {
  const paragraphs = []
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi
  let match
  while ((match = pRe.exec(raw)) !== null) {
    const paragraph = normalizeText(match[1])
    if (paragraph) paragraphs.push(paragraph)
  }
  return paragraphs
}

function cleanItems(items) {
  const seen = new Set()
  return items
    .map(item => item.replace(/^(contenidos?|temario|programa)\s*(del curso)?\s*:?\s*/i, '').trim())
    .map(item => item.replace(/^\d{1,2}\s*(?:\.|-|\))\s*/, '').trim())
    .map(item => item.replace(/^[-–]\s*/, '').trim())
    .filter(item => item.length >= 3)
    .filter(item => {
      const key = normalizeKey(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 80)
}

function extractPrice(text) {
  const prices = [...decodeHtml(text).matchAll(/\$\s*([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{5,7})/g)]
    .map(match => Number(match[1].replace(/\D/g, '')))
    .filter(price => price >= 5000 && price <= 5000000)
  if (!prices.length) return 0
  return prices[0]
}

function extractHours(text) {
  const durationMatch = /duraci[oó]n\s*:?\s*(?:\n|\s)*([0-9]{1,4})\s*(?:horas|hrs|h\b)/i.exec(text)
  if (durationMatch) return Number(durationMatch[1])

  const hours = [...text.matchAll(/\b([0-9]{1,4})\s*(?:horas|hrs|h\b)/gi)]
    .map(match => Number(match[1]))
    .filter(n => n > 0 && n < 2000)
  return hours[0] || null
}

function inferModality(categorySlugs, title, text = '') {
  const titleKey = normalizeKey(title)
  const textKey = normalizeKey(text)
  if (textKey.includes('asincron')) return 'E-Learning'
  if (/(^|[^a-z])sincron/.test(textKey) || textKey.includes('en vivo online') || textKey.includes('videoconferencia')) return 'Online sincrónico'
  if (titleKey.startsWith('presencial')) return 'Presencial'
  if (titleKey.startsWith('e-learning') || titleKey.startsWith('online')) return 'E-Learning'
  if (titleKey.startsWith('a distancia')) return 'E-Learning'
  if (categorySlugs.includes('b-learning')) return 'Blended'
  if (categorySlugs.includes('presencial')) return 'Presencial'
  if (categorySlugs.includes('e-learning') || categorySlugs.includes('a-distancia')) return 'E-Learning'
  return 'Presencial'
}

function inferLevel(text) {
  const key = normalizeKey(text)
  if (key.includes('avanzado')) return 'Avanzado'
  if (key.includes('intermedio')) return 'Intermedio'
  return 'Básico'
}

function inferCategory(post, categorySlugs) {
  const areaSlug = categorySlugs.find(slug => AREA_META[slug])
  if (areaSlug) return AREA_META[areaSlug]

  const titleKey = normalizeKey(post.title.rendered)
  if (titleKey.includes('trabajo en equipo') || titleKey.includes('marketing')) return AREA_META.administracion
  return AREA_META['servicio-a-personas']
}

function findMatchingProduct(post, products) {
  if (!products.length) return null

  const postSlug = slugMatchKey(post.slug)
  const direct = products.find(product => product.slugKey === postSlug)
  if (direct) return direct

  const postTitle = titleMatchKey(post.title.rendered)
  const exact = products.find(product => product.titleKey === postTitle)
  if (exact) return exact

  return products.find(product => {
    if (!product.titleKey || !postTitle) return false
    return product.titleKey.includes(postTitle) || postTitle.includes(product.titleKey)
  }) || null
}

function bestDescription(section, productParagraphs, excerpt) {
  if (section?.text) return trimEmbeddedSectionLabels(section.text)
  const paragraph = productParagraphs.find(item => !/^(que aprendera|al finalizar|en particular)/i.test(normalizeKey(item)))
  if (paragraph) return trimEmbeddedSectionLabels(paragraph)
  if (excerpt && !/^contenidos?\s+del\s+curso/i.test(normalizeKey(excerpt))) return trimEmbeddedSectionLabels(excerpt)
  return 'Descripción no disponible.'
}

function bestObjective(section, learningSection, productParagraphs) {
  if (section?.text) return trimEmbeddedSectionLabels(section.text)
  if (learningSection?.text) {
    const text = trimEmbeddedSectionLabels(learningSection.text)
    const firstLine = text.split(/\n+/).map(line => line.trim()).find(Boolean)
    if (firstLine && firstLine.length <= 240) return firstLine
    const sentence = /^(.{40,240}?[.:])(?:\s|$)/s.exec(text)
    if (sentence) return sentence[1].trim()
    return text
  }
  const paragraph = productParagraphs.find(item => /objetivo|al finalizar|sera capaz|será capaz/i.test(item))
  return paragraph ? trimEmbeddedSectionLabels(paragraph) : DEFAULT_OBJECTIVE
}

function splitLongLearningItems(items) {
  if (items.length !== 1 || items[0].length < 240) return items
  return cleanItems(items[0].split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/g))
}

function buildCourse(post, categoriesById, mediaById, products) {
  const html = post.content?.rendered || ''
  const product = findMatchingProduct(post, products)
  const productHtml = product?.content?.rendered || ''
  const sections = getSections(html)
  const productSections = getSections(productHtml)
  const allSections = [...sections, ...productSections]
  const pageText = stripTags(html)
  const productText = stripTags(productHtml)
  const productParagraphs = extractParagraphs(productHtml)
  const categorySlugs = (post.categories || [])
    .map(id => categoriesById.get(id)?.slug)
    .filter(Boolean)

  const descriptionSection = findSection(
    allSections,
    ['presentacion', 'descripcion', 'introduccion'],
    ['contenidos', 'temario']
  )
  const objectiveSection = findSection(allSections, ['objetivo'], ['publico'])
  const learningSection = findSection(allSections, ['aprendera', 'aprenderas', 'aprendizaje'])
  const contentSection = findSection(allSections, ['contenido', 'temario', 'programa', 'modulo']) || learningSection

  const excerpt = normalizeText(post.excerpt?.rendered || '')
    .replace(/\[\s*&hellip;\s*\]|\[\s*...\s*\]/gi, '')
    .trim()

  const media = mediaById.get(post.featured_media)
  const imageUrl = media?.source_url || ''
  const imageName = imageUrl ? filenameFromUrl(imageUrl) : null
  const category = inferCategory(post, categorySlugs)
  const sectionItems = splitContentItems(contentSection)
  const productItems = extractListItems(productHtml)
  const contenidos = productItems.length > sectionItems.length ? productItems : sectionItems

  return {
    old_post_id: post.id,
    old_product_id: product?.id || null,
    old_url: post.link,
    old_product_url: product?.link || null,
    titulo: normalizeText(post.title.rendered),
    slug: post.slug,
    descripcion: bestDescription(descriptionSection, productParagraphs, excerpt),
    objetivo: bestObjective(objectiveSection, learningSection, productParagraphs),
    contenidos: splitLongLearningItems(contenidos),
    precio: extractPrice(pageText) || product?.precio || extractPrice(productText),
    horas: extractHours(pageText) || extractHours(productText),
    modalidad: inferModality(categorySlugs, post.title.rendered, `${pageText}\n${productText}`),
    nivel: inferLevel(`${pageText}\n${productText}`),
    franquicia_sence: false,
    activo: true,
    published_at: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
    cat_slug: category.slug,
    cat_nombre: category.nombre,
    cat_icono: category.icono,
    img_name: imageName,
    img_url: imageUrl,
    wp_categories: categorySlugs,
  }
}

async function loadWordPressCourses() {
  const categories = await fetchJson(`${OLD_SITE_URL}/wp-json/wp/v2/categories?per_page=100`)
  const categoriesById = new Map(categories.map(category => [category.id, category]))
  const courseRoot = categories.find(category => category.slug === COURSE_ROOT_SLUG)
  if (!courseRoot) throw new Error(`No se encontro la categoria WordPress "${COURSE_ROOT_SLUG}"`)

  const courseCategoryIds = new Set(categories
    .filter(category => category.parent === courseRoot.id || MODALITY_SLUGS.has(category.slug) || category.slug === COURSE_ROOT_SLUG)
    .map(category => category.id))

  const posts = []
  for (let page = 1; page <= 20; page += 1) {
    const fields = 'id,date,modified,slug,title,link,categories,featured_media,content,excerpt'
    const url = `${OLD_SITE_URL}/wp-json/wp/v2/posts?per_page=50&page=${page}&orderby=date&order=asc&_fields=${fields}`
    const batch = await fetchJson(url)
    posts.push(...batch)
    if (batch.length < 50) break
  }

  const candidates = posts
    .filter(post => !EXCLUDED_POST_SLUGS.has(post.slug))
    .filter(post => (post.categories || []).some(id => courseCategoryIds.has(id)))

  const mediaIds = [...new Set(candidates.map(post => post.featured_media).filter(Boolean))]
  const mediaById = new Map()
  for (const mediaId of mediaIds) {
    try {
      const media = await fetchJson(`${OLD_SITE_URL}/wp-json/wp/v2/media/${mediaId}?_fields=id,source_url,mime_type,media_details`)
      mediaById.set(media.id, media)
    } catch (err) {
      console.warn(`No se pudo leer media #${mediaId}: ${err.message}`)
    }
  }

  const products = await loadProducts()
  return candidates.map(post => buildCourse(post, categoriesById, mediaById, products))
}

async function loadProducts() {
  let products = []
  try {
    products = await fetchJson(`${OLD_SITE_URL}/wp-json/wp/v2/product?per_page=100&_fields=id,slug,title,link,content,excerpt,featured_media`)
  } catch (err) {
    console.warn(`No se pudieron leer productos WooCommerce: ${err.message}`)
    return []
  }

  for (const product of products) {
    product.titleText = normalizeText(product.title?.rendered || '')
    product.titleKey = titleMatchKey(product.titleText)
    product.slugKey = slugMatchKey(product.slug)
    product.precio = 0

    try {
      const res = await fetch(product.link)
      if (res.ok) {
        const html = await res.text()
        product.precio = extractPrice(stripTags(html))
      }
    } catch (err) {
      console.warn(`No se pudo leer precio producto #${product.id}: ${err.message}`)
    }
  }

  return products
}

function summarize(courses) {
  const byCategory = {}
  const byModality = {}
  let withoutImage = 0
  let withoutContents = 0
  for (const course of courses) {
    byCategory[course.cat_nombre] = (byCategory[course.cat_nombre] || 0) + 1
    byModality[course.modalidad] = (byModality[course.modalidad] || 0) + 1
    if (!course.img_url) withoutImage += 1
    if (!course.contenidos.length) withoutContents += 1
  }
  return { total: courses.length, byCategory, byModality, withoutImage, withoutContents }
}

async function uploadImageToSupabase(course) {
  if (!course.img_url) return null

  const { createClient } = require('@supabase/supabase-js')
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!process.env.SUPABASE_URL || !serviceKey) {
    throw new Error('Faltan SUPABASE_URL y SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY para --upload-images')
  }

  const bucket = process.env.SUPABASE_BUCKET || 'cetmed'
  const sb = createClient(process.env.SUPABASE_URL, serviceKey)
  const filename = course.img_name || filenameFromUrl(course.img_url, `${course.slug}.jpg`)
  const ext = path.extname(filename) || '.jpg'
  const storagePath = `courses/${course.slug}${ext}`
  const { buffer, contentType } = await fetchBuffer(course.img_url)

  const { error } = await sb.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: true,
    cacheControl: '31536000',
  })
  if (error) throw new Error(`Error subiendo ${filename}: ${error.message}`)

  const { data } = sb.storage.from(bucket).getPublicUrl(storagePath)
  return { url: data.publicUrl, name: filename, mimeType: contentType, size: buffer.length }
}

async function upsertImport(courses) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL para importar en la base actual')
  }

  const { query, queryOne, pool } = require('./db')
  const categoryIds = {}
  const mediaIds = {}

  try {
    const uniqueCategories = new Map(courses.map(course => [course.cat_slug, {
      slug: course.cat_slug,
      nombre: course.cat_nombre,
      icono: course.cat_icono,
    }]))

    for (const category of uniqueCategories.values()) {
      const row = await queryOne(
        `INSERT INTO categorias (nombre, slug, icono)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE
         SET nombre = EXCLUDED.nombre, icono = EXCLUDED.icono, updated_at = NOW()
         RETURNING id`,
        [category.nombre, category.slug, category.icono]
      )
      categoryIds[category.slug] = row.id
    }

    for (const course of courses) {
      let image = course.img_url
        ? {
            url: course.img_url,
            name: course.img_name || filenameFromUrl(course.img_url),
            mimeType: contentTypeFromFilename(course.img_name || course.img_url),
            size: null,
          }
        : null

      if (uploadImages && course.img_url) {
        image = await uploadImageToSupabase(course)
      }

      if (image) {
        const existing = await queryOne('SELECT id FROM media WHERE name = $1 ORDER BY id LIMIT 1', [image.name])
        let media
        if (existing) {
          media = await queryOne(
            `UPDATE media
             SET url = $1, mime_type = $2, size = COALESCE($3, size)
             WHERE id = $4
             RETURNING id`,
            [image.url, image.mimeType, image.size, existing.id]
          )
        } else {
          media = await queryOne(
            'INSERT INTO media (url, name, mime_type, size) VALUES ($1, $2, $3, $4) RETURNING id',
            [image.url, image.name, image.mimeType, image.size]
          )
        }
        mediaIds[course.slug] = media.id
      }

      await query(
        `INSERT INTO cursos
           (titulo, slug, descripcion, objetivo, contenidos, precio, horas, modalidad, nivel,
            franquicia_sence, activo, published_at, imagen_id, categoria_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (slug) DO UPDATE SET
           titulo = EXCLUDED.titulo,
           descripcion = EXCLUDED.descripcion,
           objetivo = EXCLUDED.objetivo,
           contenidos = EXCLUDED.contenidos,
           precio = EXCLUDED.precio,
           horas = EXCLUDED.horas,
           modalidad = EXCLUDED.modalidad,
           nivel = EXCLUDED.nivel,
           franquicia_sence = EXCLUDED.franquicia_sence,
           activo = EXCLUDED.activo,
           published_at = COALESCE(cursos.published_at, EXCLUDED.published_at),
           imagen_id = EXCLUDED.imagen_id,
           categoria_id = EXCLUDED.categoria_id,
           updated_at = NOW()`,
        [
          course.titulo,
          course.slug,
          course.descripcion,
          course.objetivo,
          JSON.stringify(course.contenidos),
          course.precio,
          course.horas,
          course.modalidad,
          course.nivel,
          course.franquicia_sence,
          course.activo,
          course.published_at,
          mediaIds[course.slug] || null,
          categoryIds[course.cat_slug] || null,
        ]
      )
    }
  } finally {
    await pool.end()
  }
}

async function main() {
  const courses = await loadWordPressCourses()
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(courses, null, 2)}\n`)

  const report = summarize(courses)
  console.log(JSON.stringify({ output: OUTPUT_PATH, dryRun, uploadImages, ...report }, null, 2))

  if (shouldImport) {
    await upsertImport(courses)
    console.log(`Importados/actualizados ${courses.length} cursos.`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err.message || err)
    process.exit(1)
  })
