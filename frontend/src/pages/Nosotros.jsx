import { Link } from 'react-router-dom'
import SectionLabel from '../components/ui/SectionLabel'

const MODALIDADES = [
  { icon:'place',    title:'Presencial',  desc:'Interacción directa entre instructor y participantes en las instalaciones de CETMED o del cliente.' },
  { icon:'computer', title:'E-Learning',  desc:'Formación vía internet con contenido multimedia: texto, audio, video e imágenes, en modalidad sincrónica.' },
  { icon:'sync_alt', title:'B-Learning',  desc:'Modalidad híbrida que combina sesiones presenciales con recursos digitales para mayor flexibilidad.' },
  { icon:'business', title:'A Distancia', desc:'Aprendizaje autodirigido mediante materiales escritos y digitales, sin presencia directa del instructor.' },
]

const VALORES = [
  { icon:'verified',  title:'Calidad',       desc:'Procesos certificados y mejora continua en cada programa formativo según NCh 2728:2015.' },
  { icon:'handshake', title:'Compromiso',     desc:'Con nuestros alumnos, empresas y el desarrollo de la región de Coquimbo.' },
  { icon:'groups',    title:'Comunidad',      desc:'Construimos redes entre profesionales y empresas del sector productivo.' },
  { icon:'lightbulb', title:'Innovación',     desc:'Metodologías actualizadas y plataformas e-learning modernas.' },
  { icon:'gavel',     title:'Ética',          desc:'Transparencia y honestidad en cada interacción con nuestros usuarios.' },
  { icon:'bolt',      title:'Excelencia',     desc:'Nos exigimos el más alto estándar en docencia y servicio.' },
]

export default function Nosotros() {
  return (
    <>
      {/* Page hero */}
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 text-center text-white relative z-10">
          <SectionLabel>
            <span className="text-white/70">Quiénes somos</span>
          </SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-black mt-2">Sobre CETMED</h1>
          <p className="text-white/70 mt-3 max-w-xl mx-auto">
            Centro de Capacitación y Formación complementaria certificado por SENCE en la Región de Coquimbo.
          </p>
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div data-reveal="left">
              <SectionLabel>Nuestra identidad</SectionLabel>
              <h2 className="text-3xl font-black text-[var(--text-dark)] mb-4">
                CETMED Capacitaciones
              </h2>
              <p className="text-[var(--text-body)] leading-relaxed mb-6 text-lg">
                Somos un OTEC que ejecuta Capacitación y Formación complementaria dirigido a Personas Naturales, Trabajadores, Profesionales, Empresas Públicas o Privadas, con el más alto Nivel de Calidad posible según la Norma Chilena 2728:2015, SENCE y demás requisitos Legales aplicables.
              </p>
              <div className="flex flex-wrap gap-3">
                {['OTEC SENCE','Norma NCh 2728:2015'].map(c => (
                  <span key={c} className="tag text-sm px-3 py-1">{c}</span>
                ))}
              </div>
            </div>
            <div data-reveal="right">
              <img
                src="https://cetmed.cl/wp-content/uploads/2025/12/PORTAFOLIO-DE-SERVICIOS-DE-CAPACITACION2.png"
                alt="CETMED Portafolio de Servicios"
                className="rounded-2xl w-full shadow-lift"
              />
            </div>
          </div>

          {/* Certificaciones */}
          <div className="grid sm:grid-cols-3 gap-5 mb-20">
            {[
              { img:'https://cetmed.cl/wp-content/uploads/2025/02/Logo_Sence_Blanco.png',   bg:'bg-[var(--primary)]',      label:'SENCE',                             desc:'Organismo Técnico de Capacitación certificado por el Servicio Nacional de Capacitación y Empleo.' },
              { img:'https://cetmed.cl/wp-content/uploads/2025/02/certificacion_nch2-pequeno.png.webp', bg:'bg-white border border-[var(--border)]', label:'NCh 2728:2015', desc:'Certificados bajo la Norma Chilena de Calidad para Organismos Técnicos de Capacitación.' },
              { img:'https://cetmed.cl/wp-content/uploads/2025/02/banderas.png',             bg:'bg-white border border-[var(--border)]', label:'Internacional',         desc:'Certificaciones con validez y reconocimiento a nivel nacional e internacional.' },
            ].map((c, i) => (
              <div key={i} className={`p-6 rounded-2xl ${c.bg} flex flex-col items-center text-center gap-3`} data-reveal data-delay={String(i+1)}>
                <img src={c.img} alt={c.label} className="h-12 w-auto object-contain" />
                <div>
                  <h4 className="font-bold text-sm mb-1" style={{ color: c.bg.includes('primary') ? 'white' : 'var(--text-dark)' }}>{c.label}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: c.bg.includes('primary') ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Modalidades */}
          <div className="mb-20">
            <div className="text-center mb-10" data-reveal>
              <SectionLabel>Cómo aprendemos</SectionLabel>
              <h2 className="text-3xl font-black text-[var(--text-dark)]">Modalidades de capacitación</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {MODALIDADES.map((m,i) => (
                <div key={m.title}
                  className="p-6 bg-white rounded-2xl border border-[var(--border)] hover:shadow-lift hover:-translate-y-1 transition-all text-center"
                  data-reveal data-delay={String(i+1)}>
                  <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons text-[var(--primary)] text-2xl">{m.icon}</span>
                  </div>
                  <h3 className="font-bold text-[var(--text-dark)] mb-2">{m.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Valores */}
          <div>
            <div className="text-center mb-10" data-reveal>
              <SectionLabel>Lo que nos guía</SectionLabel>
              <h2 className="text-3xl font-black text-[var(--text-dark)]">Nuestros valores</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {VALORES.map((v,i) => (
                <div key={v.title}
                  className="flex gap-4 p-5 bg-[var(--bg-light)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors"
                  data-reveal data-delay={String(i%3+1)}>
                  <span className="material-icons text-[var(--accent)] text-2xl mt-0.5 shrink-0">{v.icon}</span>
                  <div>
                    <h3 className="font-bold text-[var(--text-dark)] mb-1">{v.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[var(--primary)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">¿Quieres capacitar a tu equipo?</h2>
          <p className="text-white/70 mb-6">Diseñamos programas a medida para empresas e instituciones. Con franquicia SENCE disponible.</p>
          <Link to="/contacto" className="btn-primary text-base px-8 py-3">
            Hablar con un asesor
            <span className="material-icons text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>
    </>
  )
}
