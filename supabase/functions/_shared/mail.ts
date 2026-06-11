function escapeHtml(value: any) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatClp(value: any) {
  return Number(value || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })
}

function normalizeContents(value: any): string[] {
  if (!value) return []
  const source = typeof value === 'string'
    ? value.split('\n')
    : Array.isArray(value)
      ? value
      : [value]

  return source
    .flatMap((item: any) => {
      if (!item) return []
      if (typeof item === 'string') return item.split('\n')
      const title = item.modulo || item['módulo'] || item.titulo || item.title || item.nombre
      const rawItems = item.temas || item.contenidos || item.items || item.puntos || item.detalle
      const items = Array.isArray(rawItems) ? rawItems : String(rawItems || '').split('\n')
      return [title, ...items]
    })
    .map((item: any) => String(item || '').replace(/^[•*-]\s*/, '').replace(/^\d{1,2}\s*[.)-]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 12)
}

function renderCourseMeta(course: any) {
  const bits = [
    course.horas ? `Duración: ${escapeHtml(course.horas)} horas` : 'Duración: a coordinar',
    `Modalidad: ${escapeHtml(course.modalidad || 'A coordinar')}`,
    'Certificado: sí, incluido',
    `Nivel: ${escapeHtml(course.nivel || 'Básico-Intermedio')}`,
  ]
  return `<p style="margin:6px 0 10px;color:#4b5563;font-size:13px">${bits.join(' · ')}</p>`
}

function renderContents(course: any) {
  const contents = normalizeContents(course.contenidos)
  if (!contents.length) return ''
  return `
    <p style="margin:10px 0 6px;font-weight:700;color:#003d7a">Contenidos principales</p>
    <ul style="margin:0 0 0 18px;padding:0;color:#374151">
      ${contents.map(item => `<li style="margin:4px 0">${escapeHtml(item)}</li>`).join('')}
    </ul>
  `
}

function renderCourses(courses: any[]) {
  if (!courses.length) return ''
  return `
    <div style="display:grid;gap:14px;margin:12px 0">
      ${courses.map(course => `
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px;background:#ffffff">
          <p style="margin:0;font-size:16px;font-weight:700;color:#111827">${escapeHtml(course.title || course.titulo || '')}</p>
          ${renderCourseMeta(course)}
          ${renderContents(course)}
        </div>
      `).join('')}
    </div>
  `
}

