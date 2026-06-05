import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import logo from '../../assets/logo.png'

export default function AdminLogin() {
  const { login, isAuthenticated } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const [form, setForm]       = useState({ identifier: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated])

  // noindex
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta) }
    meta.content = 'noindex, nofollow'
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const me = await login(form.identifier.trim(), form.password)
      if (!me.role || !['editor', 'admin-api'].includes(me.role.type)) {
        throw new Error('No tenés permisos para acceder al panel.')
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message === 'UNAUTHORIZED' || err.message.includes('Invalid')
        ? 'Credenciales incorrectas. Revisá tu usuario y contraseña.'
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#003d7a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="CETMED" className="h-14 w-auto mx-auto mb-3 brightness-0 invert" />
          <p className="text-white/60 text-sm">Panel de administración</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Iniciar sesión</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <span className="material-icons text-[18px] shrink-0">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usuario o email</label>
              <input
                autoFocus
                value={form.identifier}
                onChange={e => setForm(p => ({ ...p, identifier: e.target.value }))}
                required
                placeholder="tu@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons text-[20px]">{showPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003d7a] text-white font-semibold py-3 rounded-xl text-sm hover:bg-[#002d5a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <span className="animate-spin material-icons text-[18px]">refresh</span> : <span className="material-icons text-[18px]">login</span>}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-white/40 text-xs">
          <a href="/" className="hover:text-white/70 transition-colors">← Volver al sitio</a>
        </p>
      </div>
    </div>
  )
}
