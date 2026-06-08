function escapeHtml(value: string) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function sendMail(to: string, subject: string, html: string) {
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

export async function sendEnrollmentEmails(order: any, enrollment: any) {
  const moodleUrl = Deno.env.get('MOODLE_URL') || 'https://cursos.cetmed.cl'
  const internalTo = Deno.env.get('MAIL_INTERNAL_TO') || 'contacto@cetmed.cl'
  const enrolled = enrollment?.enrolled || []
  const courseList = enrolled.map((course: any) => `<li>${escapeHtml(course.title)} (Moodle #${course.moodleCourseId})</li>`).join('')

  const accessBlock = enrollment?.createdUser
    ? `
      <p><strong>Usuario:</strong> ${escapeHtml(enrollment.user?.username || '')}</p>
      <p><strong>Contrasena temporal:</strong> ${escapeHtml(enrollment.user?.tempPassword || '')}</p>
      <p>Te recomendamos cambiar tu contrasena al ingresar.</p>
    `
    : `
      <p>Tu cuenta ya existia en Moodle. Ingresa con tus credenciales habituales.</p>
      <p>Si no recuerdas tu contrasena, usa la opcion de recuperacion en Moodle.</p>
    `

  const studentHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
      <h2>Tu compra CETMED fue aprobada</h2>
      <p>Hola ${escapeHtml(order.nombre_cliente || '')},</p>
      <p>Ya tienes acceso a:</p>
      <ul>${courseList}</ul>
      <p><strong>Acceso Moodle:</strong> <a href="${escapeHtml(moodleUrl)}">${escapeHtml(moodleUrl)}</a></p>
      ${accessBlock}
      <p>Equipo CETMED</p>
    </div>
  `

  const internalHtml = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
      <h2>Nueva compra aprobada</h2>
      <p><strong>Pedido:</strong> #${order.id}</p>
      <p><strong>Cliente:</strong> ${escapeHtml(order.nombre_cliente || '')}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.email_cliente || '')}</p>
      <p><strong>Total:</strong> ${Number(order.total || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}</p>
      <p><strong>Cursos:</strong></p>
      <ul>${courseList}</ul>
      <p><strong>Usuario Moodle creado:</strong> ${enrollment?.createdUser ? 'Si' : 'No'}</p>
    </div>
  `

  const results = []
  results.push(await sendMail(order.email_cliente, 'Acceso a tu curso CETMED', studentHtml))
  results.push(await sendMail(internalTo, `Nueva compra aprobada #${order.id}`, internalHtml))
  return results
}
