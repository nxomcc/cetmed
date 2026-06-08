import { serviceClient } from './supabase.ts'

export async function requireEditor(req: Request) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) throw new Error('UNAUTHORIZED')

  const sb = serviceClient()
  const { data: authData, error: authError } = await sb.auth.getUser(token)
  if (authError || !authData.user?.email) throw new Error('UNAUTHORIZED')

  const { data: profile, error: profileError } = await sb
    .from('users')
    .select('role,blocked,email')
    .eq('email', authData.user.email.toLowerCase())
    .maybeSingle()

  if (profileError) throw profileError
  if (!profile || profile.blocked || !['editor', 'admin-api'].includes(profile.role)) {
    throw new Error('FORBIDDEN')
  }

  return { user: authData.user, profile }
}
