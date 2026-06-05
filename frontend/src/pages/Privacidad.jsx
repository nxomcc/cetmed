import SectionLabel from '../components/ui/SectionLabel'

export default function Privacidad() {
  return (
    <>
      {/* Page hero */}
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 text-center text-white relative z-10">
          <SectionLabel>
            <span className="text-white/70">Privacidad</span>
          </SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-black mt-2">Política de Privacidad</h1>
          <p className="text-white/70 mt-3 max-w-xl mx-auto">
            Conoce cómo protegemos y tratamos los datos personales de nuestros alumnos y usuarios.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-[var(--bg-light)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-lift border border-[var(--border)]">
            <div className="prose max-w-none text-[var(--text-body)] space-y-8">
              
              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">1. Responsable del Tratamiento</h2>
                <p className="leading-relaxed">
                  El responsable del tratamiento de los datos personales recopilados en este sitio web es 
                  <strong> OTEC A&S Capacitaciones SpA</strong>, con domicilio legal en Av. Videla 810 – Oficina 208-209, 
                  Edificio Verne, Coquimbo, Chile. Nos comprometemos firmemente a garantizar la confidencialidad y 
                  seguridad de tu información de acuerdo con la legislación vigente.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">2. Datos Recopilados</h2>
                <p className="leading-relaxed mb-4">
                  Recopilamos únicamente la información necesaria para gestionar tu inscripción, facturación y contacto. 
                  Esto incluye:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Información de identificación:</strong> Nombre completo, RUT (requerido para registros oficiales SENCE).</li>
                  <li><strong>Datos de contacto:</strong> Correo electrónico, número de teléfono y dirección.</li>
                  <li><strong>Información de pago:</strong> Los datos de transacciones son procesados a través de pasarelas de pago seguras y nunca son almacenados en nuestros servidores.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">3. Finalidad del Tratamiento</h2>
                <p className="leading-relaxed mb-4">
                  Los datos recolectados se utilizan exclusivamente para los siguientes fines:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Procesar y gestionar la matrícula en los cursos solicitados.</li>
                  <li>Enviar credenciales de acceso a nuestras aulas y plataformas educativas.</li>
                  <li>Gestionar la facturación y cobranza del servicio.</li>
                  <li>Enviar avisos importantes sobre actualizaciones, mantenimiento técnico o información relevante del curso contratado.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">4. Destinatarios y Cesión de Datos</h2>
                <p className="leading-relaxed">
                  <strong>OTEC A&S Capacitaciones SpA</strong> no vende, arrienda, cede ni comparte tu información personal con terceros 
                  para fines comerciales. No obstante, para efectos del cumplimiento de las normativas de capacitación en Chile, ciertos datos 
                  pueden ser comunicados al <strong>Servicio Nacional de Capacitación y Empleo (SENCE)</strong> u otros organismos fiscalizadores 
                  del Estado según lo exija la ley.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">5. Derechos de los Usuarios (ARCO)</h2>
                <p className="leading-relaxed mb-4">
                  De conformidad con la Ley N° 19.628 sobre Protección de la Vida Privada de Chile, puedes ejercer tus derechos 
                  de acceso, rectificación, cancelación y oposición (derechos ARCO) sobre tus datos personales.
                </p>
                <p className="leading-relaxed">
                  Para ejercer estos derechos, simplemente envía una solicitud escrita indicando detalladamente tu requerimiento al correo electrónico 
                  <strong> contacto@cetmed.cl</strong>.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-4">6. Seguridad de la Información</h2>
                <p className="leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas adecuadas para proteger tus datos de cualquier pérdida, 
                  alteración, acceso o tratamiento no autorizado. Monitoreamos constantemente nuestros sistemas para prevenir incidentes y 
                  garantizar una navegación segura en nuestra web.
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--border)] text-sm text-[var(--text-muted)]">
                <p>Última actualización: 5 de junio de 2026</p>
                <p className="mt-1">
                  Si tienes alguna duda o inquietud respecto a nuestra política de privacidad, no dudes en escribirnos a <strong>contacto@cetmed.cl</strong>.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  )
}
