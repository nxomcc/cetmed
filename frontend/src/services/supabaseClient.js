import { createClient } from '@supabase/supabase-js'

const runtimeConfig = globalThis.__CETMED_CONFIG__ || {}
const supabaseUrl = runtimeConfig.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = runtimeConfig.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
const sessionStorageAdapter = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null
    return window.sessionStorage.getItem(key)
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value)
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(key)
  },
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Falta configurar Supabase en VITE_* o /config.js')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: sessionStorageAdapter,
    storageKey: 'cetmed-admin-auth-token',
  },
})

export function edgeFunctionUrl(name) {
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/${name}`
}
