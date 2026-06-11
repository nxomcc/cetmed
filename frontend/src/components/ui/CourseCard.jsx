import { Link } from 'react-router-dom'
import useCart from '../../hooks/useCart'
import { COURSE_PLACEHOLDER, MODALIDAD_ICON, fmtPrice, getCourseImageUrl } from '../../utils/courseDisplay'

export default function CourseCard({ curso, onCartOpen }) {
  const { addItem, inCart } = useCart()
  const { id, attributes: a } = curso
  const slug    = a?.slug || id
  const titulo  = a?.titulo || 'Curso'
  const precio  = a?.precio ?? 0
  const horas   = a?.horas
  const activo  = a?.activo !== false
  const modalidad = a?.modalidad || 'Presencial'
  const categoria = a?.categoria?.data?.attributes?.nombre
  const imgData = a?.imagen?.data
  const imgSrc  = getCourseImageUrl(imgData, titulo)

  const added = inCart(id)

  function handleAdd(e) {
    e.preventDefault()
    if (!activo) return
    addItem({ id, titulo, precio, modalidad, imagen: imgSrc, slug })
    onCartOpen?.()
  }

  return (
    <Link to={`/cursos/${slug}`} className="course-card group no-underline">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/9] bg-[var(--bg-light)]">
        <img
          src={imgSrc}
          alt={titulo}
          loading="lazy"
          decoding="async"
          onError={e => { e.currentTarget.src = COURSE_PLACEHOLDER }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {a?.franquicia_sence && (
          <span className="absolute top-3 right-3 tag font-bold" style={{ background:'#fff', color:'var(--primary)', border:'1.5px solid var(--accent)' }}>SENCE</span>
        )}
        {!activo && (
          <span className="absolute top-3 left-3 tag font-bold bg-gray-900/80 text-white border-white/20">
            No disponible
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {categoria && (
          <span className="tag mb-2 self-start">
            {categoria}
          </span>
        )}

        <div className="flex items-center gap-2 mb-2 text-xs text-[var(--text-muted)]">
          <span className="material-icons text-sm">{MODALIDAD_ICON[modalidad] || 'school'}</span>
          {modalidad}
          {horas && (
            <>
              <span className="opacity-40">•</span>
              <span className="material-icons text-sm">schedule</span>
              {horas}h
            </>
          )}
        </div>

        <h3 className="font-bold text-[var(--text-dark)] leading-tight mb-3 flex-1 line-clamp-2">
          {titulo}
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto pt-3 border-t border-[var(--border)]">
          <div className="text-center sm:text-left">
            <p className="text-xs text-[var(--text-muted)]">Precio</p>
            <p className="font-black text-[var(--primary)] text-lg">{fmtPrice(precio)}</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!activo || added}
            className={`flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all w-full sm:w-auto ${
              !activo
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
            }`}>
            <span className="material-icons text-sm">{!activo ? 'block' : added ? 'check' : 'add_shopping_cart'}</span>
            {!activo ? 'No disponible' : added ? 'Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </Link>
  )
}
