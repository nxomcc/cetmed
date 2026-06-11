import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import logo from '../../assets/logo.png'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { to: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true },
    ],
  },
  {
    label: 'Contenido',
    items: [
      { to: '/admin/cursos', icon: 'school', label: 'Cursos' },
      { to: '/admin/noticias', icon: 'article', label: 'Noticias' },
      { to: '/admin/categorias', icon: 'category', label: 'Categorias' },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { to: '/admin/descuentos', icon: 'local_offer', label: 'Descuentos', adminOnly: true },
      { to: '/admin/pedidos', icon: 'shopping_bag', label: 'Pedidos' },
    ],
  },
  {
    label: 'Alumnos',
    items: [
      { to: '/admin/matriculas', icon: 'how_to_reg', label: 'Matriculas' },
      { to: '/admin/alumnos', icon: 'groups', label: 'Lista de alumnos' },
      { to: '/admin/leads', icon: 'contact_mail', label: 'Leads' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/admin/usuarios', icon: 'manage_accounts', label: 'Usuarios', adminOnly: true },
    ],
  },
]

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAdminAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    const prev = meta.content
    meta.content = 'noindex, nofollow'
    return () => { meta.content = prev }
  }, [])

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  const groups = NAV_GROUPS
    .map(group => ({ ...group, items: group.items.filter(item => !item.adminOnly || isAdmin) }))
    .filter(group => group.items.length)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#003d7a] flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <img src={logo} alt="CETMED" className="h-8 w-auto brightness-0 invert" />
          <p className="text-white/50 text-xs">Panel de Control</p>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {groups.map(group => (
            <div key={group.label}>
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-white/35">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <span className="material-icons text-[18px]">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-[#F0A500] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
              <p className="text-white/50 text-xs">{isAdmin ? 'Administrador' : 'Editor'}</p>
            </div>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <span className="material-icons text-[18px]">open_in_new</span>
            Ver sitio
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <span className="material-icons text-[18px]">logout</span>
            Cerrar sesion
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center gap-3 px-4 py-3">
          <button onClick={() => setOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <span className="material-icons text-gray-600">menu</span>
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
