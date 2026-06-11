import { requireEditor } from '../_shared/auth.ts'
import { handleOptions, json } from '../_shared/cors.ts'
import { serviceClient } from '../_shared/supabase.ts'

const VALID_ROLES = new Set(['admin-api', 'editor', 'authenticated'])
const FALLBACK_PASSWORD_HASH = 'managed-by-supabase-auth'

function cleanText(value: unknown) {
  return String(value || '').trim()
}

function cleanEmail(value: unknown) {
  return cleanText(value).toLowerCase()
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalizeRole(value: unknown) {
  const role = cleanText(value) || 'editor'
  if (!VALID_ROLES.has(role)) throw new Error('Rol invalido')
  return role
}

function publicUserSelect() {
  return 'id,username,email,role,blocked,created_at'
}

async function requireAdmin(req: Request) {
  const session = await requireEditor(req)
  if (session.profile.role !== 'admin-api') throw new Error('FORBIDDEN')
  return session
}

async function findAuthUserByEmail(sb: ReturnType<typeof serviceClient>, email: string) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error

    const found = data.users.find((user) => user.email?.toLowerCase() === email)
    if (found) return found
    if (data.users.length < 1000) return null
  }

  return null
}

async function insertProfile(sb: ReturnType<typeof serviceClient>, profile: Record<string, unknown>) {
  const baseInsert = await sb
    .from('users')
    .insert(profile)
    .select(publicUserSelect())
    .single()

  if (!baseInsert.error) return baseInsert.data

  const message = baseInsert.error.message || ''
  if (!message.toLowerCase().includes('password_hash')) throw baseInsert.error

  const fallbackInsert = await sb
    .from('users')
    .insert({ ...profile, password_hash: FALLBACK_PASSWORD_HASH })
    .select(publicUserSelect())
    .single()

  if (fallbackInsert.error) throw fallbackInsert.error
  return fallbackInsert.data
}

async function createUser(sb: ReturnType<typeof serviceClient>, body: Record<string, unknown>) {
  const username = cleanText(body.username)
  const email = cleanEmail(body.email)
  const password = cleanText(body.password)
  const role = normalizeRole(body.role)
  const blocked = Boolean(body.blocked)

  if (!username || !email || !password) throw new Error('Usuario, email y contrasena son obligatorios')
  if (!isEmail(email)) throw new Error('Email invalido')
  if (password.length < 8) throw new Error('La contrasena debe tener al menos 8 caracteres')

  const { data: duplicateUsername, error: duplicateUsernameError } = await sb
    .from('users')
    .select('id,username,email')
    .eq('username', username)
    .maybeSingle()

  if (duplicateUsernameError) throw duplicateUsernameError
  if (duplicateUsername) throw new Error('Ya existe un usuario con ese usuario')

  const { data: duplicateEmail, error: duplicateEmailError } = await sb
    .from('users')
    .select('id,username,email')
    .eq('email', email)
    .maybeSingle()

  if (duplicateEmailError) throw duplicateEmailError
  if (duplicateEmail) throw new Error('Ya existe un usuario con ese email')

  let authUser = await findAuthUserByEmail(sb, email)
  let createdAuthUserId: string | null = null

  if (authUser) {
    const { data, error } = await sb.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
      user_metadata: { username, role },
    })
    if (error) throw error
    authUser = data.user
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role },
    })
    if (error) throw error
    authUser = data.user
    createdAuthUserId = authUser.id
  }

  try {
    const profile = await insertProfile(sb, { username, email, role, blocked })
    return profile
  } catch (error) {
    if (createdAuthUserId) {
      await sb.auth.admin.deleteUser(createdAuthUserId).catch(() => null)
    }
    throw error
  }
}

