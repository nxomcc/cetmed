import { createMoodleUser, enrollMoodleUser, generateMoodlePassword, getMoodleUserByEmail, updateMoodleUserPassword } from './moodle.ts'

function parseItems(order: any) {
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
  return Array.isArray(items) ? items : []
}

function normalizeModality(value: string | null | undefined) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function usesAutomaticMoodleAccess(course: any) {
  if (!course?.moodle_course_id) return false
  const modality = normalizeModality(course.modalidad)
  if (modality.includes('asincron')) return true
  if (modality.includes('presencial')) return false
  if (/(^|[^a-z])sincron/.test(modality)) return false
  if (modality.includes('blended') || modality.includes('b-learning')) return false
  if (modality.includes('in company')) return false
  return true
}

function coursePayload(course: any) {
  return {
    courseId: course.id,
    title: course.titulo,
    slug: course.slug || null,
    modalidad: course.modalidad || null,
    horas: course.horas || null,
    nivel: course.nivel || null,
    contenidos: course.contenidos || [],
    moodleCourseId: course.moodle_course_id || null,
  }
}

export async function enrollOrderCourses(
  sb: any,
  order: any,
  options: { resetExistingPassword?: boolean; mode?: 'auto' | 'moodle' | 'general' } = {},
) {
  const items = parseItems(order)
  if (!items.length) {
    return {
      enrolled: [],
      coordinationCourses: [],
      missingMoodleCourseIds: [],
      user: null,
      createdUser: false,
    }
  }

  const selectedCourses = []
  for (const item of items) {
    const { data: curso, error } = await sb
      .from('cursos')
      .select('id,titulo,slug,modalidad,horas,nivel,contenidos,moodle_course_id')
      .eq('id', item.id)
      .maybeSingle()

    if (error) throw error
    if (curso) selectedCourses.push(curso)
  }

  const mode = options.mode || 'auto'
  const moodleCourses = mode === 'general'
    ? []
    : selectedCourses.filter(usesAutomaticMoodleAccess)
  const coordinationCourses = (mode === 'general'
    ? selectedCourses
    : selectedCourses.filter((course: any) => !usesAutomaticMoodleAccess(course))
  ).map(coursePayload)

  let moodleUser = null
  let createdUser = false
  let tempPassword: string | null = null
  const enrolled = []

  if (moodleCourses.length) {
    moodleUser = await getMoodleUserByEmail(order.email_cliente)

    if (!moodleUser) {
      const created = await createMoodleUser(order.nombre_cliente, order.email_cliente, order.telefono_cliente)
      moodleUser = { id: created.id, username: created.username }
      createdUser = true
      tempPassword = created.password
    } else if (options.resetExistingPassword) {
      tempPassword = generateMoodlePassword()
      await updateMoodleUserPassword(Number(moodleUser.id), tempPassword)
    }

    for (const course of moodleCourses) {
      await enrollMoodleUser(Number(moodleUser.id), Number(course.moodle_course_id))
      enrolled.push(coursePayload(course))
    }
  }

  return {
    enrolled,
    coordinationCourses,
    missingMoodleCourseIds: coordinationCourses.map((course: any) => ({
      courseId: course.courseId,
      title: course.title,
    })),
    user: moodleUser ? { ...moodleUser, tempPassword } : null,
    createdUser,
  }
}