export async function sendMail(to: string, subject: string, html: string) {
  const url = Deno.env.get('MAIL_WEBHOOK_URL')
  const token = Deno.env.get('MAIL_WEBHOOK_TOKEN')
  if (!url || !token) {
    console.warn('[MAIL] MAIL_WEBHOOK_URL or MAIL_WEBHOOK_TOKEN not configured')
    return { skipped: true }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Mail-Token': token,
    },
    body: JSON.stringify({ to, subject, html }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Mail webhook failed (${response.status}): ${text}`)
  }

  return { ok: true }
}

export async function sendLeadEmail(lead: any) {
  const internalTo = Deno.env.get('MAIL_INTERNAL_TO') || 'contacto@cetmed.cl'
  const subject = `Nuevo contacto web: ${lead.nombre || 'Sin nombre'}`
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
      <h2>Nuevo mensaje desde el formulario CETMED</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(lead.nombre || '')}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email || '')}</p>
      <p><strong>Telefono:</strong> ${escapeHtml(lead.telefono || '')}</p>
      <p><strong>RUT:</strong> ${escapeHtml(lead.rut || '')}</p>
      <p><strong>Empresa:</strong> ${escapeHtml(lead.empresa || '')}</p>
      <p><strong>Tipo:</strong> ${escapeHtml(lead.tipo || '')}</p>
      <p><strong>Area:</strong> ${escapeHtml(lead.area || '')}</p>
      <p><strong>Curso ID:</strong> ${escapeHtml(lead.curso_id || '')}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(lead.mensaje || '').replaceAll('\n', '<br>')}</p>
    </div>
  `

  return sendMail(internalTo, subject, html)
}

export async function sendEnrollmentEmails(order: any, enrollment: any, options: { source?: 'purchase' | 'manual' } = {}) {
  const moodleUrl = Deno.env.get('MOODLE_URL') || 'https://cursos.cetmed.cl'
  const internalTo = Deno.env.get('MAIL_INTERNAL_TO') || 'contacto@cetmed.cl'
  const isManual = options.source === 'manual'
  const enrolled = enrollment?.enrolled || []
  const coordinationCourses = enrollment?.coordinationCourses || []
  const hasMoodleAccess = enrolled.length > 0
  const hasCoordination = coordinationCourses.length > 0

  const accessBlock = hasMoodleAccess
    ? enrollment?.user?.tempPassword
      ? `
        <div style="border:1px solid #dbeafe;border-radius:10px;background:#eff6ff;padding:14px;margin:14px 0">
          <p style="margin:0 0 8px;font-weight:700;color:#003d7a">Acceso al aula virtual</p>
          <p style="margin:4px 0"><strong>URL:</strong> <a href="${escapeHtml(moodleUrl)}">${escapeHtml(moodleUrl)}</a></p>
          <p style="margin:4px 0"><strong>Usuario:</strong> ${escapeHtml(enrollment.user?.username || '')}</p>
          <p style="margin:4px 0"><strong>Contraseña temporal:</strong> ${escapeHtml(enrollment.user?.tempPassword || '')}</p>
          <p style="margin:8px 0 0;color:#4b5563">Te recomendamos cambiar tu contraseña al ingresar.</p>
        </div>
      `
      : `
        <div style="border:1px solid #dbeafe;border-radius:10px;background:#eff6ff;padding:14px;margin:14px 0">
          <p style="margin:0 0 8px;font-weight:700;color:#003d7a">Acceso al aula virtual</p>
          <p style="margin:4px 0"><strong>URL:</strong> <a href="${escapeHtml(moodleUrl)}">${escapeHtml(moodleUrl)}</a></p>
          <p style="margin:4px 0">Tu cuenta ya existía en Moodle. Ingresa con tus credenciales habituales.</p>
          <p style="margin:4px 0;color:#4b5563">Si no recuerdas tu contraseña, usa la opción de recuperación en Moodle.</p>
        </div>
      `
    : ''

  const coordinationBlock = hasCoordination
    ? `
      <div style="border:1px solid #fde68a;border-radius:10px;background:#fffbeb;padding:14px;margin:14px 0">
        <p style="margin:0 0 8px;font-weight:700;color:#92400e">Coordinación del curso</p>
        <p style="margin:0;color:#4b5563">Estos cursos no requieren usuario ni contraseña Moodle. Nuestro equipo te contactará a la brevedad para confirmar fecha, horarios, modalidad y próximos pasos.</p>
      </div>
      ${renderCourses(coordinationCourses)}
    `
    : ''

  const studentHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;max-width:680px;margin:0 auto">
      <div style="background:#003d7a;color:white;border-radius:12px 12px 0 0;padding:22px">
        <h2 style="margin:0">${isManual ? 'Tu matrícula CETMED fue registrada' : 'Tu inscripción CETMED está confirmada'}</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;padding:22px;background:#fff">
        <p>Hola ${escapeHtml(order.nombre_cliente || '')},</p>
        <p>${hasMoodleAccess ? 'Ya dejamos listo el acceso para los cursos que se realizan en aula virtual.' : 'Recibimos correctamente tu inscripción.'}</p>
        ${hasMoodleAccess ? renderCourses(enrolled) : ''}
        ${accessBlock}
        ${coordinationBlock}
        <p style="margin-top:18px">Ante cualquier duda, responde este correo o contáctanos en nuestros canales oficiales.</p>
        <p style="margin-bottom:0">Equipo CETMED</p>
      </div>
    </div>
  `

  const internalHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
      <h2>${isManual ? 'Nueva matrícula manual' : 'Nueva compra aprobada'}</h2>
      <p><strong>Pedido:</strong> #${order.id}</p>
      <p><strong>Cliente:</strong> ${escapeHtml(order.nombre_cliente || '')}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.email_cliente || '')}</p>
      <p><strong>Total:</strong> ${formatClp(order.total || 0)}</p>
      <p><strong>Cursos con acceso Moodle:</strong> ${enrolled.length}</p>
      ${renderCourses(enrolled)}
      <p><strong>Cursos a coordinar:</strong> ${coordinationCourses.length}</p>
      ${renderCourses(coordinationCourses)}
      <p><strong>Usuario Moodle creado:</strong> ${enrollment?.createdUser ? 'Sí' : 'No'}</p>
    </div>
  `

  const subject = hasMoodleAccess
    ? 'Acceso a tu curso CETMED'
    : 'Confirmación de inscripción CETMED'

  const results = []
  results.push(await sendMail(order.email_cliente, subject, studentHtml))
  results.push(await sendMail(internalTo, `${isManual ? 'Nueva matrícula manual' : 'Nueva compra aprobada'} #${order.id}`, internalHtml))
  return results
}
