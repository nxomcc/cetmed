async function callMoodle(wsFunction: string, params: Record<string, string | number | boolean | null | undefined> = {}) {
  const moodleUrl = Deno.env.get('MOODLE_URL')
  const token = Deno.env.get('MOODLE_TOKEN')
  if (!moodleUrl || !token) throw new Error('Faltan MOODLE_URL o MOODLE_TOKEN')

  const body = new URLSearchParams({
    wstoken: token,
    wsfunction: wsFunction,
    moodlewsrestformat: 'json',
  })

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) body.set(key, String(value))
  }

  const response = await fetch(`${moodleUrl.replace(/\/$/, '')}/webservice/rest/server.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) throw new Error(`Moodle HTTP ${response.status}`)
  const data = await response.json()
  if (data?.exception) throw new Error(`Moodle: ${data.message} (${data.errorcode})`)
  return data
}

export async function getMoodleUserByEmail(email: string) {
  const users = await callMoodle('core_user_get_users_by_field', {
    field: 'email',
    'values[0]': email.toLowerCase().trim(),
  })
  return users?.[0] || null
}

export async function createMoodleUser(nombre: string, email: string, telefono?: string | null) {
  const parts = nombre.trim().split(/\s+/)
  const firstname = parts[0] || 'Alumno'
  const lastname = parts.slice(1).join(' ') || 'CETMED'
  const username = `${email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(100 + Math.random() * 900)}`
  const password = `Cetmed.${crypto.randomUUID().slice(0, 8)}!`

  const res = await callMoodle('core_user_create_users', {
    'users[0][username]': username,
    'users[0][password]': password,
    'users[0][firstname]': firstname,
    'users[0][lastname]': lastname,
    'users[0][email]': email.toLowerCase().trim(),
    'users[0][phone1]': telefono || '',
  })

  if (!res?.[0]?.id) throw new Error('Moodle no retorno ID de usuario')
  return { id: res[0].id, username, password }
}

export async function enrollMoodleUser(userId: number, courseId: number) {
  await callMoodle('enrol_manual_enrol_users', {
    'enrolments[0][roleid]': 5,
    'enrolments[0][userid]': userId,
    'enrolments[0][courseid]': courseId,
  })
}
