'use strict'

// Moodle WS configuration from environment variables
const MOODLE_URL = process.env.MOODLE_URL
const MOODLE_TOKEN = process.env.MOODLE_TOKEN

/**
 * Generic function to call Moodle Web Services REST API
 */
async function callMoodle(wsFunction, params = {}) {
  if (!MOODLE_URL || !MOODLE_TOKEN) {
    throw new Error('Faltan credenciales de Moodle en el servidor (MOODLE_URL o MOODLE_TOKEN)')
  }

  // Build parameters using URLSearchParams
  const queryParams = new URLSearchParams({
    wstoken: MOODLE_TOKEN,
    wsfunction: wsFunction,
    moodlewsrestformat: 'json',
    ...params
  })

  const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: queryParams.toString()
  })

  if (!response.ok) {
    throw new Error(`Error en comunicación HTTP con Moodle: ${response.statusText}`)
  }

  const data = await response.json()
  if (data && data.exception) {
    throw new Error(`Excepción de Moodle: ${data.message} (${data.errorcode})`)
  }
  return data
}

/**
 * Get user details in Moodle by email address
 */
async function obtenerUsuarioPorEmail(email) {
  try {
    const res = await callMoodle('core_user_get_users_by_field', {
      field: 'email',
      'values[0]': email.toLowerCase().trim()
    })
    return res[0] || null
  } catch (err) {
    console.error(`[MOODLE] Error al buscar usuario por email (${email}):`, err.message)
    return null
  }
}

/**
 * Create a new user in Moodle
 */
async function crearUsuarioMoodle(nombre, email, rut, telefono) {
  // Extract firstname and lastname from fullname
  const partes = nombre.trim().split(' ')
  const firstname = partes[0]
  const lastname = partes.slice(1).join(' ') || 'Cliente'
  
  // Clean email to generate a username
  const cleanEmailPart = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  const randomSuffix = Math.floor(100 + Math.random() * 900)
  const username = `${cleanEmailPart}${randomSuffix}`
  
  // Generate temporary password
  const password = `Cetmed.${Math.random().toString(36).slice(2, 10)}!`

  const params = {
    'users[0][username]': username,
    'users[0][password]': password,
    'users[0][firstname]': firstname,
    'users[0][lastname]': lastname,
    'users[0][email]': email.toLowerCase().trim(),
    'users[0][phone1]': telefono || ''
  }

  console.log(`[MOODLE] Creando nuevo usuario: ${username} (${email})`)
  const res = await callMoodle('core_user_create_users', params)
  
  if (!res || !res[0] || !res[0].id) {
    throw new Error('Moodle no retornó un ID de usuario válido al crearlo')
  }

  return {
    id: res[0].id,
    username,
    password
  }
}

/**
 * Enroll a user into a course in Moodle
 */
async function matricularUsuarioEnCurso(moodleUserId, moodleCourseId) {
  console.log(`[MOODLE] Matriculando usuario Moodle #${moodleUserId} en curso Moodle #${moodleCourseId}`)
  
  const params = {
    'enrolments[0][roleid]': 5, // 5 = Student (default role)
    'enrolments[0][userid]': moodleUserId,
    'enrolments[0][courseid]': moodleCourseId
  }

  await callMoodle('enrol_manual_enrol_users', params)
}

module.exports = {
  obtenerUsuarioPorEmail,
  crearUsuarioMoodle,
  matricularUsuarioEnCurso
}
