import { useEffect, useMemo, useState } from 'react'
import * as api from '../services/adminApi'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

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
  return usesMoodleAccess(course) ? `Moodle #${course.moodle_course_id}` : 'Registro general'
}

export default function AdminAlumnos() {
  const { toasts, toast, remove } = useToast()
  const [studentQuery, setStudentQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [matriculas, setMatriculas] = useState([])

  useEffect(() => {
    loadMatriculas()
  }, [])

  async function loadMatriculas() {
    setLoading(true)
    try {
      const rows = await api.getAlumnosMatriculados()
      setMatriculas(rows || [])
    } catch {
      toast('No se pudo cargar la lista de alumnos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const groupedMatriculas = useMemo(() => {
    const text = studentQuery.trim().toLowerCase()
    const groups = new Map()

    for (const matricula of matriculas) {
      const matchesStudent = !text
        || matricula.nombre?.toLowerCase().includes(text)
        || matricula.email?.toLowerCase().includes(text)
        || matricula.cursos?.some(course => course.titulo?.toLowerCase().includes(text))

      if (!matchesStudent) continue

      for (const course of matricula.cursos || []) {
        const categoryName = course.categoria || 'Sin categoría'
        if (!groups.has(categoryName)) groups.set(categoryName, new Map())
        const coursesMap = groups.get(categoryName)
        if (!coursesMap.has(course.id)) {
          coursesMap.set(course.id, { ...course, alumnos: [] })
        }
        coursesMap.get(course.id).alumnos.push(matricula)
      }
    }

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([categoria, coursesMap]) => ({
        categoria,
        cursos: [...coursesMap.values()].sort((a, b) => a.titulo.localeCompare(b.titulo)),
      }))
  }, [matriculas, studentQuery])

  const stats = useMemo(() => {
    const uniqueEmails = new Set()
    let courseRegistrations = 0
    let moodleRegistrations = 0
    let generalRegistrations = 0

    for (const matricula of matriculas) {
      if (matricula.email) uniqueEmails.add(matricula.email.toLowerCase())
      for (const course of matricula.cursos || []) {
        courseRegistrations += 1
        if (usesMoodleAccess(course)) moodleRegistrations += 1
        else generalRegistrations += 1
      }
    }

    return {
      students: uniqueEmails.size,
      matriculas: matriculas.length,
      courseRegistrations,
      moodleRegistrations,
      generalRegistrations,
    }
  }, [matriculas])

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} remove={remove} />

      <div>
        <h1 className="text-2xl font-black text-gray-900">Lista de alumnos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Registro general de alumnos matriculados en cursos Moodle, presenciales, sincrónicos o de coordinación.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {[
          { label: 'Alumnos únicos', value: stats.students, icon: 'groups', tone: 'bg-blue-50 text-[#003d7a]' },
          { label: 'Matrículas', value: stats.matriculas, icon: 'receipt_long', tone: 'bg-gray-50 text-gray-700' },
          { label: 'Registros curso', value: stats.courseRegistrations, icon: 'school', tone: 'bg-gray-50 text-gray-700' },
          { label: 'Con Moodle', value: stats.moodleRegistrations, icon: 'computer', tone: 'bg-green-50 text-green-700' },
          { label: 'Registro general', value: stats.generalRegistrations, icon: 'event_note', tone: 'bg-amber-50 text-amber-700' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-9 h-9 rounded-xl ${item.tone} flex items-center justify-center mb-3`}>
              <span className="material-icons text-[18px]">{item.icon}</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{item.value}</p>
            <p className="text-xs font-semibold text-gray-400">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div className="relative max-w-md w-full">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
            <input
              value={studentQuery}
              onChange={e => setStudentQuery(e.target.value)}
              placeholder="Buscar por alumno, email o curso..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10"
            />
          </div>
          <button onClick={loadMatriculas} disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60">
            <span className={`material-icons text-[18px] ${loading ? 'animate-spin' : ''}`}>{loading ? 'refresh' : 'sync'}</span>
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d7a]" />
        </div>
      ) : groupedMatriculas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <span className="material-icons text-4xl mb-2 block">group_off</span>
          No hay alumnos matriculados para mostrar
        </div>
      ) : groupedMatriculas.map(group => (
        <section key={group.categoria} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-icons text-[#003d7a]">category</span>
            <h2 className="text-lg font-black text-gray-900">{group.categoria}</h2>
          </div>
          <div className="grid xl:grid-cols-2 gap-4">
            {group.cursos.map(course => (
              <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900">{course.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {course.alumnos.length} alumno{course.alumnos.length !== 1 ? 's' : ''} · {course.modalidad || 'Sin modalidad'}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${usesMoodleAccess(course) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {courseAccessLabel(course)}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {course.alumnos.map(alumno => (
                    <div key={`${course.id}-${alumno.id}`} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{alumno.nombre || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-500 truncate">{alumno.email}</p>
                          {alumno.telefono && <p className="text-xs text-gray-400 mt-0.5">{alumno.telefono}</p>}
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${alumno.manual ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {alumno.manual ? 'Manual' : 'Compra'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">{alumno.fecha ? new Date(alumno.fecha).toLocaleDateString('es-CL') : ''}</p>
                      {alumno.notas && <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{alumno.notas}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
