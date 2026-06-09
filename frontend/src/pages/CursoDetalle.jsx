import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCurso, registerCursoView } from '../services/api'
import useCart from '../hooks/useCart'
import SectionLabel from '../components/ui/SectionLabel'

function fmt(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

export default function CursoDetalle() {
  const { slug } = useParams()
  const [curso, setCurso]   = useState(null)
  const [loading, setLoading] = useState(true)
  const { addItem, inCart } = useCart()

  useEffect(() => {
    setLoading(true)
    getCurso(slug)
      .then(d => { setCurso(d || null); if (d?.id) registerCursoView(d.id) })
      .catch(() => setCurso(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <span className="material-icons animate-spin text-4xl text-[var(--primary)]">refresh</span>
    </div>
  )

  if (!curso) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Curso no encontrado</h2>
      <Link to="/cursos" className="btn-primary">Ver todos los cursos</Link>
    </div>
  )

  const { id, attributes: a } = curso
  const imgSrc = a?.imagen?.data?.attributes?.url
    ? (a.imagen.data.attributes.url.startsWith('http') || a.imagen.data.attributes.url.startsWith('/') ? a.imagen.data.attributes.url : `http://localhost:1337${a.imagen.data.attributes.url}`)
    : `https://placehold.co/800x400/003d7a/ffffff?text=${encodeURIComponent(a.titulo)}`

  const added = inCart(id)
  const activo = a.activo !== false

  function handleAdd() {
    if (!activo) return
    addItem({ id, titulo: a.titulo, precio: a.precio, modalidad: a.modalidad, imagen: imgSrc, slug })
  }

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span className="material-icons text-xs">chevron_right</span>
            <Link to="/cursos" className="hover:text-white transition-colors">Cursos</Link>
            <span className="material-icons text-xs">chevron_right</span>
            <span className="text-white">{a.titulo}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {a.categoria?.data && (
              <span className="tag bg-white/20 text-white">{a.categoria.data.attributes.nombre}</span>
            )}
            {a.franquicia_sence && (
              <span className="tag bg-[var(--accent)] text-[var(--primary-dark)]">SENCE</span>
            )}
            {!activo && (
              <span className="tag bg-white/20 text-white">No disponible</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white max-w-2xl">{a.titulo}</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              <img src={imgSrc} alt={a.titulo} loading="eager" decoding="async" className="w-full rounded-2xl shadow-lift aspect-video object-cover" />

              {/* Descripción */}
              <div>
                <SectionLabel>Descripción del curso</SectionLabel>
                <p className="text-[var(--text-body)] leading-relaxed mt-2">{a.descripcion}</p>
              </div>

              {/* Objetivo */}
              {a.objetivo && (
                <div className="p-6 bg-[var(--bg-light)] rounded-2xl border border-[var(--border)]">
                  <h3 className="font-bold text-[var(--primary)] mb-2 flex items-center gap-2">
                    <span className="material-icons text-lg">flag</span>
                    Objetivo del curso
                  </h3>
                  <p className="text-[var(--text-body)] leading-relaxed">{a.objetivo}</p>
                </div>
              )}

              {/* Contenidos */}
              {a.contenidos?.length > 0 && (
                <div>
                  <h3 className="font-bold text-[var(--text-dark)] mb-4 flex items-center gap-2">
                    <span className="material-icons text-[var(--accent)]">menu_book</span>
                    Contenidos del programa
                  </h3>
                  <ul className="space-y-2">
                    {a.contenidos.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-[var(--text-body)]">
                        <span className="material-icons text-[var(--primary)] text-sm mt-0.5 shrink-0">check_circle</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              {/* Price card */}
              <div className="bg-white rounded-2xl border-2 border-[var(--primary)] p-6 sticky top-20">
                <p className="text-sm text-[var(--text-muted)] mb-1">Precio del curso</p>
                <p className="text-4xl font-black text-[var(--primary)] mb-1">{fmt(a.precio)}</p>
                {a.franquicia_sence && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mb-5">
                    <span className="material-icons text-sm">verified</span>
                    Aplica franquicia tributaria SENCE
                  </p>
                )}

                <button onClick={handleAdd} disabled={!activo || added}
                  className={`w-full flex items-center justify-center gap-2 text-base font-bold py-3 px-6 rounded-lg transition-all mb-3 ${
                    !activo
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : added
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-[var(--accent)] text-[var(--primary-dark)] hover:bg-[var(--accent-dark)] hover:-translate-y-0.5 shadow hover:shadow-lg'
                  }`}>
                  <span className="material-icons">{!activo ? 'block' : added ? 'check' : 'add_shopping_cart'}</span>
                  {!activo ? 'No disponible para compra' : added ? 'En tu carrito' : 'Agregar al carrito'}
                </button>

                {activo && added && (
                  <Link to="/checkout" className="btn-primary w-full justify-center mb-3">
                    Ir al checkout
                    <span className="material-icons text-sm">arrow_forward</span>
                  </Link>
                )}

                <Link to="/contacto" className="btn-ghost w-full justify-center text-sm">
                  <span className="material-icons text-sm">support_agent</span>
                  Consultar disponibilidad
                </Link>

                {/* Details list */}
                <div className="mt-5 pt-5 border-t border-[var(--border)] space-y-3 text-sm">
                  {[
                    { icon:'schedule',    label:'Duración',   value: a.horas ? `${a.horas} horas` : '—' },
                    { icon:'place',       label:'Modalidad',  value: a.modalidad || '—' },
                    { icon:'verified',    label:'Certificado',value: 'Sí, incluido' },
                    { icon:'groups',      label:'Nivel',      value: a.nivel || 'Básico-Intermedio' },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <span className="material-icons text-sm">{d.icon}</span>
                        {d.label}
                      </span>
                      <span className="font-semibold text-[var(--text-dark)]">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact card */}
              <div className="bg-[var(--bg-light)] rounded-2xl p-5 text-sm">
                <h4 className="font-bold text-[var(--text-dark)] mb-2">¿Tienes dudas?</h4>
                <p className="text-[var(--text-muted)] mb-3">Nuestros asesores te orientan sin costo.</p>
                <a href="tel:+56512200000" className="flex items-center gap-2 text-[var(--primary)] font-semibold hover:underline">
                  <span className="material-icons text-sm">phone</span>
                  +56 51 220 0000
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
