import { Link } from 'react-router-dom'

const LOGO_URL = 'https://cetmed.cl/wp-content/uploads/2025/02/Logo-web.png'

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
  { label:'Facebook',  icon:'facebook',     href:'#' },
  { label:'Instagram', icon:'photo_camera', href:'#' },
  { label:'YouTube',   icon:'play_circle',  href:'#' },
  { label:'X',         icon:'close',        href:'#' },
]

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
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--accent)] hover:text-[var(--primary-dark)] flex items-center justify-center transition-all"
                  aria-label={sn.label}>
                  <span className="material-icons text-[18px]">{sn.icon}</span>
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
                <img src="https://cetmed.cl/wp-content/uploads/2025/02/Logo_Sence_Blanco.png"
                  loading="lazy" decoding="async"
                  alt="SENCE" className="h-8 w-auto object-contain" />
                <img src="https://cetmed.cl/wp-content/uploads/2025/02/certificacion_nch2-pequeno.png.webp"
                  loading="lazy" decoding="async"
                  alt="NCh 2728" className="h-8 w-auto object-contain" />
              </div>
              <img src="https://cetmed.cl/wp-content/uploads/2025/02/banderas.png"
                loading="lazy" decoding="async"
                alt="Certificaciones internacionales" className="h-6 w-auto object-contain" />
              <img src="https://cetmed.cl/wp-content/uploads/2025/10/3-cuotas-precio-contado-1.png"
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
