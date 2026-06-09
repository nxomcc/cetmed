import { createMoodleUser, enrollMoodleUser, generateMoodlePassword, getMoodleUserByEmail, updateMoodleUserPassword } from './moodle.ts'

export async function enrollOrderCourses(sb: any, order: any, options: { resetExistingPassword?: boolean } = {}) {
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
  if (!Array.isArray(items) || items.length === 0) {
    return { enrolled: [], missingMoodleCourseIds: [], user: null, createdUser: false }
  }

  let moodleUser = await getMoodleUserByEmail(order.email_cliente)
  let createdUser = false
  let tempPassword: string | null = null

  if (!moodleUser) {
    const created = await createMoodleUser(order.nombre_cliente, order.email_cliente, order.telefono_cliente)
    moodleUser = { id: created.id, username: created.username }
    createdUser = true
    tempPassword = created.password
  } else if (options.resetExistingPassword) {
    tempPassword = generateMoodlePassword()
    await updateMoodleUserPassword(Number(moodleUser.id), tempPassword)
  }

  const enrolled = []
  const missingMoodleCourseIds = []

  for (const item of items) {
    const { data: curso, error } = await sb
      .from('cursos')
      .select('id,titulo,moodle_course_id')
      .eq('id', item.id)
      .maybeSingle()

    if (error) throw error
    if (!curso?.moodle_course_id) {
      missingMoodleCourseIds.push({ courseId: item.id, title: curso?.titulo || null })
      continue
    }

    await enrollMoodleUser(Number(moodleUser.id), Number(curso.moodle_course_id))
    enrolled.push({ courseId: curso.id, title: curso.titulo, moodleCourseId: curso.moodle_course_id })
  }

  return {
    enrolled,
    missingMoodleCourseIds,
    user: { ...moodleUser, tempPassword },
    createdUser,
  }
}
