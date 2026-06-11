import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getCursos, getNoticias } from '../services/api'
import CourseCard from '../components/ui/CourseCard'
import BlogCard from '../components/ui/BlogCard'
import SectionLabel from '../components/ui/SectionLabel'
import useCart from '../hooks/useCart'

/* ── Mock data fallback (when CMS offline) ────────── */
const MOCK_CURSOS = [
  { id:1, attributes:{ titulo:'Técnicas de trabajo seguro en espacios confinados', precio:0, modalidad:'E-Learning asincrónico', horas:16, slug:'tecnicas-de-trabajo-seguro-en-espacios-confinados', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'/images/courses/trabajo-seguro-espacios-confinados.jpg' } } } } },
  { id:2, attributes:{ titulo:'Técnicas de seguridad en el montaje y desmontaje de andamios', precio:0, modalidad:'E-Learning asincrónico', horas:16, slug:'tecnicas-de-seguridad-en-el-montaje-y-desmontaje-de-andamios', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'/images/courses/seguridad-andamios.jpg' } } } } },
  { id:3, attributes:{ titulo:'Gestor de inclusión laboral', precio:0, modalidad:'E-Learning asincrónico', horas:40, slug:'gestor-de-inclusion-laboral', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'/images/courses/gestor-inclusion-laboral.jpg' } } } } },
  { id:4, attributes:{ titulo:'Técnicas de primeros auxilios básicos RCP Y DEA', precio:0, modalidad:'E-Learning asincrónico', horas:36, slug:'tecnicas-de-primeros-auxilios-basicos-rcp-y-dea', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'/images/courses/primeros-auxilios-rcp-dea.jpg' } } } } },
  { id:5, attributes:{ titulo:'Manejo de extintores portátiles', precio:0, modalidad:'E-Learning asincrónico', horas:8, slug:'manejo-de-extintores-portatiles', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'/images/courses/manejo-extintores.jpg' } } } } },
  { id:6, attributes:{ titulo:'Manejo de sustancias peligrosas', precio:0, modalidad:'E-Learning asincrónico', horas:16, slug:'manejo-de-sustancias-peligrosas', franquicia_sence:true, imagen:{ data:null } } },
  { id:7, attributes:{ titulo:'Procedimientos para trabajo en altura física', precio:0, modalidad:'E-Learning asincrónico', horas:16, slug:'procedimientos-para-trabajo-en-altura-fisica', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'/images/courses/trabajo-en-altura.jpg' } } } } },
  { id:8, attributes:{ titulo:'Aislamiento y bloqueo (LOTO)', precio:0, modalidad:'E-Learning asincrónico', horas:16, slug:'aislamiento-y-bloqueo-loto', franquicia_sence:true, imagen:{ data:null } } },
]

const HOME_COURSE_SLUGS = [
  'tecnicas-de-trabajo-seguro-en-espacios-confinados',
  'tecnicas-de-seguridad-en-el-montaje-y-desmontaje-de-andamios',
  'gestor-de-inclusion-laboral',
  'tecnicas-de-primeros-auxilios-basicos-rcp-y-dea',
  'manejo-de-extintores-portatiles',
  'manejo-de-sustancias-peligrosas',
  'procedimientos-para-trabajo-en-altura-fisica',
  'aislamiento-y-bloqueo-loto',
]

const HOME_SENCE_SLUGS = new Set(HOME_COURSE_SLUGS)

function withHomeSenceTag(course) {
  if (!course?.attributes?.slug || !HOME_SENCE_SLUGS.has(course.attributes.slug)) return course
  return {
    ...course,
    attributes: {
      ...course.attributes,
      franquicia_sence: true,
    },
  }
}

function sortHomeCourses(data) {
  const bySlug = new Map((data || []).map(c => [c.attributes?.slug, c]))
  const featured = HOME_COURSE_SLUGS.map(slug => bySlug.get(slug)).filter(Boolean).map(withHomeSenceTag)
  if (featured.length) return featured
  return (data || []).map(withHomeSenceTag)
}

const MOCK_NOTICIAS = [
  { id:1, attributes:{ titulo:'CETMED renueva certificación SENCE para 2025', resumen:'Nuestro centro supera con éxito el proceso de renovación anual de la certificación SENCE, reafirmando nuestro compromiso con la calidad formativa.', slug:'renovacion-sence-2025', publishedAt:'2025-04-01', imagen:{data:null} } },
  { id:2, attributes:{ titulo:'Nueva oferta de cursos E-Learning disponible', resumen:'Ampliamos nuestra plataforma virtual con nuevos cursos en modalidad online para que puedas capacitarte desde donde estés.', slug:'nuevos-cursos-elearning', publishedAt:'2025-03-20', imagen:{data:null} } },
  { id:3, attributes:{ titulo:'Alianza estratégica con empresas de la región', resumen:'Firmamos convenio con las principales empresas del sector productivo de Coquimbo para ofrecer capacitación con franquicia SENCE.', slug:'alianza-empresas-region', publishedAt:'2025-03-05', imagen:{data:null} } },
]

