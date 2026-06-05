import { useEffect } from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import PrivateRoute    from './components/PrivateRoute'
import AdminLayout     from './components/AdminLayout'
import AdminLogin      from './pages/AdminLogin'
import AdminDashboard  from './pages/AdminDashboard'
import AdminCursos     from './pages/AdminCursos'
import AdminCursoForm  from './pages/AdminCursoForm'
import AdminNoticias   from './pages/AdminNoticias'
import AdminNoticiaForm from './pages/AdminNoticiaForm'
import AdminCategorias from './pages/AdminCategorias'
import AdminDescuentos from './pages/AdminDescuentos'
import AdminPedidos    from './pages/AdminPedidos'
import AdminLeads      from './pages/AdminLeads'
import AdminUsuarios   from './pages/AdminUsuarios'

export default function AdminWrapper() {
  useEffect(() => {
    // Normalize the browser URL bar to /admin — MemoryRouter handles internal routing,
    // so the visible URL never needs to change regardless of which section is active.
    if (window.location.pathname !== '/admin') {
      window.history.replaceState({}, '', '/admin')
    }
  }, [])

  return (
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<PrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route index                    element={<AdminDashboard />} />
            <Route path="cursos"            element={<AdminCursos />} />
            <Route path="cursos/nuevo"      element={<AdminCursoForm />} />
            <Route path="cursos/:id"        element={<AdminCursoForm />} />
            <Route path="noticias"          element={<AdminNoticias />} />
            <Route path="noticias/nueva"    element={<AdminNoticiaForm />} />
            <Route path="noticias/:id"      element={<AdminNoticiaForm />} />
            <Route path="categorias"        element={<AdminCategorias />} />
            <Route path="descuentos"        element={<AdminDescuentos />} />
            <Route path="pedidos"           element={<AdminPedidos />} />
            <Route path="leads"             element={<AdminLeads />} />
            <Route path="usuarios"          element={<AdminUsuarios />} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>
  )
}
