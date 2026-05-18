import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getCursos, getNoticias } from '../services/api'
import CourseCard from '../components/ui/CourseCard'
import BlogCard from '../components/ui/BlogCard'
import SectionLabel from '../components/ui/SectionLabel'
import useCart from '../hooks/useCart'

/* ── Mock data fallback (when CMS offline) ────────── */
const MOCK_CURSOS = [
  { id:1, attributes:{ titulo:'Técnicas de primeros auxilios básicos RCP Y DEA', precio:0, modalidad:'E-Learning', horas:16, slug:'primeros-auxilios-rcp-dea', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'https://cetmed.cl/wp-content/uploads/2026/02/auxilio-1-300x200.jpg' } } } } },
  { id:2, attributes:{ titulo:'Gestor de inclusión laboral', precio:0, modalidad:'Presencial', horas:40, slug:'gestor-inclusion-laboral', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'https://cetmed.cl/wp-content/uploads/2026/02/inclusion-300x188.jpg' } } } } },
  { id:3, attributes:{ titulo:'Técnicas de trabajo seguro en espacios confinados', precio:0, modalidad:'E-Learning', horas:16, slug:'trabajo-seguro-espacios-confinados', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'https://cetmed.cl/wp-content/uploads/2026/02/trabajo-seguro-300x188.jpg' } } } } },
  { id:4, attributes:{ titulo:'Técnicas de seguridad en el montaje y desmontaje de andamios', precio:0, modalidad:'E-Learning', horas:16, slug:'seguridad-andamios', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'https://cetmed.cl/wp-content/uploads/2026/02/andamioss-300x188.jpg' } } } } },
  { id:5, attributes:{ titulo:'Manejo de extintores portátiles', precio:0, modalidad:'E-Learning', horas:8, slug:'manejo-extintores', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'https://cetmed.cl/wp-content/uploads/2026/02/extintores2-300x188.jpg' } } } } },
  { id:6, attributes:{ titulo:'Procedimientos para trabajo en altura física', precio:0, modalidad:'Presencial', horas:16, slug:'trabajo-en-altura', franquicia_sence:true, imagen:{ data:{ attributes:{ url:'https://cetmed.cl/wp-content/uploads/2026/02/trabajo-en-altura-300x200.jpg' } } } } },
]

const MOCK_NOTICIAS = [
  { id:1, attributes:{ titulo:'CETMED renueva certificación SENCE para 2025', resumen:'Nuestro centro supera con éxito el proceso de renovación anual de la certificación SENCE, reafirmando nuestro compromiso con la calidad formativa.', slug:'renovacion-sence-2025', publishedAt:'2025-04-01', imagen:{data:null} } },
  { id:2, attributes:{ titulo:'Nueva oferta de cursos E-Learning disponible', resumen:'Ampliamos nuestra plataforma virtual con nuevos cursos en modalidad online para que puedas capacitarte desde donde estés.', slug:'nuevos-cursos-elearning', publishedAt:'2025-03-20', imagen:{data:null} } },
  { id:3, attributes:{ titulo:'Alianza estratégica con empresas de la región', resumen:'Firmamos convenio con las principales empresas del sector productivo de Coquimbo para ofrecer capacitación con franquicia SENCE.', slug:'alianza-empresas-region', publishedAt:'2025-03-05', imagen:{data:null} } },
]

const STATS = [
  { icon:'school',    value:'2.800+', label:'Profesionales capacitados' },
  { icon:'menu_book', value:'120+',   label:'Cursos disponibles' },
  { icon:'verified',  value:'15+',    label:'Años de experiencia' },
  { icon:'star',      value:'98%',    label:'Satisfacción de alumnos' },
]

