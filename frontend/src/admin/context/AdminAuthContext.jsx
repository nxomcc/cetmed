import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, login as apiLogin, logout as apiLogout } from '../services/adminApi'
import { supabase } from '../../services/supabaseClient'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [role, setRole]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) return
        const me = await getMe()
        if (!active) return
        setUser(me)
        setRole(me.role?.type)
      } catch {
        await supabase.auth.signOut()
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
        setRole(null)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (identifier, password) => {
    await apiLogin(identifier, password)
    const me = await getMe()
    setUser(me)
    setRole(me.role?.type)
    return me
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    setRole(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{
      user, role, loading,
      login, logout,
      isAuthenticated: !!user,
      isAdmin: role === 'admin-api',
      isEditor: role === 'editor' || role === 'admin-api',
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
