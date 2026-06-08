import { requireEditor } from '../_shared/auth.ts'
import { handleOptions, json } from '../_shared/cors.ts'
import { createMoodleCourse } from '../_shared/moodle.ts'

function cleanShortname(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

Deno.serve(async (req) => {
  const options = handleOptions(req)
  if (options) return options

  try {
    await requireEditor(req)
    const body = await req.json()
    if (!body.fullname) return json(req, { error: 'Falta fullname' }, 400)

    const course = await createMoodleCourse({
      fullname: body.fullname,
      shortname: body.shortname || cleanShortname(body.fullname),
      summary: body.summary || null,
      categoryid: body.categoryid ? Number(body.categoryid) : null,
    })

    return json(req, { course }, 201)
  } catch (error) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : error.message === 'FORBIDDEN' ? 403 : 500
    return json(req, { error: error.message || 'Error creando curso Moodle' }, status)
  }
})