const AREAS = [
  { label:'Administración',                  img:'https://cetmed.cl/wp-content/themes/wpopus-fse/assets/images/service3.webp' },
  { label:'Alimentación, Gastronomía y Turismo', img:'https://cetmed.cl/wp-content/uploads/2025/03/grupo-cocineros-trabajando-cocina_53876-42734.jpg.avif' },
  { label:'Artes, Artesanías y Gráficas',    img:'https://cetmed.cl/wp-content/uploads/2025/03/arreglo-dibujo-marcadores_23-2148577709.jpg' },
  { label:'Ciencias y Técnicas Aplicadas',   img:'https://cetmed.cl/wp-content/uploads/2025/03/examinando-modelo-molecular_1098-19572.jpg' },
  { label:'Computación e Informática',       img:'https://cetmed.cl/wp-content/themes/wpopus-fse/assets/images/service4.webp' },
  { label:'Construcción',                    img:'https://cetmed.cl/wp-content/uploads/2025/03/trabajadores-examinando-obra_1122-970.jpg.avif' },
  { label:'Ecología',                        img:'https://cetmed.cl/wp-content/uploads/2025/03/fotografia-aerea-espeso-bosque-hermosos-arboles-vegetacion_181624-2812.jpg.avif' },
  { label:'Educación y Capacitación',        img:'https://cetmed.cl/wp-content/uploads/2025/03/todos-sonrien-escuchan-grupo-personas-conferencia-negocios-aula-moderna-dia_146671-16288.jpg.avif' },
  { label:'Electricidad y Electrónica',      img:'https://cetmed.cl/wp-content/uploads/2025/03/sirva-tecnico-electrico-que-trabaja-centralita-fusibles_169016-24062.jpg.avif' },
  { label:'Idiomas y Comunicación',          img:'https://cetmed.cl/wp-content/uploads/2025/03/libro-ingles-descansando-sobre-mesa-espacio-trabajo_23-2149429592.jpg' },
  { label:'Mecánica Industrial',             img:'https://cetmed.cl/wp-content/uploads/2025/03/trabajador-industrial-que-trabaja-linea-produccion-fabrica_342744-177.jpg.avif' },
  { label:'Minería',                         img:'https://cetmed.cl/wp-content/uploads/2025/03/camion-volquete-mina-cielo_181624-60225.jpg.avif' },
  { label:'Procesos Industriales',           img:'https://cetmed.cl/wp-content/uploads/2025/03/tecnologo-traje-proteccion-blanco-comprobando-presion-manometro-maquina-industrial-fabrica_342744-1194.jpg' },
  { label:'Salud Nutrición y Dietética',     img:'https://cetmed.cl/wp-content/uploads/2025/03/concepto-dieta-cientifica-comida-sana_23-2148193255.jpg.avif' },
  { label:'Servicio a las Personas',         img:'https://cetmed.cl/wp-content/uploads/2025/03/feliz-apreton-manos-reparador-automoviles-cliente-taller_637285-8634.jpg.avif' },
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

  useEffect(() => {
    getCursos({'pagination[pageSize]':6}).then(d => { if (d?.data?.length) setCursos(d.data) }).catch(()=>{})
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
      <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      <section className="hero">
        <div className="max-w-7xl mx-auto px-4 py-24 relative z-10 w-full">
          <div className="max-w-2xl">
            <div className="section-label text-white mb-4" data-reveal>
              OTEC Certificado SENCE · Coquimbo, Chile
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6" data-reveal data-delay="1">
              Bienvenido a CETMED Capacitaciones
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl" data-reveal data-delay="2">
              Cursos diseñados para llevar tu perfil al siguiente nivel.
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
              {['✓ Certificado SENCE','✓ Clases presenciales y online'].map(t => (
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
      </div>{/* end hero+stats 100vh wrapper */}

      {/* ── About CETMED ──────────────────────────── */}
      <section className="py-20 bg-[var(--bg-light)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-reveal="left">
              <SectionLabel>Quiénes somos</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)] mb-6">
                CETMED Capacitaciones
              </h2>
              <p className="text-[var(--text-body)] leading-relaxed mb-6 text-lg">
                Somos un OTEC que ejecuta Capacitación y Formación complementaria dirigido a Personas Naturales, Trabajadores, Profesionales, Empresas Públicas o Privadas, con el más alto Nivel de Calidad posible según la Norma Chilena 2728:2015, SENCE y demás requisitos Legales aplicables.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['OTEC SENCE','Norma NCh 2728','Cámara Chilena de la Construcción'].map(c => (
                  <span key={c} className="tag text-sm px-3 py-1">{c}</span>
                ))}
              </div>
              <Link to="/nosotros" className="btn-primary">
                Conoce más sobre CETMED
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>

            <div data-reveal="right" className="relative">
              <img
                src="https://cetmed.cl/wp-content/uploads/2025/12/PORTAFOLIO-DE-SERVICIOS-DE-CAPACITACION2.png"
                alt="CETMED Portafolio de Servicios"
                className="rounded-2xl w-full shadow-hero object-cover"
              />
              <div className="absolute -bottom-5 -left-5 bg-[var(--accent)] text-[var(--primary-dark)] rounded-2xl p-5 font-black shadow-lift hidden sm:block">
                <div className="text-3xl">+2.800</div>
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
              <Link key={a.label} to={`/cursos?area=${encodeURIComponent(a.label)}`}
                className="group relative rounded-2xl overflow-hidden aspect-square shadow hover:shadow-lift transition-all hover:-translate-y-1 no-underline"
                data-reveal data-delay={String(i % 5 + 1)}>
                <img
                  src={a.img}
                  alt={a.label}
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

      {/* ── Featured Courses ──────────────────────── */}
      <section className="py-20 bg-[var(--bg-light)]">
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

      {/* ── DNC Section ───────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-reveal="left">
              <SectionLabel>Servicio especializado</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-dark)] mb-6">
                Diagnóstico de Necesidades de Capacitación (DNC)
              </h2>
              <p className="text-[var(--text-body)] leading-relaxed mb-8 text-lg">
                El servicio de Diagnóstico de Necesidades de Capacitación (DNC) es un proceso que identifica las áreas de conocimiento, habilidades y actitudes que los empleados necesitan mejorar para optimizar su desempeño y el de la empresa, permitiendo una capacitación más efectiva.
              </p>
              <Link to="/contacto" className="btn-primary">
                Solicitar DNC
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4" data-reveal="right">
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
