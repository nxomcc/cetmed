import { supabase } from '../../services/supabaseClient'

const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'cetmed'

function strapiWrap(row) {
  if (!row) return null
  const { created_at, updated_at, published_at, categorias, media, ...rest } = row
  return {
    id: row.id,
    attributes: {
      ...rest,
      createdAt: created_at,
      updatedAt: updated_at,
      publishedAt: published_at || null,
      categoria: categorias ? { data: { id: categorias.id, attributes: categorias } } : { data: null },
      imagen: media ? { data: { id: media.id, attributes: media } } : { data: null },
    },
  }
}

function unwrapData(payload) {
  return payload?.data || payload
}

function roleName(role) {
  return role === 'admin-api' ? 'Administrador' : role === 'editor' ? 'Editor' : 'Usuario'
}

function fmtUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    blocked: row.blocked,
    createdAt: row.created_at,
    role: { type: row.role, name: roleName(row.role) },
  }
}

function getOrderItems(row) {
  const items = Array.isArray(row?.items) ? row.items : []
  return items
    .map(item => {
      if (typeof item === 'number') return { id: item }
      if (typeof item === 'string') return { id: Number(item) }
      return { ...item, id: Number(item?.id || item?.curso_id || item?.courseId) }
    })
    .filter(item => Number.isFinite(item.id) && item.id > 0)
}

function attachOrderCourses(row, coursesById) {
  const items = getOrderItems(row).map(item => {
    const course = coursesById.get(item.id)
    return {
      ...item,
      titulo: item.titulo || item.title || course?.titulo || `Curso #${item.id}`,
      slug: item.slug || course?.slug || null,
      precio: Number(item.precio ?? item.price ?? course?.precio ?? 0),
      moodle_course_id: item.moodle_course_id || course?.moodle_course_id || null,
    }
  })
  return { ...row, items }
}

function monthKey(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
}

async function requireSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) throw new Error('UNAUTHORIZED')
  return data.session
}

async function invokeFunction(name, body = undefined) {
  await requireSession()
  const { data, error } = await supabase.functions.invoke(name, body === undefined ? {} : { body })
  if (error) {
    if (error.context) {
      try {
        const payload = await error.context.json()
        throw new Error(payload?.error || error.message || `Error en ${name}`)
      } catch (payloadError) {
        if (payloadError?.message) throw payloadError
      }
    }
    throw new Error(error.message || `Error en ${name}`)
  }
  return data
}

async function selectList(table, select = '*', order = 'created_at', ascending = false) {
  await requireSession()
  const { data, error } = await supabase.from(table).select(select).order(order, { ascending }).limit(500)
  if (error) throw error
  return data || []
}

export async function login(identifier, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  })
  if (error) throw new Error('UNAUTHORIZED')
  return { jwt: data.session.access_token }
}

export async function logout() {
  await supabase.auth.signOut()
}

export async function getMe() {
  const session = await requireSession()
  const email = session.user.email?.toLowerCase()
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, role, blocked, created_at')
    .eq('email', email)
    .eq('blocked', false)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('UNAUTHORIZED')
  return fmtUser(data)
}

export async function uploadFile(file) {
  await requireSession()
  const ext = file.name.split('.').pop()
  const path = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const { data, error } = await supabase
    .from('media')
    .insert({ url: publicData.publicUrl, name: file.name, mime_type: file.type, size: file.size })
    .select('*')
    .single()
  if (error) throw error
  return { id: data.id, url: data.url, name: data.name }
}

export async function getCursos(extra = {}) {
  await requireSession()
  const { data, error } = await supabase
    .from('cursos')
    .select('*, categorias(*), media(*)')
    .order('created_at', { ascending: false })
    .limit(Number(extra['pagination[pageSize]'] || 200))
  if (error) throw error
  return { data: (data || []).map(strapiWrap), meta: { pagination: { total: data?.length || 0 } } }
}

