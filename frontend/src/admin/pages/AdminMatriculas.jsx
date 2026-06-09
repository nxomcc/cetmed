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

export default function AdminMatriculas() {
  const { toasts, toast, remove } = useToast()
  const [cursos, setCursos] = useState([])
  const [selected, setSelected] = useState([])
  const [query, setQuery] = useState('')
  const [studentQuery, setStudentQuery] = useState('')
  const [view, setView] = useState('matricular')
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [matriculas, setMatriculas] = useState([])
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.getCursosForSelect()
      .then(rows => setCursos(rows || []))
      .catch(() => toast('No se pudieron cargar los cursos', 'error'))
      .finally(() => setLoading(false))
    loadMatriculas()
  }, [])

  async function loadMatriculas() {
    setStudentsLoading(true)
    try {
      const rows = await api.getAlumnosMatriculados()
      setMatriculas(rows || [])
    } catch {
      toast('No se pudo cargar la lista de alumnos', 'error')
    } finally {
      setStudentsLoading(false)
    }
  }

  const filteredCursos = useMemo(() => {
    const text = query.trim().toLowerCase()
    return cursos
      .filter(c => !selected.some(s => Number(s.id) === Number(c.id)))
      .filter(c => !text || c.titulo?.toLowerCase().includes(text))
      .slice(0, 10)
  }, [cursos, query, selected])

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
        const categoryName = course.categoria || 'Sin categoria'
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

    setSaving(true)
    try {
      const response = await api.matricularAlumno({
        nombre_cliente: form.nombre,
        email_cliente: form.email,
        telefono_cliente: form.telefono || null,
        rut_cliente: form.rut || null,
        notas: form.notas || null,
        items: selected.map(course => ({ id: course.id })),
      })
      setResult(response)
      setForm(EMPTY)
      setSelected([])
      loadMatriculas()
      toast('Alumno matriculado', 'success')
    } catch (error) {
      toast(error.message || 'Error al matricular alumno', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} remove={remove} />

      <div>
        <h1 className="text-2xl font-black text-gray-900">Matricular alumnos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Crea matrículas manuales y revisa alumnos agrupados por categoría y curso.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'matricular', label: 'Matricular alumno', icon: 'how_to_reg' },
          { id: 'alumnos', label: 'Lista de alumnos', icon: 'groups' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${view === tab.id ? 'bg-[#003d7a] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <span className="material-icons text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'matricular' ? (
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefono</label>
              <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" placeholder="+56 9 0000 0000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">RUT</label>
              <input value={form.rut} onChange={e => setForm(p => ({ ...p, rut: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" placeholder="12.345.678-9" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cursos *</label>
            <input value={query} onChange={e => setQuery(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" placeholder="Escribe para buscar cursos..." />
            <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-1">
              {loading ? (
                <p className="px-3 py-2 text-xs text-gray-400">Cargando cursos...</p>
              ) : filteredCursos.length === 0 ? (
                <p className="px-3 py-2 text-xs text-gray-400">Sin cursos coincidentes</p>
              ) : filteredCursos.map(course => (
                <button key={course.id} type="button" onClick={() => addCourse(course)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-white transition-colors">
                  {course.titulo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notas internas</label>
            <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10 resize-none" placeholder="Ej: Matricula solicitada por empresa..." />
          </div>

          <button disabled={saving} className="w-full flex items-center justify-center gap-2 bg-[#003d7a] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#002d5a] disabled:opacity-60 transition-colors">
            <span className="material-icons text-[18px]">{saving ? 'refresh' : 'how_to_reg'}</span>
            {saving ? 'Matriculando...' : 'Matricular alumno'}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Cursos seleccionados</h2>
            {selected.length === 0 ? (
              <p className="text-sm text-gray-400">Aun no hay cursos seleccionados.</p>
            ) : (
              <div className="space-y-2">
                {selected.map(course => (
                  <div key={course.id} className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2">
                    <span className="material-icons text-[18px] text-[#003d7a] mt-0.5">school</span>
                    <p className="flex-1 text-sm font-semibold text-gray-700 leading-snug">{course.titulo}</p>
                    <button type="button" onClick={() => removeCourse(course.id)} className="text-gray-400 hover:text-red-600">
                      <span className="material-icons text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-sm text-green-800">
              <p className="font-bold mb-2">Matricula completada</p>
              <p>Pedido manual #{result.orderId}</p>
              <p>Cursos matriculados: {result.enrollment?.enrolled?.length || 0}</p>
              {!!result.enrollment?.missingMoodleCourseIds?.length && (
                <p className="mt-2 text-amber-700">Hay cursos sin ID Moodle configurado.</p>
              )}
              {result.mail?.error && <p className="mt-2 text-amber-700">No se pudo enviar correo: {result.mail.error}</p>}
            </div>
          )}
        </aside>
      </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="relative max-w-md">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input
                value={studentQuery}
                onChange={e => setStudentQuery(e.target.value)}
                placeholder="Buscar por alumno, email o curso..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10"
              />
            </div>
          </div>

          {studentsLoading ? (
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
                      <p className="font-bold text-gray-900">{course.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{course.alumnos.length} alumno{course.alumnos.length !== 1 ? 's' : ''}{course.moodle_course_id ? ` · Moodle #${course.moodle_course_id}` : ''}</p>
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
                            <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${alumno.manual ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                              {alumno.manual ? 'Manual' : 'Compra'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-2">{alumno.fecha ? new Date(alumno.fecha).toLocaleDateString('es-CL') : ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
