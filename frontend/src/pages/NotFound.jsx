import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-black text-[var(--primary)]/10 mb-4">404</div>
      <h1 className="text-3xl font-black text-[var(--text-dark)] mb-3">Página no encontrada</h1>
      <p className="text-[var(--text-muted)] mb-8 max-w-sm">
        La página que buscas no existe o fue movida.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link to="/" className="btn-primary">
          <span className="material-icons text-sm">home</span>
          Volver al inicio
        </Link>
        <Link to="/cursos" className="btn-ghost">
          Ver cursos
        </Link>
      </div>
    </div>
  )
}
