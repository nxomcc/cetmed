import { Link } from 'react-router-dom'

const LOGO_URL = '/images/brand/logo-web.png'

const LINKS = [
  { to: '/',         label: 'Inicio' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/cursos',   label: 'Cursos' },
  { to: '/noticias', label: 'Noticias' },
  { to: '/contacto', label: 'Contacto' },
]

const AREAS = [
  'Administración',
  'Alimentación, Gastronomía y Turismo',
  'Ciencias y Técnicas Aplicadas',
  'Computación e Informática',
  'Construcción',
  'Electricidad y Electrónica',
  'Mecánica Industrial',
  'Minería',
  'Procesos Industriales',
  'Salud Nutrición y Dietética',
  'Servicio a las Personas',
]

const SOCIAL = [
  { label:'Facebook',  icon:'facebook',  href:'https://www.facebook.com/profile.php?id=61574988417670' },
  { label:'Instagram', icon:'instagram', href:'https://www.instagram.com/cetmed_capacitaciones/' },
  { label:'YouTube',   icon:'youtube',   href:'https://www.youtube.com/@CetMedCapacitaciones' },
  { label:'X',         icon:'x',         href:'https://x.com/Cetmed_Cap' },
]

function SocialIcon({ icon }) {
  const className = 'w-[18px] h-[18px]'
  if (icon === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (icon === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31.2 31.2 0 0 0 2 12a31.2 31.2 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 22 12a31.2 31.2 0 0 0-.4-4.8ZM10 15.3V8.7l5.7 3.3L10 15.3Z" />
      </svg>
    )
  }
  if (icon === 'x') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.9 2h3.3l-7.2 8.2L23.5 22h-6.7l-5.2-6.8L5.6 22H2.3l7.7-8.8L1.8 2h6.8l4.7 6.2L18.9 2Zm-1.2 17.9h1.8L7.6 4H5.7l12 15.9Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M14 8.5V6.4c0-.8.2-1.2 1.2-1.2H17V2.1c-.9-.1-1.8-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6v1.9H7v3.5h2.8V22H14V12h2.8l.5-3.5H14Z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[var(--primary-dark)] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={LOGO_URL} alt="CETMED" loading="lazy" decoding="async" className="h-10 w-auto brightness-0 invert" />
              <span className="font-black text-xl tracking-tight">CETMED</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Somos un OTEC que ejecuta Capacitación y Formación complementaria dirigido a Personas Naturales, Trabajadores, Profesionales, Empresas Públicas o Privadas, con el más alto Nivel de Calidad posible según la Norma Chilena 2728:2015, SENCE y demás requisitos Legales aplicables.
            </p>
            <div className="flex gap-2">
              {SOCIAL.map(sn => (
                <a key={sn.label} href={sn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--accent)] hover:text-[var(--primary-dark)] flex items-center justify-center transition-all"
                  aria-label={sn.label}>
                  <SocialIcon icon={sn.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase text-white/40 mb-4">Navegación</h4>
            <ul className="space-y-2">
              {LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-white/70 hover:text-[var(--accent)] text-sm transition-colors flex items-center gap-1.5">
                    <span className="material-icons text-xs">chevron_right</span>{label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase text-white/40 mb-4">Áreas formativas</h4>
            <ul className="space-y-2">
              {AREAS.map(a => (
                <li key={a}>
                  <Link to="/cursos" className="text-white/70 hover:text-[var(--accent)] text-sm transition-colors flex items-center gap-1.5">
                    <span className="material-icons text-xs">chevron_right</span>{a}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm tracking-widest uppercase text-white/40 mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="material-icons text-[var(--accent)] mt-0.5 text-base">location_on</span>
                Av. Videla 810 – Oficina 208-209, Edificio Verne, Coquimbo, Chile
              </li>
              <li className="flex items-center gap-2">
                <span className="material-icons text-[var(--accent)] text-base">phone</span>
                <a href="tel:+56927781966" className="hover:text-white transition-colors">+56 9 2778 1966</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-icons text-[var(--accent)] text-base">email</span>
                <a href="mailto:contacto@cetmed.cl" className="hover:text-white transition-colors">contacto@cetmed.cl</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-[var(--accent)] text-base">access_time</span>
                <span>Lun–Jue 09:00–13:30<br />Vie 09:00–13:00</span>
              </li>
            </ul>

            {/* Certification logos */}
            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <img src="/images/certifications/logo-sence-blanco.png"
                  loading="lazy" decoding="async"
                  alt="SENCE" className="h-8 w-auto object-contain" />
                <img src="/images/certifications/certificacion-nch2-pequeno.webp"
                  loading="lazy" decoding="async"
                  alt="NCh 2728" className="h-8 w-auto object-contain" />
              </div>
              <img src="/images/certifications/banderas.png"
                loading="lazy" decoding="async"
                alt="Certificaciones internacionales" className="h-6 w-auto object-contain" />
              <img src="/images/payments/3-cuotas-precio-contado.png"
                loading="lazy" decoding="async"
                alt="3 cuotas precio contado" className="h-10 w-auto object-contain" />
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/40">
          <p>© {new Date().getFullYear()} CETMED Capacitaciones. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link to="/terminos-y-condiciones" className="hover:text-white/70 transition-colors">Términos y Condiciones</Link>
            <Link to="/politica-de-privacidad" className="hover:text-white/70 transition-colors">Política de Privacidad</Link>
            <Link to="/politicas-de-mantenimiento" className="hover:text-white/70 transition-colors">Políticas de Mantenimiento</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
