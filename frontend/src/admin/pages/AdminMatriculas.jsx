import { useEffect, useMemo, useState } from 'react'
import * as api from '../services/adminApi'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const EMPTY = {
  nombre: '',
  email: '',
  telefono: '',
  rut: '',
  notas: '',
}

const MODES = {
  general: {
    icon: 'person_add',
    title: 'Registrar alumno',
    description: 'Guarda al alumno en el registro general. No crea usuario ni acceso Moodle.',
    button: 'Registrar alumno',
  },
  moodle: {
    icon: 'computer',
    title: 'Matricular en Moodle',
    description: 'Crea o actualiza el usuario Moodle y lo matricula en cursos con aula virtual.',
    button: 'Matricular en Moodle',
  },
}

function normalizeModality(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function usesMoodleAccess(course) {
  if (!course?.moodle_course_id) return false
  const modality = normalizeModality(course.modalidad)
  if (modality.includes('asincron')) return true
  if (modality.includes('presencial')) return false
  if (/(^|[^a-z])sincron/.test(modality)) return false
  if (modality.includes('blended') || modality.includes('b-learning')) return false
  if (modality.includes('in company')) return false
  return true
}

function courseAccessLabel(course) {
  return usesMoodleAccess(course)
    ? `Acceso Moodle #${course.moodle_course_id}`
    : 'Registro general sin Moodle'
}

export default function AdminMatriculas() {
  const { toasts, toast, remove } = useToast()
  const [cursos, setCursos] = useState([])
  const [selected, setSelected] = useState([])
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('general')
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.getCursosForSelect()
      .then(rows => setCursos(rows || []))
      .catch(() => toast('No se pudieron cargar los cursos', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const filteredCursos = useMemo(() => {
    const text = query.trim().toLowerCase()
    return cursos
      .filter(c => mode !== 'moodle' || usesMoodleAccess(c))
      .filter(c => !selected.some(s => Number(s.id) === Number(c.id)))
      .filter(c => !text || c.titulo?.toLowerCase().includes(text))
      .slice(0, 10)
  }, [cursos, mode, query, selected])

  function changeMode(nextMode) {
    setMode(nextMode)
    setSelected([])
    setResult(null)
    setQuery('')
  }

  function addCourse(course) {
    setSelected(prev => [...prev, course])
    setQuery('')
  }

  function removeCourse(id) {
    setSelected(prev => prev.filter(course => Number(course.id) !== Number(id)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setResult(null)

    if (!selected.length) {
      toast('Selecciona al menos un curso', 'error')
      return
    }
    if (mode === 'moodle' && selected.some(course => !usesMoodleAccess(course))) {
      toast('En Moodle solo puedes seleccionar cursos con aula virtual', 'error')
      return
    }

    setSaving(true)
    try {
      const response = await api.matricularAlumno({
        nombre_cliente: form.nombre,
        email_cliente: form.email,
        telefono_cliente: form.telefono || null,
        rut_cliente: form.rut || null,
        notas: form.notas || null,
        enrollment_mode: mode,
        items: selected.map(course => ({ id: course.id })),
      })
      setResult(response)
      setForm(EMPTY)
      setSelected([])
      toast(mode === 'moodle' ? 'Alumno matriculado en Moodle' : 'Alumno registrado', 'success')
    } catch (error) {
      toast(error.message || 'Error al registrar matrícula', 'error')
    } finally {
      setSaving(false)
    }
  }

  const selectedMoodleCount = mode === 'moodle' ? selected.length : 0
  const selectedGeneralCount = mode === 'general' ? selected.length : 0
  const currentMode = MODES[mode]

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} remove={remove} />

      <div>
        <h1 className="text-2xl font-black text-gray-900">Matrículas</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Elige si quieres registrar al alumno en la lista general o matricularlo con acceso Moodle.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {Object.entries(MODES).map(([id, item]) => (
          <button
            key={id}
            type="button"
            onClick={() => changeMode(id)}
            className={`text-left rounded-2xl border p-4 transition-colors ${
              mode === id
                ? 'border-[#003d7a] bg-blue-50 ring-1 ring-[#003d7a]/10'
                : 'border-gray-100 bg-white hover:border-[#003d7a]/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`material-icons mt-0.5 ${mode === id ? 'text-[#003d7a]' : 'text-gray-400'}`}>{item.icon}</span>
              <div>
                <p className="font-bold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo *</label>
              <input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" placeholder="Nombre del alumno" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" placeholder="alumno@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
              <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" placeholder="+56 9 0000 0000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">RUT</label>
              <input value={form.rut} onChange={e => setForm(p => ({ ...p, rut: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" placeholder="12.345.678-9" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cursos *</label>
            <input value={query} onChange={e => setQuery(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" placeholder={mode === 'moodle' ? 'Buscar cursos con Moodle...' : 'Buscar cualquier curso...'} />
            <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-1">
              {loading ? (
                <p className="px-3 py-2 text-xs text-gray-400">Cargando cursos...</p>
              ) : filteredCursos.length === 0 ? (
                <p className="px-3 py-2 text-xs text-gray-400">Sin cursos coincidentes</p>
              ) : filteredCursos.map(course => (
                <button key={course.id} type="button" onClick={() => addCourse(course)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-white transition-colors">
                  <span className="font-semibold">{course.titulo}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    {course.modalidad || 'Sin modalidad'} · {mode === 'moodle' ? courseAccessLabel(course) : 'Se registrará sin Moodle'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notas internas</label>
            <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10 resize-none" placeholder="Ej: matrícula solicitada por empresa, fecha acordada, enlace pendiente..." />
          </div>

          <button disabled={saving} className="w-full flex items-center justify-center gap-2 bg-[#003d7a] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#002d5a] disabled:opacity-60 transition-colors">
            <span className={`material-icons text-[18px] ${saving ? 'animate-spin' : ''}`}>{saving ? 'refresh' : 'how_to_reg'}</span>
            {saving ? 'Guardando...' : currentMode.button}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Cursos seleccionados</h2>
            {selected.length === 0 ? (
              <p className="text-sm text-gray-400">Aún no hay cursos seleccionados.</p>
            ) : (
              <div className="space-y-2">
                {selected.map(course => (
                  <div key={course.id} className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2">
                    <span className="material-icons text-[18px] text-[#003d7a] mt-0.5">{mode === 'moodle' ? 'computer' : 'event_note'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 leading-snug">{course.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{mode === 'moodle' ? courseAccessLabel(course) : 'Registro general sin Moodle'}</p>
                    </div>
                    <button type="button" onClick={() => removeCourse(course.id)} className="text-gray-400 hover:text-red-600">
                      <span className="material-icons text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selected.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-blue-50 px-3 py-2">
                  <p className="text-lg font-black text-[#003d7a]">{selectedMoodleCount}</p>
                  <p className="text-[11px] font-semibold text-gray-500">a Moodle</p>
                </div>
                <div className="rounded-xl bg-amber-50 px-3 py-2">
                  <p className="text-lg font-black text-amber-700">{selectedGeneralCount}</p>
                  <p className="text-[11px] font-semibold text-gray-500">general</p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-sm text-green-800">
              <p className="font-bold mb-2">{mode === 'moodle' ? 'Matrícula Moodle completada' : 'Alumno registrado'}</p>
              <p>Registro manual #{result.orderId}</p>
              <p>Cursos con acceso Moodle: {result.enrollment?.enrolled?.length || 0}</p>
              <p>Cursos en registro general: {result.enrollment?.coordinationCourses?.length || 0}</p>
              {result.mail?.error && <p className="mt-2 text-amber-700">No se pudo enviar correo: {result.mail.error}</p>}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