const STATS = [
  { icon:'school',    value:'+500', label:'Profesionales capacitados' },
  { icon:'menu_book', value:'+50',  label:'Cursos disponibles' },
  { icon:'verified',  value:'+3',   label:'Años de experiencia' },
  { icon:'star',      value:'98%',    label:'Satisfacción de alumnos' },
]

const AREAS = [
  { label:'Administración',                  img:'/images/areas/administracion.webp', category: 'Servicio a las Personas' },
  { label:'Alimentación, Gastronomía y Turismo', img:'/images/areas/alimentacion-gastronomia-turismo.avif', category: 'Servicio a las Personas' },
  { label:'Artes, Artesanías y Gráficas',    img:'/images/areas/artes-artesanias-graficas.jpg', category: 'Ciencias y Técnicas Aplicadas' },
  { label:'Ciencias y Técnicas Aplicadas',   img:'/images/areas/ciencias-tecnicas-aplicadas.jpg', category: 'Ciencias y Técnicas Aplicadas' },
  { label:'Computación e Informática',       img:'/images/areas/computacion-informatica.webp', category: 'Computación e Informática' },
  { label:'Construcción',                    img:'/images/areas/construccion.avif', category: 'Construcción' },
  { label:'Ecología',                        img:'/images/areas/ecologia.avif', category: 'Ciencias y Técnicas Aplicadas' },
  { label:'Educación y Capacitación',        img:'/images/areas/educacion-capacitacion.avif', category: 'Servicio a las Personas' },
  { label:'Electricidad y Electrónica',      img:'/images/areas/electricidad-electronica.avif', category: 'Electricidad y Electrónica' },
  { label:'Idiomas y Comunicación',          img:'/images/areas/idiomas-comunicacion.jpg', category: 'Servicio a las Personas' },
  { label:'Mecánica Industrial',             img:'/images/areas/mecanica-industrial.avif', category: 'Procesos Industriales' },
  { label:'Minería',                         img:'/images/areas/mineria.avif', category: 'Construcción' },
  { label:'Procesos Industriales',           img:'/images/areas/procesos-industriales.jpg', category: 'Procesos Industriales' },
  { label:'Salud Nutrición y Dietética',     img:'/images/areas/salud-nutricion-dietetica.avif', category: 'Salud' },
  { label:'Servicio a las Personas',         img:'/images/areas/servicio-personas.avif', category: 'Servicio a las Personas' },
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
  const [, prefix = '', suffix = ''] = target.match(/^(\D*)[\d.,]+(\D*)$/) || []
  return `${prefix}${val.toLocaleString('es-CL')}${suffix}`
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

  useEffect(() => {
    getCursos({'pagination[pageSize]':100}).then(d => {
      if (d?.data?.length) {
        setCursos(sortHomeCourses(d.data))
      }
    }).catch(()=>{})
    getNoticias({'pagination[pageSize]':3}).then(d => { if (d?.data?.length) setNoticias(d.data) }).catch(()=>{})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* ── Hero + Stats: juntos forman 100vh ─────── */}
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 96px)' }}>
      <section className="hero">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative z-10 w-full">
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="section-label text-white mb-4 justify-center lg:justify-start" data-reveal>
              OTEC Certificado SENCE · Coquimbo, Chile
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6" data-reveal data-delay="1">
              Bienvenido a CETMED Capacitaciones
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl" data-reveal data-delay="2">
              Cursos diseñados para llevar tu perfil al siguiente nivel.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center lg:justify-start gap-3" data-reveal data-delay="3">
              <Link to="/cursos" className="btn-primary text-base px-6 py-3 justify-center">
                <span className="material-icons">school</span>
                Ver todos los cursos
              </Link>
              <Link to="/contacto" className="btn-outline text-base px-6 py-3 justify-center">
                <span className="material-icons">chat</span>
                Hablar con un asesor
              </Link>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-10" data-reveal data-delay="4">
              {['✓ Certificado SENCE','✓ Clases presenciales y online'].map(t => (
                <span key={t} className="bg-white/10 backdrop-blur text-white/90 text-sm px-3 py-1.5 rounded-full border border-white/20">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────── */}
      <section className="stats-strip" ref={statsRef}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS.map(s => <StatItem key={s.label} {...s} active={statsVisible} />)}
          </div>
        </div>
      </section>
      </div>{/* end hero+stats 100vh wrapper */}
 
      {/* ── Featured Courses ──────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 mb-12 text-center sm:text-left" data-reveal>
            <div>
              <SectionLabel>Cursos destacados</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)]">
                Los más elegidos por nuestros alumnos
              </h2>
            </div>
            <Link to="/cursos" className="btn-ghost shrink-0 justify-center">
              Ver todos
              <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cursos.slice(0,8).map((c,i) => (
              <div key={c.id} className="h-full">
                <CourseCard curso={c} />
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* ── About CETMED ──────────────────────────── */}
      <section className="py-20 bg-[var(--bg-light)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-reveal="left" className="text-center lg:text-left">
              <SectionLabel>Quiénes somos</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)] mb-6">
                CETMED Capacitaciones
              </h2>
              <p className="text-[var(--text-body)] leading-relaxed mb-6 text-lg">
                Somos un OTEC que ejecuta Capacitación y Formación complementaria dirigido a Personas Naturales, Trabajadores, Profesionales, Empresas Públicas o Privadas, con el más alto Nivel de Calidad posible según la Norma Chilena 2728:2015, SENCE y demás requisitos Legales aplicables.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                {['OTEC SENCE','Norma NCh 2728'].map(c => (
                  <span key={c} className="tag text-sm px-3 py-1">{c}</span>
                ))}
              </div>
              <Link to="/nosotros" className="btn-primary justify-center">
                Conoce más sobre CETMED
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>
 
            <div data-reveal="right" className="relative max-w-xl mx-auto lg:max-w-none">
              <img
                src="/images/about/portafolio-servicios-capacitacion.png"
                alt="CETMED Portafolio de Servicios"
                loading="lazy"
                decoding="async"
                className="rounded-2xl w-full shadow-hero object-cover"
              />
              <div className="absolute -bottom-5 -left-5 bg-[var(--accent)] text-[var(--primary-dark)] rounded-2xl p-5 min-w-[184px] text-center font-black shadow-lift hidden sm:block">
                <div className="text-3xl">+500</div>
                <div className="text-sm font-semibold">alumnos capacitados</div>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* ── Specialization Areas ──────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12" data-reveal>
            <SectionLabel>Áreas de formación</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)]">
              Especialidades que impulsan tu carrera
            </h2>
          </div>
 
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {AREAS.map((a, i) => (
              <Link key={a.label} to={`/cursos?categoria=${encodeURIComponent(a.category)}`}
                className="group relative rounded-2xl overflow-hidden aspect-square shadow hover:shadow-lift transition-all hover:-translate-y-1 no-underline"
                data-reveal data-delay={String(i % 5 + 1)}>
                <img
                  src={a.img}
                  alt={a.label}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-0 left-0 right-0 p-3 text-white text-xs font-bold leading-tight text-center">
                  {a.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── DNC Section ───────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-reveal="left" className="text-center lg:text-left">
              <SectionLabel>Servicio especializado</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)] mb-6">
                Diagnóstico de Necesidades de Capacitación (DNC)
              </h2>
              <p className="text-[var(--text-body)] leading-relaxed mb-8 text-lg">
                El servicio de Diagnóstico de Necesidades de Capacitación (DNC) es un proceso que identifica las áreas de conocimiento, habilidades y actitudes que los empleados necesitan mejorar para optimizar su desempeño y el de la empresa, permitiendo una capacitación más efectiva.
              </p>
              <Link to="/contacto" className="btn-primary justify-center">
                Solicitar DNC
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-reveal="right">
              {[
                { icon:'search', title:'Diagnóstico', desc:'Identificamos las brechas de conocimiento de tu equipo.' },
                { icon:'analytics', title:'Análisis', desc:'Evaluamos competencias actuales frente a las requeridas.' },
                { icon:'assignment', title:'Plan a medida', desc:'Diseñamos un plan de capacitación personalizado.' },
                { icon:'verified', title:'Resultados', desc:'Optimizamos el desempeño y la productividad organizacional.' },
              ].map((f,i) => (
                <div key={f.title} className="p-5 bg-[var(--bg-light)] rounded-2xl border border-[var(--border)]" data-delay={String(i+1)}>
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3">
                    <span className="material-icons text-[var(--primary)]">{f.icon}</span>
                  </div>
                  <h4 className="font-bold text-[var(--text-dark)] mb-1">{f.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest news ───────────────────────────── */}
      <section className="py-20 bg-[var(--bg-light)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 mb-12 text-center sm:text-left" data-reveal>
            <div>
              <SectionLabel>Está pasando</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)]">
                Últimas noticias
              </h2>
            </div>
            <Link to="/noticias" className="btn-ghost shrink-0 justify-center">
              Ver todas
              <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.slice(0,3).map((n,i) => (
              <div key={n.id} className="h-full">
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
