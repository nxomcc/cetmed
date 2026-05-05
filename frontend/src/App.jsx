import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Layout from './components/layout/Layout'

import Home        from './pages/Home'
import Nosotros    from './pages/Nosotros'
import Cursos      from './pages/Cursos'
import CursoDetalle from './pages/CursoDetalle'
import Noticias    from './pages/Noticias'
import NoticiaDetalle from './pages/NoticiaDetalle'
import Contacto    from './pages/Contacto'
import Carrito     from './pages/Carrito'
import Checkout    from './pages/Checkout'
import NotFound    from './pages/NotFound'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index             element={<Home />} />
            <Route path="nosotros"   element={<Nosotros />} />
            <Route path="cursos"     element={<Cursos />} />
            <Route path="cursos/:slug" element={<CursoDetalle />} />
            <Route path="noticias"   element={<Noticias />} />
            <Route path="noticias/:slug" element={<NoticiaDetalle />} />
            <Route path="contacto"   element={<Contacto />} />
            <Route path="carrito"    element={<Carrito />} />
            <Route path="checkout"   element={<Checkout />} />
            <Route path="*"          element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
