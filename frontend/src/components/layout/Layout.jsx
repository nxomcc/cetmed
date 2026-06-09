import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Topbar from './Topbar'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/56927781966"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-7 h-7" fill="currentColor">
        <path d="M12.04 2a9.86 9.86 0 0 0-8.5 14.86L2.2 22l5.28-1.3A9.92 9.92 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.13.77.8-3.04-.2-.32A8.2 8.2 0 1 1 12.04 20.1Zm4.5-6.15c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.65.8-.8.96-.15.17-.3.19-.55.06-.25-.12-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.15-.25-.02-.39.11-.51.12-.12.25-.3.38-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.03 2.6.12.17 1.77 2.7 4.3 3.78.6.26 1.07.42 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
      </svg>
    </a>
  )
}

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
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.12 }
    )

    const revealElement = el => {
      if (el.classList.contains('revealed')) return
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.style.transition = 'none'
        el.classList.add('revealed')
        requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = '' }))
      } else {
        observer.observe(el)
      }
    }

    const init = () => {
      document.querySelectorAll('[data-reveal]').forEach(revealElement)
    }

    // Small delay for initial render
    const t = setTimeout(init, 50)

    // Observe DOM changes to dynamically reveal late-loading elements (e.g. after API fetches)
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.hasAttribute('data-reveal')) {
              revealElement(node)
            }
            node.querySelectorAll('[data-reveal]').forEach(revealElement)
          }
        })
      })
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(t)
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [pathname])

  return (
    <>
      <Topbar />
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)} />
      )}
    </>
  )
}
