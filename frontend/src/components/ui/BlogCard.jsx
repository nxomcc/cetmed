import { Link } from 'react-router-dom'

const PLACEHOLDER = 'https://placehold.co/400x240/003d7a/ffffff?text=Noticia'

function fmtDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogCard({ noticia }) {
  const { id, attributes: a } = noticia
  const slug     = a?.slug || id
  const titulo   = a?.titulo || 'Noticia'
  const resumen  = a?.resumen || ''
  const fecha    = fmtDate(a?.publishedAt)
  const autor    = a?.autor?.data?.attributes?.nombre || 'CETMED'
  const imgData  = a?.imagen?.data
  const imgSrc   = imgData?.attributes?.url
    ? (imgData.attributes.url.startsWith('http') ? imgData.attributes.url : `http://localhost:1337${imgData.attributes.url}`)
    : PLACEHOLDER

  return (
    <Link to={`/noticias/${slug}`} className="course-card group no-underline">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img src={imgSrc} alt={titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
          <span className="material-icons text-sm">calendar_today</span>
          {fecha}
          <span className="opacity-40">•</span>
          <span className="material-icons text-sm">person</span>
          {autor}
        </div>

        <h3 className="font-bold text-[var(--text-dark)] leading-tight mb-2 line-clamp-2">{titulo}</h3>

        {resumen && (
          <p className="text-sm text-[var(--text-body)] line-clamp-3 leading-relaxed">{resumen}</p>
        )}

        <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-1 text-[var(--primary)] text-sm font-semibold">
          Leer más
          <span className="material-icons text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
        </div>
      </div>
    </Link>
  )
}
