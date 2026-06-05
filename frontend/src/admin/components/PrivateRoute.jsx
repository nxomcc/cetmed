import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003d7a]" />
      </div>
    )
  }

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/admin/login" state={{ from: location }} replace />
}
