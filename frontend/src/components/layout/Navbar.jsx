import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useCart from '../../hooks/useCart'

const LOGO_URL = '/images/brand/logo-web.png'

const NAV_LINKS = [
  { to: '/',         label: 'Inicio' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/cursos',   label: 'Cursos' },
  { to: '/noticias', label: 'Noticias' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Navbar({ onCartOpen }) {
  const { count } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline min-w-0">
            <img src={LOGO_URL} alt="CETMED" className="h-10 w-auto object-contain" />
            <span className="font-black text-xl tracking-tight truncate" style={{ color:'var(--primary)', letterSpacing:'-0.02em' }}>
              CETMED
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/cursos" className="btn-primary hidden sm:flex text-sm py-2 px-4">
              Inscríbete
            </Link>

            {/* Cart */}
            <button onClick={onCartOpen}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Carrito">
              <span className="material-icons text-[var(--text-dark)]">shopping_cart</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[var(--accent)] text-[var(--primary-dark)] text-[0.65rem] font-black rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile burger */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMenuOpen(true)} aria-label="Menú">
              <span className="material-icons">menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="CETMED" className="h-9 w-auto object-contain brightness-0 invert" />
            <span className="font-black text-xl text-white tracking-tight">CETMED</span>
          </div>
          <button onClick={() => setMenuOpen(false)} className="p-2 text-white">
            <span className="material-icons">close</span>
          </button>
        </div>

        <nav className="flex-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to}
              onClick={() => setMenuOpen(false)}
              className="mobile-nav-link">
              {label}
              <span className="material-icons text-sm opacity-50">chevron_right</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 space-y-3">
          <Link to="/cursos" onClick={() => setMenuOpen(false)}
            className="btn-primary w-full justify-center">
            <span className="material-icons text-sm">school</span>
            Ver cursos
          </Link>
        </div>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 bg-black/40 z-[199]"
          onClick={() => setMenuOpen(false)} />
      )}
    </>
  )
}
