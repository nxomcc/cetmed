import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Topbar from './Topbar'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false)
  const { pathname } = useLocation()
  const prevPath = useRef(pathname)

  // Listen for cart open from anywhere
  useEffect(() => {
    const handler = () => setCartOpen(true)
    window.addEventListener('cetmed:opencart', handler)
    return () => window.removeEventListener('cetmed:opencart', handler)
  }, [])

  // Close cart on route change
  useEffect(() => {
    if (prevPath.current !== pathname) {
      setCartOpen(false)
      prevPath.current = pathname
    }
  }, [pathname])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    const init = () => {
      document.querySelectorAll('[data-reveal]').forEach(el => {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.style.transition = 'none'
          el.classList.add('revealed')
          requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = '' }))
        } else {
          observer.observe(el)
        }
      })
    }
    // small delay so page content renders
    const t = setTimeout(init, 50)
    return () => { clearTimeout(t); observer.disconnect() }
  }, [pathname])

  return (
    <>
      <Topbar />
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)} />
      )}
    </>
  )
}