export async function getCurso(id) {
  await requireSession()
  const { data, error } = await supabase.from('cursos').select('*, categorias(*), media(*)').eq('id', id).single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function createCurso(payload) {
  const body = unwrapData(payload)
  const row = {
    titulo: body.titulo,
    slug: body.slug,
    descripcion: body.descripcion || null,
    objetivo: body.objetivo || null,
    contenidos: body.contenidos || null,
    precio: body.precio || 0,
    horas: body.horas || null,
    modalidad: body.modalidad || 'Presencial',
    nivel: body.nivel || 'Basico-Intermedio',
    franquicia_sence: !!body.franquicia_sence,
    activo: body.activo !== false,
    published_at: body.publishedAt || new Date().toISOString(),
    imagen_id: body.imagen || null,
    categoria_id: body.categoria || null,
    moodle_course_id: body.moodle_course_id || null,
  }
  const { data, error } = await supabase.from('cursos').insert(row).select('*, categorias(*), media(*)').single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function updateCurso(id, payload) {
  const body = unwrapData(payload)
  const row = {
    ...(body.titulo !== undefined ? { titulo: body.titulo } : {}),
    ...(body.slug !== undefined ? { slug: body.slug } : {}),
    ...(body.descripcion !== undefined ? { descripcion: body.descripcion || null } : {}),
    ...(body.objetivo !== undefined ? { objetivo: body.objetivo || null } : {}),
    ...(body.contenidos !== undefined ? { contenidos: body.contenidos || null } : {}),
    ...(body.precio !== undefined ? { precio: body.precio || 0 } : {}),
    ...(body.horas !== undefined ? { horas: body.horas || null } : {}),
    ...(body.modalidad !== undefined ? { modalidad: body.modalidad } : {}),
    ...(body.nivel !== undefined ? { nivel: body.nivel } : {}),
    ...(body.franquicia_sence !== undefined ? { franquicia_sence: !!body.franquicia_sence } : {}),
    ...(body.activo !== undefined ? { activo: !!body.activo } : {}),
    ...(body.publishedAt !== undefined ? { published_at: body.publishedAt } : {}),
    ...(body.imagen !== undefined ? { imagen_id: body.imagen || null } : {}),
    ...(body.categoria !== undefined ? { categoria_id: body.categoria || null } : {}),
    ...(body.moodle_course_id !== undefined ? { moodle_course_id: body.moodle_course_id || null } : {}),
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('cursos').update(row).eq('id', id).select('*, categorias(*), media(*)').single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function deleteCurso(id) {
  const { error } = await supabase.from('cursos').delete().eq('id', id)
  if (error) throw error
  return null
}

export async function getNoticias(extra = {}) {
  await requireSession()
  const { data, error } = await supabase.from('noticias').select('*, media(*)').order('created_at', { ascending: false }).limit(Number(extra['pagination[pageSize]'] || 200))
  if (error) throw error
  return { data: (data || []).map(strapiWrap), meta: { pagination: { total: data?.length || 0 } } }
}

export async function getNoticia(id) {
  await requireSession()
  const { data, error } = await supabase.from('noticias').select('*, media(*)').eq('id', id).single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function createNoticia(payload) {
  const body = unwrapData(payload)
  const { data, error } = await supabase.from('noticias').insert({
    titulo: body.titulo,
    slug: body.slug,
    resumen: body.resumen || null,
    contenido: body.contenido || null,
    published_at: body.publishedAt || new Date().toISOString(),
    imagen_id: body.imagen || null,
  }).select('*, media(*)').single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function updateNoticia(id, payload) {
  const body = unwrapData(payload)
  const { data, error } = await supabase.from('noticias').update({
    ...(body.titulo !== undefined ? { titulo: body.titulo } : {}),
    ...(body.slug !== undefined ? { slug: body.slug } : {}),
    ...(body.resumen !== undefined ? { resumen: body.resumen || null } : {}),
    ...(body.contenido !== undefined ? { contenido: body.contenido || null } : {}),
    ...(body.publishedAt !== undefined ? { published_at: body.publishedAt } : {}),
    ...(body.imagen !== undefined ? { imagen_id: body.imagen || null } : {}),
    updated_at: new Date().toISOString(),
  }).eq('id', id).select('*, media(*)').single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function deleteNoticia(id) {
  const { error } = await supabase.from('noticias').delete().eq('id', id)
  if (error) throw error
  return null
}

export async function getCategorias() {
  const rows = await selectList('categorias', '*', 'nombre', true)
  return { data: rows.map(strapiWrap), meta: { pagination: { total: rows.length } } }
}

export async function createCategoria(payload) {
  const body = unwrapData(payload)
  const { data, error } = await supabase.from('categorias').insert(body).select('*').single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function updateCategoria(id, payload) {
  const body = unwrapData(payload)
  const { data, error } = await supabase.from('categorias').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).select('*').single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function deleteCategoria(id) {
  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) throw error
  return null
}

export async function getDescuentos() {
  const rows = await selectList('descuentos')
  return { data: rows.map(strapiWrap), meta: { pagination: { total: rows.length } } }
}

export async function getCursosForSelect() {
  const rows = await selectList('cursos', 'id,titulo', 'titulo', true)
  return rows.map(row => ({ id: row.id, titulo: row.titulo }))
}

export async function createDescuento(payload) {
  const body = unwrapData(payload)
  const { data, error } = await supabase.from('descuentos').insert(body).select('*').single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function updateDescuento(id, payload) {
  const body = unwrapData(payload)
  const { data, error } = await supabase.from('descuentos').update(body).eq('id', id).select('*').single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function deleteDescuento(id) {
  const { error } = await supabase.from('descuentos').delete().eq('id', id)
  if (error) throw error
  return null
}

export async function getPedidos() {
  await requireSession()
  const [pedidosResult, cursosResult] = await Promise.all([
    supabase.from('pedidos').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.from('cursos').select('id,titulo,slug,precio,moodle_course_id').limit(500),
  ])
  if (pedidosResult.error) throw pedidosResult.error
  if (cursosResult.error) throw cursosResult.error
  const coursesById = new Map((cursosResult.data || []).map(c => [Number(c.id), c]))
  const rows = (pedidosResult.data || []).map(row => attachOrderCourses(row, coursesById))
  return { data: rows.map(strapiWrap), meta: { pagination: { total: rows.length } } }
}

export async function updatePedido(id, payload) {
  const body = unwrapData(payload)
  const { data, error } = await supabase.from('pedidos').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).select('*').single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function getLeads() {
  await requireSession()
  const { data, error } = await supabase.from('leads').select('*, cursos(titulo)').order('created_at', { ascending: false }).limit(500)
  if (error) throw error
  return {
    data: (data || []).map(row => strapiWrap({ ...row, cursoTitulo: row.cursos?.titulo || null })),
    meta: { pagination: { total: data?.length || 0 } },
  }
}

export async function markLeadRead(id) {
  const { data, error } = await supabase.from('leads').update({ leido: true }).eq('id', id).select('*').single()
  if (error) throw error
  return { data: strapiWrap(data) }
}

export async function deleteLead(id) {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
  return null
}

export async function getLeadsStats() {
  const rows = await selectList('leads')
  const byAreaMap = new Map()
  for (const lead of rows) byAreaMap.set(lead.area || 'Sin especificar', (byAreaMap.get(lead.area || 'Sin especificar') || 0) + 1)
  return { byArea: [...byAreaMap.entries()].map(([label, total]) => ({ label, total })), byCurso: [] }
}

export async function downloadLeadsCSV() {
  const rows = await selectList('leads')
  const headers = ['Nombre','Email','Telefono','RUT','Empresa','Tipo','Area','Mensaje','Fecha']
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [
    headers.map(escape).join(','),
    ...rows.map(r => [r.nombre, r.email, r.telefono, r.rut, r.empresa, r.tipo, r.area, r.mensaje, r.created_at].map(escape).join(',')),
  ]
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'leads.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export async function getUsers() {
  const rows = await selectList('users', 'id,username,email,role,blocked,created_at')
  return rows.map(fmtUser)
}

export async function getUser(id) {
  await requireSession()
  const { data, error } = await supabase.from('users').select('id,username,email,role,blocked,created_at').eq('id', id).single()
  if (error) throw error
  return fmtUser(data)
}

export async function createUser(data) {
  const { password, ...profile } = data
  const { data: row, error } = await supabase.from('users').insert(profile).select('*').single()
  if (error) throw error
  return fmtUser(row)
}

export async function updateUser(id, data) {
  const { password, ...profile } = data
  const { data: row, error } = await supabase.from('users').update(profile).eq('id', id).select('*').single()
  if (error) throw error
  return fmtUser(row)
}

export async function deleteUser(id) {
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) throw error
  return null
}

export function getRoles() {
  return Promise.resolve({
    roles: [
      { id: 'admin-api', type: 'admin-api', name: 'Administrador' },
      { id: 'editor', type: 'editor', name: 'Editor' },
      { id: 'authenticated', type: 'authenticated', name: 'Usuario' },
    ],
  })
}

export async function getStats() {
  await requireSession()
  const [{ count: totalCursos }, { count: totalNoticias }, { count: totalLeads }, { count: unreadLeads }, pedidos, cursos] = await Promise.all([
    supabase.from('cursos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('noticias').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('leido', false),
    supabase.from('pedidos').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.from('cursos').select('id,titulo,slug,precio,moodle_course_id,vistas').order('vistas', { ascending: false }).limit(500),
  ])
  if (pedidos.error) throw pedidos.error
  if (cursos.error) throw cursos.error

  const coursesById = new Map((cursos.data || []).map(c => [Number(c.id), c]))
  const enrichedPedidos = (pedidos.data || []).map(row => attachOrderCourses(row, coursesById))
  const completed = enrichedPedidos.filter(p => p.estado === 'completado')
  const totalRevenue = completed.reduce((sum, p) => sum + Number(p.total || 0), 0)
  const revenueByMonth = new Map()
  const soldByCourse = new Map()

  for (const pedido of completed) {
    const key = monthKey(pedido.created_at)
    if (key) revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + Number(pedido.total || 0))

    for (const item of getOrderItems(pedido)) {
      const course = coursesById.get(item.id)
      const existing = soldByCourse.get(item.id) || {
        id: item.id,
        titulo: item.titulo || item.title || course?.titulo || `Curso #${item.id}`,
        vendidos: 0,
        ingresos: 0,
      }
      existing.vendidos += 1
      existing.ingresos += Number(item.precio ?? item.price ?? course?.precio ?? 0)
      soldByCourse.set(item.id, existing)
    }
  }

  const monthlyRevenue = [...revenueByMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, ingresos]) => ({ mes: monthLabel(key), ingresos }))

  return {
    totalCursos: totalCursos || 0,
    totalNoticias: totalNoticias || 0,
    totalLeads: totalLeads || 0,
    unreadLeads: unreadLeads || 0,
    totalRevenue,
    totalOrders: completed.length,
    monthlyRevenue,
    topCursos: (cursos.data || []).slice(0, 5),
    topCursosVendidos: [...soldByCourse.values()].sort((a, b) => b.vendidos - a.vendidos || b.ingresos - a.ingresos).slice(0, 5),
    recentPedidos: enrichedPedidos.slice(0, 5).map(p => ({ ...p, createdAt: p.created_at })),
  }
}

export async function listarCursosMoodle() {
  const data = await invokeFunction('listar-cursos-moodle')
  return data?.courses || []
}

export async function crearCursoMoodle(payload) {
  const data = await invokeFunction('crear-curso-moodle', payload)
  return data?.course
}
