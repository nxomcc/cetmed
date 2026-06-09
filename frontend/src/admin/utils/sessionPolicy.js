const ADMIN_SESSION_KEY = 'cetmed_admin_session'

export const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000
export const ADMIN_MAX_SESSION_MS = 8 * 60 * 60 * 1000

function now() {
  return Date.now()
}

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.sessionStorage
}

function readMeta() {
  const storage = getStorage()
  if (!storage) return null
  try {
    return JSON.parse(storage.getItem(ADMIN_SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

function writeMeta(meta) {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(ADMIN_SESSION_KEY, JSON.stringify(meta))
}

export function startAdminSession() {
  const timestamp = now()
  writeMeta({ createdAt: timestamp, lastActivityAt: timestamp })
}

export function touchAdminSession() {
  const meta = readMeta()
  if (!meta) return
  const timestamp = now()
  if (timestamp - Number(meta.lastActivityAt || 0) < 60 * 1000) return
  writeMeta({ ...meta, lastActivityAt: timestamp })
}

export function clearAdminSessionMeta() {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(ADMIN_SESSION_KEY)
}

export function cleanupLegacySupabaseStorage() {
  if (typeof window === 'undefined') return
  for (const key of Object.keys(window.localStorage)) {
    if (/^sb-.+-auth-token$/.test(key)) {
      window.localStorage.removeItem(key)
    }
  }
}

export function isAdminSessionFresh() {
  const meta = readMeta()
  if (!meta?.createdAt || !meta?.lastActivityAt) return false

  const timestamp = now()
  const age = timestamp - Number(meta.createdAt)
  const idle = timestamp - Number(meta.lastActivityAt)

  return age <= ADMIN_MAX_SESSION_MS && idle <= ADMIN_IDLE_TIMEOUT_MS
}

export async function enforceAdminSession(supabase) {
  if (isAdminSessionFresh()) return true
  clearAdminSessionMeta()
  await supabase.auth.signOut()
  return false
}
