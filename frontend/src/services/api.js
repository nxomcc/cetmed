import { supabase } from './supabaseClient'

function mediaToStrapi(row) {
  return row ? { data: { id: row.id, attributes: { url: row.url, name: row.name } } } : { data: null }
}

function categoriaToStrapi(row) {
  return row ? { data: { id: row.id, attributes: { nombre: row.nombre, slug: row.slug, icono: row.icono } } } : { data: null }
}

function cursoToStrapi(row) {
  if (!row) return null
  const { categorias, media, created_at, updated_at, published_at, imagen_id, categoria_id, ...rest } = row
  return {
    id: row.id,
    attributes: {
      ...rest,
      createdAt: created_at,
      updatedAt: updated_at,
      publishedAt: published_at || null,
      categoria: categoriaToStrapi(categorias),
      imagen: mediaToStrapi(media),
    },
  }
}

function noticiaToStrapi(row) {
  if (!row) return null
  const { media, created_at, updated_at, published_at, imagen_id, ...rest } = row
  return {
    id: row.id,
    attributes: {
      ...rest,
      createdAt: created_at,
      updatedAt: updated_at,
      publishedAt: published_at || null,
      imagen: mediaToStrapi(media),
    },
  }
}

function categoriaRowToStrapi(row) {
  return { id: row.id, attributes: { ...row, createdAt: row.created_at, updatedAt: row.updated_at } }
}

async function invokeFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) throw new Error(error.message || `Error en ${name}`)
  return data
}

export async function getCursos(filters = {}) {
  const slug = filters['filters[slug][$eq]']
  const pageSize = Number(filters['pagination[pageSize]'] || 100)

  let q = supabase
    .from('cursos')
    .select('*, categorias(*), media(*)')
    .eq('activo', true)
    .not('published_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(pageSize)

  if (slug) q = q.eq('slug', slug).limit(1)

  const { data, error } = await q
  if (error) throw error
  return { data: (data || []).map(cursoToStrapi), meta: { pagination: { total: data?.length || 0 } } }
}

export async function getCurso(slug) {
  const res = await getCursos({ 'filters[slug][$eq]': slug })
  return res.data?.[0] || null
}

export async function getCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre', { ascending: true })
    .limit(100)
  if (error) throw error
  return { data: (data || []).map(categoriaRowToStrapi), meta: { pagination: { total: data?.length || 0 } } }
}

export async function getNoticias(filters = {}) {
  const slug = filters['filters[slug][$eq]']
  const pageSize = Number(filters['pagination[pageSize]'] || 50)

  let q = supabase
    .from('noticias')
    .select('*, media(*)')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(pageSize)

  if (slug) q = q.eq('slug', slug).limit(1)

  const { data, error } = await q
  if (error) throw error
  return { data: (data || []).map(noticiaToStrapi), meta: { pagination: { total: data?.length || 0 } } }
}

export async function getNoticia(slug) {
  const res = await getNoticias({ 'filters[slug][$eq]': slug })
  return res.data?.[0] || null
}

export function crearPagoGetnet(datosPago) {
  return invokeFunction('crear-pago-getnet', datosPago)
}

export function consultarPagoGetnet(orderId) {
  return invokeFunction('consultar-pago-getnet', { orderId })
}

export function simularCompraMoodle(datosPago) {
  return invokeFunction('simular-compra-moodle', datosPago)
}

export async function registerCursoView(id) {
  try {
    const { data } = await supabase.from('cursos').select('vistas').eq('id', id).single()
    await supabase.from('cursos').update({ vistas: Number(data?.vistas || 0) + 1 }).eq('id', id)
  } catch {}
}

export async function registerNoticiaView(id) {
  try {
    const { data } = await supabase.from('noticias').select('vistas').eq('id', id).single()
    await supabase.from('noticias').update({ vistas: Number(data?.vistas || 0) + 1 }).eq('id', id)
  } catch {}
}

export async function validarDescuento(codigo, subtotal) {
  const normalized = codigo.trim().toUpperCase()
  const { data, error } = await supabase
    .from('descuentos')
    .select('*')
    .eq('codigo', normalized)
    .eq('activo', true)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Codigo invalido')
  if (data.fecha_expiracion && new Date(data.fecha_expiracion) < new Date()) throw new Error('Codigo expirado')
  if (data.limite_usos && Number(data.usos_actuales || 0) >= Number(data.limite_usos)) throw new Error('Codigo sin usos')

  const valor = Number(data.valor)
  const monto = data.tipo === 'porcentaje' ? Math.round(Number(subtotal || 0) * valor / 100) : valor
  return { ...data, valor, monto }
}

export async function crearLead(data) {
  const { data: created, error } = await supabase.from('leads').insert(data).select('*').single()
  if (error) throw error
  return created
}

export function imgUrl(media) {
  if (!media?.data) return null
  return media.data.attributes?.url || null
}
