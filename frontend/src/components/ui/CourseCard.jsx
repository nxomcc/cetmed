import { Link } from 'react-router-dom'
import useCart from '../../hooks/useCart'

function fmt(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

const PLACEHOLDER = 'https://placehold.co/400x240/003d7a/ffffff?text=CETMED'

const MODALIDAD_ICON = {
  Presencial: 'place',
  'E-Learning': 'computer',
  'Blended': 'sync_alt',
}

export default function CourseCard({ curso, onCartOpen }) {
  const { addItem, inCart } = useCart()
  const { id, attributes: a } = curso
  const slug    = a?.slug || id
  const titulo  = a?.titulo || 'Curso'
  const precio  = a?.precio ?? 0
  const horas   = a?.horas
  const modalidad = a?.modalidad || 'Presencial'
  const categoria = a?.categoria?.data?.attributes?.nombre
  const imgData = a?.imagen?.data
  const imgSrc  = imgData?.attributes?.url
    ? (imgData.attributes.url.startsWith('http') ? imgData.attributes.url : `http://localhost:1337${imgData.attributes.url}`)
    : PLACEHOLDER

  const added = inCart(id)

  function handleAdd(e) {
    e.preventDefault()
    addItem({ id, titulo, precio, modalidad, imagen: imgSrc, slug })
    onCartOpen?.()
  }

  return (
    <Link to={`/cursos/${slug}`} className="course-card group no-underline">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img src={imgSrc} alt={titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {categoria && (
          <span className="absolute top-3 left-3 tag bg-[var(--accent)] text-[var(--primary-dark)] font-bold">
            {categoria}
          </span>
        )}
        {a?.franquicia_sence && (
          <span className="absolute top-3 right-3 tag bg-[var(--accent)] text-[var(--primary-dark)] font-bold">SENCE</span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
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

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Precio</p>
            <p className="font-black text-[var(--primary)] text-lg">{fmt(precio)}</p>
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
              added
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
            }`}>
            <span className="material-icons text-sm">{added ? 'check' : 'add_shopping_cart'}</span>
            {added ? 'Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </Link>
  )
}
