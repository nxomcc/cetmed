import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getCursos, getNoticias } from '../services/api'
import CourseCard from '../components/ui/CourseCard'
import BlogCard from '../components/ui/BlogCard'
import SectionLabel from '../components/ui/SectionLabel'
import useCart from '../hooks/useCart'

/* ── Mock data fallback (when CMS offline) ────────── */
const MOCK_CURSOS = [
  { id:1, attributes:{ titulo:'Prevención de Riesgos en Obra', precio:120000, modalidad:'Presencial', horas:40, slug:'prevencion-riesgos-obra', franquicia_sence:true, imagen:{data:null} } },
  { id:2, attributes:{ titulo:'Primeros Auxilios Empresarial', precio:85000, modalidad:'Blended', horas:16, slug:'primeros-auxilios', franquicia_sence:true, imagen:{data:null} } },
  { id:3, attributes:{ titulo:'Seguridad en Instalaciones Eléctricas', precio:95000, modalidad:'Presencial', horas:32, slug:'seguridad-electrica', imagen:{data:null} } },
  { id:4, attributes:{ titulo:'Liderazgo y Gestión de Equipos', precio:110000, modalidad:'E-Learning', horas:24, slug:'liderazgo-gestion', imagen:{data:null} } },
  { id:5, attributes:{ titulo:'Excel Avanzado para Gestión', precio:75000, modalidad:'E-Learning', horas:20, slug:'excel-avanzado', imagen:{data:null} } },
  { id:6, attributes:{ titulo:'Manejo Defensivo de Vehículos', precio:88000, modalidad:'Presencial', horas:16, slug:'manejo-defensivo', franquicia_sence:true, imagen:{data:null} } },
]

const MOCK_NOTICIAS = [
  { id:1, attributes:{ titulo:'CETMED renueva certificación SENCE para 2025', resumen:'Nuestro centro supera con éxito el proceso de renovación...', slug:'renovacion-sence-2025', publishedAt:'2025-04-01', imagen:{data:null} } },
  { id:2, attributes:{ titulo:'Nueva oferta de cursos E-Learning disponible', resumen:'Ampliamos nuestra plataforma virtual con 12 nuevos cursos...', slug:'nuevos-cursos-elearning', publishedAt:'2025-03-20', imagen:{data:null} } },
  { id:3, attributes:{ titulo:'Alianza estratégica con constructoras regionales', resumen:'Firmamos convenio con las principales empresas del sector...', slug:'alianza-constructoras', publishedAt:'2025-03-05', imagen:{data:null} } },
]

const STATS = [
  { icon:'school',    value:'2.800+', label:'Profesionales capacitados' },
  { icon:'menu_book', value:'120+',   label:'Cursos disponibles' },
  { icon:'verified',  value:'15+',    label:'Años de experiencia' },
  { icon:'star',      value:'98%',    label:'Satisfacción de alumnos' },
]

const AREAS = [
  { icon:'construction',    label:'Construcción y Obras',   color:'#003d7a' },
  { icon:'health_and_safety', label:'Prevención de Riesgos', color:'#1a5fa8' },
  { icon:'local_hospital',  label:'Salud Ocupacional',      color:'#0077b6' },
  { icon:'bolt',            label:'Electricidad y Energía', color:'#F0A500' },
  { icon:'eco',             label:'Medio Ambiente',         color:'#2d8a4e' },
  { icon:'manage_accounts', label:'Administración',         color:'#6c3d9e' },
  { icon:'engineering',     label:'Obras Civiles',          color:'#c0392b' },
  { icon:'directions_car',  label:'Manejo Defensivo',       color:'#e67e22' },
  { icon:'wifi',            label:'Tecnología e IT',        color:'#2980b9' },
  { icon:'groups',          label:'Desarrollo Personal',    color:'#16a085' },
]

function useCountUp(target, active) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    const num = parseInt(target.replace(/\D/g,'')) || 0
    const step = Math.ceil(num / 60)
    let cur = 0
    const id = setInterval(() => {
      cur = Math.min(cur + step, num)
      setVal(cur)
      if (cur >= num) clearInterval(id)
    }, 20)
    return () => clearInterval(id)
  }, [active, target])
  const suffix = target.replace(/[\d,]/g,'')
  return `${val.toLocaleString('es-CL')}${suffix}`
}

function StatItem({ icon, value, label, active }) {
  const display = useCountUp(value, active)
  return (
    <div className="stat-item">
      <span className="material-icons text-4xl text-[var(--accent)] mb-1 block">{icon}</span>
      <div className="text-3xl font-black text-white mb-1">{display}</div>
      <div className="text-white/70 text-sm">{label}</div>
    </div>
  )
}

