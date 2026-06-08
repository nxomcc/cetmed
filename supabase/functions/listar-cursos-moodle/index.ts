import { requireEditor } from '../_shared/auth.ts'
import { handleOptions, json } from '../_shared/cors.ts'
import { listMoodleCourses } from '../_shared/moodle.ts'

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  try {
    await requireEditor(req)
    const courses = await listMoodleCourses()
    return json(req, { courses })
  } catch (error) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500
    return json(req, { error: error.message || 'Error listando cursos Moodle' }, status)
  }
})
