import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getNoticia } from '../services/api'

const MOCK = {
  id: 1,
  attributes: {
    titulo: 'CETMED renueva certificación SENCE para 2025',
    resumen: 'Nuestro centro supera con éxito el proceso de renovación de la acreditación SENCE.',
    contenido: 'CETMED ha superado satisfactoriamente el proceso de renovación de su acreditación como Organismo Técnico de Capacitación (OTEC) ante el Servicio Nacional de Capacitación y Empleo (SENCE), confirmando su estatus certificado para el periodo 2025-2026.\n\nEsta renovación, que involucra una exhaustiva evaluación de la calidad de nuestros programas, infraestructura y cuerpo docente, nos posiciona como uno de los centros de capacitación más confiables de la Región de Coquimbo.\n\nLa acreditación SENCE permite a nuestros alumnos y empresas clientes acceder a la franquicia tributaria, reduciendo significativamente el costo de la capacitación. Este beneficio es especialmente relevante para las PYMES de la región que buscan mejorar las competencias de sus trabajadores sin afectar su presupuesto operativo.',
    publishedAt: '2025-04-01',
    imagen: { data: null },
    autor: { data: { attributes: { nombre: 'Equipo CETMED' } } },
  }
}

function fmtDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function NoticiaDetalle() {
  const { slug } = useParams()
  const [noticia, setNoticia] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getNoticia(slug)
      .then(d => setNoticia(d || MOCK))
      .catch(() => setNoticia(MOCK))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <span className="material-icons animate-spin text-4xl text-[var(--primary)]">refresh</span>
    </div>
  )

  if (!noticia) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Noticia no encontrada</h2>
      <Link to="/noticias" className="btn-primary">Ver todas las noticias</Link>
    </div>
  )

  const { attributes: a } = noticia
  const imgSrc = a?.imagen?.data?.attributes?.url
    ? (a.imagen.data.attributes.url.startsWith('http') ? a.imagen.data.attributes.url : `http://localhost:1337${a.imagen.data.attributes.url}`)
    : `https://placehold.co/1200x500/003d7a/ffffff?text=${encodeURIComponent(a.titulo)}`

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span className="material-icons text-xs">chevron_right</span>
            <Link to="/noticias" className="hover:text-white transition-colors">Noticias</Link>
            <span className="material-icons text-xs">chevron_right</span>
            <span className="text-white truncate max-w-[200px]">{a.titulo}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{a.titulo}</h1>
          <div className="flex items-center gap-4 mt-4 text-white/60 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="material-icons text-sm">calendar_today</span>
              {fmtDate(a.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-icons text-sm">person</span>
              {a.autor?.data?.attributes?.nombre || 'CETMED'}
            </span>
          </div>
        </div>
      </section>

      <article className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <img src={imgSrc} alt={a.titulo}
            className="w-full rounded-2xl shadow-lift aspect-video object-cover mb-10" />

          {a.resumen && (
            <p className="text-lg font-medium text-[var(--text-dark)] leading-relaxed border-l-4 border-[var(--accent)] pl-5 mb-8">
              {a.resumen}
            </p>
          )}

          {a.contenido && (
            <div className="prose prose-lg max-w-none text-[var(--text-body)] leading-relaxed space-y-4">
              {a.contenido.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-4">
            <Link to="/noticias" className="btn-ghost">
              <span className="material-icons text-sm">arrow_back</span>
              Volver a noticias
            </Link>
            <Link to="/cursos" className="btn-primary">
              Ver cursos disponibles
              <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
