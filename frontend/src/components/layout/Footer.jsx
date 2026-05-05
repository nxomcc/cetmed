import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'

const LINKS = [
  { to: '/',         label: 'Inicio' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/cursos',   label: 'Cursos' },
  { to: '/noticias', label: 'Noticias' },
  { to: '/contacto', label: 'Contacto' },
]

const AREAS = [
  'Prevención de Riesgos',
  'Construcción y Obras',
  'Salud Ocupacional',
  'Administración',
  'Medio Ambiente',
  'Electricidad y Energía',
]

export default function Footer() {
  return (
    <footer className="bg-[var(--primary-dark)] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="CETMED" className="h-10 w-auto brightness-0 invert"
                onError={e => e.target.style.display = 'none'} />
              <span className="font-black text-xl tracking-tight">CETMED</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Centro de capacitación certificado SENCE. Formamos profesionales competentes para los desafíos del mercado laboral chileno.
            </p>
            <div className="flex gap-2">
              {['facebook', 'linkedin', 'instagram', 'youtube'].map(sn => (
                <a key={sn} href="#"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--accent)] hover:text-[var(--primary-dark)] flex items-center justify-center transition-all"
                  aria-label={sn}>
                  <span className="material-icons text-[18px]">
                    {sn === 'facebook' ? 'facebook' : sn === 'linkedin' ? 'work' : sn === 'instagram' ? 'photo_camera' : 'play_circle'}
                  </span>
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
                Coquimbo, Región de Coquimbo, Chile
              </li>
              <li className="flex items-center gap-2">
                <span className="material-icons text-[var(--accent)] text-base">phone</span>
                <a href="tel:+56512200000" className="hover:text-white transition-colors">+56 51 220 0000</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-icons text-[var(--accent)] text-base">email</span>
                <a href="mailto:contacto@cetmed.cl" className="hover:text-white transition-colors">contacto@cetmed.cl</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-icons text-[var(--accent)] text-base">access_time</span>
                Lun–Vie 09:00–18:00
              </li>
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              {['OTEC SENCE', 'NCh 2728', 'Cámara CC'].map(cert => (
                <span key={cert} className="tag bg-white/10 text-white/80 border border-white/20 text-xs px-2 py-0.5 rounded-full">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/40">
          <p>© {new Date().getFullYear()} CETMED Capacitaciones. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-white/70 transition-colors">Términos</Link>
            <Link to="#" className="hover:text-white/70 transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
