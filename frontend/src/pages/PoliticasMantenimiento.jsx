import SectionLabel from '../components/ui/SectionLabel'

export default function PoliticasMantenimiento() {
  return (
    <>
      {/* Page hero */}
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 text-center text-white relative z-10">
          <SectionLabel>
            <span className="text-white/70">Legal</span>
          </SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-black mt-2">Políticas de Mantenimiento</h1>
          <p className="text-white/70 mt-3 max-w-xl mx-auto">
            Política de mantenimiento del sitio web CETMED.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-[var(--bg-light)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-lift border border-[var(--border)]">
            <div className="prose max-w-none text-[var(--text-body)] space-y-8">
              <p className="leading-relaxed">
                OTEC A&amp;S Capacitaciones SpA se reserva el derecho a realizar mantenimientos de su sitio web www.cetmed.cl, pudiendo efectuar intervenciones parciales o generales cuando lo estime necesario, con el objetivo de mejorar la seguridad y el rendimiento de la plataforma.
              </p>
              <p className="leading-relaxed">
                Asimismo, nuestra empresa se compromete a informar oportunamente a todos nuestros Clientes, Usuarios y demás Partes Interesadas sobre cualquier actualización a gran escala que pueda afectar el funcionamiento normal del sitio, impidiendo el acceso a la plataforma o a los enlaces establecidos.
              </p>
              <p className="leading-relaxed">
                Excepto en casos clasificados como “Fortuitos” o de “Fuerza Mayor” que, por su naturaleza, impidan la notificación previa, se realizará un aviso con un mínimo de 48 horas de anticipación a la actualización.
              </p>
              <p className="leading-relaxed">
                Para dar cumplimiento a esta obligación, OTEC A&amp;S Capacitaciones SpA se compromete a no considerar el tiempo destinado a la actualización o mejora del sitio web como parte del tiempo efectivo de acceso a los Cursos o servicios educativos en ejecución o activos en la plataforma. En tales situaciones, la empresa se obliga a compensar el tiempo afectado de acuerdo con lo establecido en el Reglamento Interno para los Servicios de Capacitación.
              </p>
              <div className="pt-6 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
                <p>Última actualización: 5 de junio de 2026</p>
                <p className="mt-1">
                  Para dudas, reclamos o consultas, contáctanos a: <strong>contacto@cetmed.cl</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
