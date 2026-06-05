import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, getMe } from '../services/adminApi'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [role, setRole]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const jwt = sessionStorage.getItem('admin_jwt')
    if (!jwt) { setLoading(false); return }

    getMe()
      .then(me => {
        setUser(me)
        setRole(me.role?.type)
      })
      .catch(() => {
        sessionStorage.removeItem('admin_jwt')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (identifier, password) => {
    const { jwt } = await apiLogin(identifier, password)
    sessionStorage.setItem('admin_jwt', jwt)
    const me = await getMe()
    setUser(me)
    setRole(me.role?.type)
    return me
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('admin_jwt')
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
