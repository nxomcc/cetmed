import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider } from './admin/context/AdminAuthContext'
import Layout from './components/layout/Layout'

import Home          from './pages/Home'
import Nosotros      from './pages/Nosotros'
import Cursos        from './pages/Cursos'
import CursoDetalle  from './pages/CursoDetalle'
import Noticias      from './pages/Noticias'
import NoticiaDetalle from './pages/NoticiaDetalle'
import Contacto      from './pages/Contacto'
import Carrito       from './pages/Carrito'
import Checkout      from './pages/Checkout'
import NotFound      from './pages/NotFound'
import Terminos      from './pages/Terminos'
import Privacidad    from './pages/Privacidad'
import PoliticasMantenimiento from './pages/PoliticasMantenimiento'

import AdminWrapper from './admin/AdminWrapper'

export default function App() {
  // Admin uses MemoryRouter — must render outside BrowserRouter to avoid nested-router error
  if (window.location.pathname.startsWith('/admin')) {
    return (
      <CartProvider>
        <AdminAuthProvider>
          <AdminWrapper />
        </AdminAuthProvider>
      </CartProvider>
    )
  }

  return (
    <CartProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index               element={<Home />} />
              <Route path="nosotros"     element={<Nosotros />} />
              <Route path="cursos"       element={<Cursos />} />
              <Route path="cursos/:slug" element={<CursoDetalle />} />
              <Route path="noticias"     element={<Noticias />} />
              <Route path="noticias/:slug" element={<NoticiaDetalle />} />
              <Route path="contacto"     element={<Contacto />} />
              <Route path="carrito"      element={<Carrito />} />
              <Route path="checkout"     element={<Checkout />} />
              <Route path="terminos-y-condiciones" element={<Terminos />} />
              <Route path="politica-de-privacidad" element={<Privacidad />} />
<Route path="politicas-de-mantenimiento" element={<PoliticasMantenimiento />} />
              <Route path="*"            element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </CartProvider>
  )
}