async function updateUser(sb: ReturnType<typeof serviceClient>, actorEmail: string, body: Record<string, unknown>) {
  const id = Number(body.id)
  if (!Number.isFinite(id) || id <= 0) throw new Error('Usuario invalido')

  const { data: current, error: currentError } = await sb
    .from('users')
    .select(publicUserSelect())
    .eq('id', id)
    .single()

  if (currentError) throw currentError

  const username = body.username === undefined ? current.username : cleanText(body.username)
  const email = body.email === undefined ? current.email : cleanEmail(body.email)
  const role = body.role === undefined ? current.role : normalizeRole(body.role)
  const blocked = body.blocked === undefined ? current.blocked : Boolean(body.blocked)
  const password = body.password === undefined ? '' : cleanText(body.password)
  const isSelf = current.email?.toLowerCase() === actorEmail

  if (!username || !email) throw new Error('Usuario y email son obligatorios')
  if (!isEmail(email)) throw new Error('Email invalido')
  if (password && password.length < 8) throw new Error('La contrasena debe tener al menos 8 caracteres')
  if (isSelf && blocked) throw new Error('No puedes bloquear tu propio usuario')
  if (isSelf && role !== 'admin-api') throw new Error('No puedes quitarte el rol de administrador')

  if (username !== current.username || email !== current.email) {
    const { data: duplicateUsername, error: duplicateUsernameError } = await sb
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', id)
      .maybeSingle()

    if (duplicateUsernameError) throw duplicateUsernameError
    if (duplicateUsername) throw new Error('Ya existe otro usuario con ese usuario')

    const { data: duplicateEmail, error: duplicateEmailError } = await sb
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .maybeSingle()

    if (duplicateEmailError) throw duplicateEmailError
    if (duplicateEmail) throw new Error('Ya existe otro usuario con ese email')
  }

  const authUser = await findAuthUserByEmail(sb, current.email.toLowerCase())
  if (authUser) {
    const authUpdate: Record<string, unknown> = {
      email,
      email_confirm: true,
      user_metadata: { username, role },
    }
    if (password) authUpdate.password = password

    const { error: authError } = await sb.auth.admin.updateUserById(authUser.id, authUpdate)
    if (authError) throw authError
  }

  const { data: profile, error } = await sb
    .from('users')
    .update({ username, email, role, blocked })
    .eq('id', id)
    .select(publicUserSelect())
    .single()

  if (error) throw error
  return profile
}

async function deleteUser(sb: ReturnType<typeof serviceClient>, actorEmail: string, body: Record<string, unknown>) {
  const id = Number(body.id)
  if (!Number.isFinite(id) || id <= 0) throw new Error('Usuario invalido')

  const { data: profile, error: profileError } = await sb
    .from('users')
    .select(publicUserSelect())
    .eq('id', id)
    .single()

  if (profileError) throw profileError
  if (profile.email?.toLowerCase() === actorEmail) throw new Error('No puedes eliminar tu propio usuario')

  const authUser = await findAuthUserByEmail(sb, profile.email.toLowerCase())
  if (authUser) {
    const { error: authError } = await sb.auth.admin.deleteUser(authUser.id)
    if (authError) throw authError
  }

  const { error } = await sb.from('users').delete().eq('id', id)
  if (error) throw error
  return profile
}

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  try {
    const session = await requireAdmin(req)
    const sb = serviceClient()
    const body = await req.json()
    const action = cleanText(body.action)
    const actorEmail = session.user.email?.toLowerCase() || ''

    if (action === 'create') {
      const user = await createUser(sb, body)
      return json(req, { user }, 201)
    }

    if (action === 'update') {
      const user = await updateUser(sb, actorEmail, body)
      return json(req, { user })
    }

    if (action === 'delete') {
      await deleteUser(sb, actorEmail, body)
      return json(req, { ok: true })
    }

    return json(req, { error: 'Accion invalida' }, 400)
  } catch (error) {
    const message = error.message || 'Error gestionando usuario'
    const status = message === 'UNAUTHORIZED' ? 401 : message === 'FORBIDDEN' ? 403 : 400
    return json(req, { error: message }, status)
  }
})
