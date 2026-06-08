import { createClient } from '@supabase/supabase-js'

const runtimeConfig = globalThis.__CETMED_CONFIG__ || {}
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || runtimeConfig.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || runtimeConfig.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Falta configurar Supabase en VITE_* o /config.js')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export function edgeFunctionUrl(name) {
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/${name}`
}