export default function Home() {
  const [cursos, setCursos]   = useState(MOCK_CURSOS)
  const [noticias, setNoticias] = useState(MOCK_NOTICIAS)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)
  const { addItem } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    getCursos({'pagination[pageSize]':6}).then(d => { if (d?.data?.length) setCursos(d.data) }).catch(()=>{})
    getNoticias({'pagination[pageSize]':3}).then(d => { if (d?.data?.length) setNoticias(d.data) }).catch(()=>{})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  function openCart() {
    // Dispatch custom event so Layout's CartDrawer opens
    window.dispatchEvent(new CustomEvent('cetmed:opencart'))
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────── */}
      <section className="hero">
        <div className="max-w-7xl mx-auto px-4 py-24 relative z-10 w-full">
          <div className="max-w-2xl">
            <div className="section-label text-white/80 mb-4" data-reveal>
              OTEC Certificado SENCE · Coquimbo, Chile
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6" data-reveal data-delay="1">
              Capacitación profesional que{' '}
              <span className="text-[var(--accent)]">transforma</span> carreras
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl" data-reveal data-delay="2">
              Más de 120 cursos certificados en Prevención de Riesgos, Construcción, Salud y más. Aprende con los mejores, a tu ritmo.
            </p>
            <div className="flex flex-wrap gap-3" data-reveal data-delay="3">
              <Link to="/cursos" className="btn-primary text-base px-6 py-3">
                <span className="material-icons">school</span>
                Ver todos los cursos
              </Link>
              <Link to="/contacto" className="btn-outline text-base px-6 py-3">
                <span className="material-icons">chat</span>
                Hablar con un asesor
              </Link>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-3 mt-10" data-reveal data-delay="4">
              {['✓ Certificado SENCE','✓ Franquicia tributaria','✓ Clases presenciales y online'].map(t => (
                <span key={t} className="bg-white/10 backdrop-blur text-white/90 text-sm px-3 py-1.5 rounded-full border border-white/20">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5 -mr-32 hidden lg:block" />
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-white/5 hidden lg:block" />
      </section>

      {/* ── Stats strip ───────────────────────────── */}
      <section className="stats-strip" ref={statsRef}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS.map(s => <StatItem key={s.label} {...s} active={statsVisible} />)}
          </div>
        </div>
      </section>

      {/* ── Areas ─────────────────────────────────── */}
      <section className="py-20 bg-[var(--bg-light)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12" data-reveal>
            <SectionLabel>Áreas de formación</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)]">
              Especialidades que impulsan tu carrera
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {AREAS.map((a, i) => (
              <Link key={a.label} to={`/cursos?area=${encodeURIComponent(a.label)}`}
                className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-[var(--border)] hover:border-transparent hover:shadow-lift hover:-translate-y-1 transition-all text-center no-underline"
                data-reveal data-delay={String(i % 5 + 1)}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${a.color}18` }}>
                  <span className="material-icons" style={{ color: a.color }}>{a.icon}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-dark)] leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ──────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12" data-reveal>
            <div>
              <SectionLabel>Cursos destacados</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)]">
                Los más elegidos por nuestros alumnos
              </h2>
            </div>
            <Link to="/cursos" className="btn-ghost shrink-0">
              Ver todos
              <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursos.slice(0,6).map((c,i) => (
              <div key={c.id} data-reveal data-delay={String(i%3+1)}>
                <CourseCard curso={c} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why CETMED ────────────────────────────── */}
      <section className="py-20 bg-[var(--bg-light)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-reveal="left">
              <SectionLabel>Por qué elegirnos</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)] mb-6">
                Capacitación con propósito real
              </h2>
              <p className="text-[var(--text-body)] leading-relaxed mb-8">
                Somos un OTEC certificado por SENCE con más de 15 años formando a los profesionales que mueven la economía regional. Cada curso está diseñado con la industria, para la industria.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon:'verified', title:'Certificación SENCE', desc:'Cursos con franquicia tributaria disponible' },
                  { icon:'people',   title:'Instructores expertos', desc:'Profesionales activos en cada área' },
                  { icon:'schedule', title:'Horarios flexibles', desc:'Tarde, noche y fin de semana' },
                  { icon:'workspace_premium', title:'Certificados válidos', desc:'Reconocidos a nivel nacional' },
                ].map(f => (
                  <div key={f.title} className="flex gap-3 p-4 bg-white rounded-xl border border-[var(--border)]">
                    <span className="material-icons text-[var(--primary)] mt-0.5">{f.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--text-dark)]">{f.title}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/nosotros" className="btn-primary">
                Conoce más sobre CETMED
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>

            <div data-reveal="right" className="relative">
              <img src="https://placehold.co/580x440/003d7a/ffffff?text=CETMED+en+acción"
                alt="Capacitación CETMED" className="rounded-2xl w-full shadow-hero" />
              <div className="absolute -bottom-5 -left-5 bg-[var(--accent)] text-[var(--primary-dark)] rounded-2xl p-5 font-black shadow-lift hidden sm:block">
                <div className="text-3xl">+2.800</div>
                <div className="text-sm font-semibold">alumnos capacitados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest news ───────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12" data-reveal>
            <div>
              <SectionLabel>Está pasando</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)]">
                Últimas noticias
              </h2>
            </div>
            <Link to="/noticias" className="btn-ghost shrink-0">
              Ver todas
              <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.slice(0,3).map((n,i) => (
              <div key={n.id} data-reveal data-delay={String(i+1)}>
                <BlogCard noticia={n} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────── */}
      <section className="py-20 bg-[var(--primary)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4" data-reveal>
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="text-white/80 text-lg mb-8" data-reveal data-delay="1">
            Inscríbete hoy y accede a franquicia SENCE. Nuestros asesores te orientan sin costo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center" data-reveal data-delay="2">
            <Link to="/cursos" className="btn-primary text-base px-8 py-3">
              <span className="material-icons">school</span>
              Ver catálogo de cursos
            </Link>
            <Link to="/contacto" className="btn-outline text-base px-8 py-3">
              <span className="material-icons">support_agent</span>
              Contactar asesor
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
