'use strict'

const { queryOne } = require('../db')
const moodle = require('./moodle')

async function enrollOrderCourses(order) {
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
  if (!Array.isArray(items) || items.length === 0) {
    return { enrolled: [], missingMoodleCourseIds: [], user: null, createdUser: false }
  }

  let userMoodle = await moodle.obtenerUsuarioPorEmail(order.email_cliente)
  let createdUser = false
  let tempPassword = null

  if (!userMoodle) {
    const result = await moodle.crearUsuarioMoodle(
      order.nombre_cliente,
      order.email_cliente,
      null,
      order.telefono_cliente
    )
    userMoodle = { id: result.id, username: result.username }
    createdUser = true
    tempPassword = result.password
  }

  const enrolled = []
  const missingMoodleCourseIds = []

  for (const item of items) {
    const curso = await queryOne('SELECT id, titulo, moodle_course_id FROM cursos WHERE id = $1', [item.id])
    if (!curso?.moodle_course_id) {
      missingMoodleCourseIds.push({ courseId: item.id, title: curso?.titulo || null })
      continue
    }

    await moodle.matricularUsuarioEnCurso(userMoodle.id, curso.moodle_course_id)
    enrolled.push({
      courseId: curso.id,
      title: curso.titulo,
      moodleCourseId: curso.moodle_course_id,
    })
  }

  return {
    enrolled,
    missingMoodleCourseIds,
    user: { ...userMoodle, tempPassword },
    createdUser,
  }
}

module.exports = { enrollOrderCourses }
