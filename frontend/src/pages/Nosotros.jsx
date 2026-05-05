import { Link } from 'react-router-dom'
import SectionLabel from '../components/ui/SectionLabel'

const VALORES = [
  { icon:'verified',  title:'Calidad',       desc:'Procesos certificados y mejora continua en cada programa formativo.' },
  { icon:'handshake', title:'Compromiso',     desc:'Con nuestros alumnos, empresas y el desarrollo de la región.' },
  { icon:'groups',    title:'Comunidad',      desc:'Construimos redes entre profesionales y empresas del sector.' },
  { icon:'lightbulb', title:'Innovación',     desc:'Metodologías actualizadas y plataformas e-learning modernas.' },
  { icon:'gavel',     title:'Ética',          desc:'Transparencia y honestidad en cada interacción.' },
  { icon:'bolt',      title:'Excelencia',     desc:'Nos exigimos el más alto estándar en docencia y servicio.' },
]

const MODALIDADES = [
  { icon:'place',    title:'Presencial',       desc:'Clases en nuestras instalaciones con instructores expertos.' },
  { icon:'computer', title:'E-Learning',       desc:'100% online, a tu ritmo, con plataforma interactiva.' },
  { icon:'sync_alt', title:'Blended',          desc:'Combinación de clases presenciales y contenido online.' },
  { icon:'business', title:'In Company',       desc:'Formación en las instalaciones de tu empresa, personalizada.' },
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
            Centro de Capacitación y Entrenamiento con más de 15 años formando profesionales en la Región de Coquimbo.
          </p>
        </div>
      </section>

      {/* Misión / Visión */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl border-2 border-[var(--primary)] bg-[var(--primary)]/5" data-reveal="left">
              <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center mb-5">
                <span className="material-icons text-white">flag</span>
              </div>
              <h2 className="text-2xl font-black text-[var(--primary)] mb-3">Nuestra Misión</h2>
              <p className="text-[var(--text-body)] leading-relaxed">
                Desarrollar competencias laborales y profesionales en personas y organizaciones, a través de programas de capacitación de alta calidad, contribuyendo al crecimiento económico y social de la Región de Coquimbo y el país.
              </p>
            </div>
            <div className="p-8 rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent)]/5" data-reveal="right">
              <div className="w-12 h-12 bg-[var(--accent)] rounded-xl flex items-center justify-center mb-5">
                <span className="material-icons text-[var(--primary-dark)]">visibility</span>
              </div>
              <h2 className="text-2xl font-black text-[var(--primary-dark)] mb-3">Nuestra Visión</h2>
              <p className="text-[var(--text-body)] leading-relaxed">
                Ser el centro de capacitación de referencia en la Región de Coquimbo, reconocido por la excelencia de sus programas, la calidad de sus instructores y el impacto positivo en el desarrollo profesional de la comunidad.
              </p>
            </div>
          </div>

          {/* About content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div data-reveal="left">
              <SectionLabel>Nuestra historia</SectionLabel>
              <h2 className="text-3xl font-black text-[var(--text-dark)] mb-4">
                Más de 15 años formando al Chile que trabaja
              </h2>
              <p className="text-[var(--text-body)] leading-relaxed mb-4">
                CETMED nació en Coquimbo con la convicción de que la capacitación de calidad debe estar al alcance de todos. Comenzamos con un pequeño equipo y hoy somos un OTEC certificado por SENCE con presencia en toda la región.
              </p>
              <p className="text-[var(--text-body)] leading-relaxed mb-6">
                Hemos capacitado a más de 2.800 profesionales en áreas críticas como Prevención de Riesgos, Construcción, Salud Ocupacional, Electricidad y Administración. Nuestros programas están diseñados junto a la industria para garantizar relevancia y aplicabilidad inmediata.
              </p>
              <div className="flex flex-wrap gap-3">
                {['OTEC SENCE','Norma NCh 2728','Cámara Chilena de la Construcción'].map(c => (
                  <span key={c} className="tag text-sm px-3 py-1">{c}</span>
                ))}
              </div>
            </div>
            <div data-reveal="right">
              <img src="https://placehold.co/580x420/1a5fa8/ffffff?text=CETMED+Coquimbo"
                alt="CETMED instalaciones" className="rounded-2xl w-full shadow-lift" />
            </div>
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
          <p className="text-white/70 mb-6">Diseñamos programas a medida para empresas e instituciones.</p>
          <Link to="/contacto" className="btn-primary text-base px-8 py-3">
            Hablar con un asesor
            <span className="material-icons text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>
    </>
  )
}
