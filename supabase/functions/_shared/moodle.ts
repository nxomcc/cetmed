export async function callMoodle(wsFunction: string, params: Record<string, string | number | boolean | null | undefined> = {}) {
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
  const password = generateMoodlePassword()

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

export function generateMoodlePassword() {
  return `Cetmed.${crypto.randomUUID().slice(0, 8)}!`
}

export async function updateMoodleUserPassword(userId: number, password: string) {
  await callMoodle('core_user_update_users', {
    'users[0][id]': userId,
    'users[0][password]': password,
  })
}

export async function enrollMoodleUser(userId: number, courseId: number) {
  await callMoodle('enrol_manual_enrol_users', {
    'enrolments[0][roleid]': 5,
    'enrolments[0][userid]': userId,
    'enrolments[0][courseid]': courseId,
  })
}

export async function listMoodleCourses() {
  const courses = await callMoodle('core_course_get_courses')
  return (courses || [])
    .filter((course: any) => Number(course.id) !== 1)
    .map((course: any) => ({
      id: Number(course.id),
      fullname: course.fullname,
      shortname: course.shortname,
      categoryid: Number(course.categoryid || 0),
      visible: Boolean(Number(course.visible ?? 1)),
    }))
}

export async function createMoodleCourse(input: {
  fullname: string
  shortname: string
  summary?: string | null
  categoryid?: number | null
}) {
  const defaultCategoryId = Number(Deno.env.get('MOODLE_DEFAULT_CATEGORY_ID') || 1)
  const categoryid = Number(input.categoryid || defaultCategoryId)

  const res = await callMoodle('core_course_create_courses', {
    'courses[0][fullname]': input.fullname,
    'courses[0][shortname]': input.shortname,
    'courses[0][categoryid]': categoryid,
    'courses[0][summary]': input.summary || '',
    'courses[0][summaryformat]': 1,
    'courses[0][format]': 'topics',
    'courses[0][visible]': 1,
  })

  if (!res?.[0]?.id) throw new Error('Moodle no retorno ID de curso')
  return {
    id: Number(res[0].id),
    fullname: input.fullname,
    shortname: input.shortname,
    categoryid,
  }
}
