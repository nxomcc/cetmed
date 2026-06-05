import SectionLabel from '../components/ui/SectionLabel'

export default function Terminos() {
  return (
    <>
      {/* Page hero */}
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 text-center text-white relative z-10">
          <SectionLabel>
            <span className="text-white/70">Legal</span>
          </SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-black mt-2">Términos y Condiciones</h1>
          <p className="text-white/70 mt-3 max-w-xl mx-auto">
            Normativas que regulan el uso de nuestro sitio web y los servicios de capacitación.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-[var(--bg-light)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-lift border border-[var(--border)]">
            <div className="prose max-w-none text-[var(--text-body)] space-y-8">
              
              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">1. Aspectos Generales</h2>
                <p className="leading-relaxed">
                  Los presentes Términos y Condiciones regulan el acceso, navegación y uso del sitio web 
                  <strong> www.cetmed.cl</strong>, de propiedad de <strong>OTEC A&S Capacitaciones SpA</strong>. 
                  Al acceder o utilizar esta plataforma, el usuario acepta de manera expresa y sin reservas 
                  todas las disposiciones legales aquí descritas.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">2. Propiedad Intelectual</h2>
                <p className="leading-relaxed">
                  Todo el material y contenido disponible en este sitio, incluyendo pero no limitado a: 
                  textos, logotipos, gráficos, imágenes, audios, videos, diseños, código fuente y software, 
                  están protegidos por las leyes de Propiedad Intelectual e Industrial nacionales e internacionales. 
                  Queda estrictamente prohibida la reproducción, distribución, modificación o comunicación pública 
                  del contenido sin la autorización previa y por escrito de <strong>OTEC A&S Capacitaciones SpA</strong>.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">3. Acceso y Uso de la Plataforma</h2>
                <p className="leading-relaxed mb-4">
                  El usuario se compromete a hacer un uso diligente, correcto y lícito de la plataforma, absteniéndose de:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Utilizar el sitio para fines ilegales o lesivos a los derechos de terceros o de la institución.</li>
                  <li>Introducir virus, troyanos o cualquier otro programa malicioso que altere el funcionamiento del servidor.</li>
                  <li>Suplantar la identidad de otros usuarios o asesores de capacitación.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">4. Políticas de Mantenimiento y Disponibilidad</h2>
                <p className="leading-relaxed mb-4">
                  <strong>OTEC A&S Capacitaciones SpA</strong> se reserva el derecho de interrumpir temporalmente el acceso 
                  al sitio para realizar tareas de actualización técnica, mejoras en el servidor o mantenimiento preventivo.
                </p>
                <p className="leading-relaxed mb-4">
                  En casos de mantenimiento programado a gran escala que pudiera afectar el acceso a cursos activos, 
                  la empresa se compromete a:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Informar a los alumnos con al menos 48 horas de anticipación, salvo caso fortuito o de fuerza mayor.</li>
                  <li>Asegurar que los tiempos de inactividad técnica no se consideren parte del tiempo efectivo de acceso a los cursos, 
                  compensando a los usuarios según lo establecido en el Reglamento Interno de CETMED.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">5. Limitación de Responsabilidad</h2>
                <p className="leading-relaxed">
                  Aunque trabajamos constantemente para asegurar que la información y servicios en el sitio sean correctos y actualizados, 
                  no garantizamos la total ausencia de errores técnicos, omisiones involuntarias o cortes inesperados del servidor ajenos a 
                  nuestro control directo.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">6. Legislación Aplicable y Jurisdicción</h2>
                <p className="leading-relaxed">
                  Estos términos se rigen íntegramente por las leyes de la República de Chile. Cualquier controversia derivada 
                  del uso del sitio o sus servicios será sometida a la jurisdicción de los tribunales competentes de la comuna de 
                  Coquimbo, Chile.
                </p>
              </div>

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
