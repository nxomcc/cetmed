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
      .filter(c => !selected.some(s => Number(s.id) === Number(c.id)))
      .filter(c => !text || c.titulo?.toLowerCase().includes(text))
      .slice(0, 10)
  }, [cursos, query, selected])

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
        <p className="text-sm text-gray-500 mt-0.5">Crea o reutiliza el usuario Moodle y lo inscribe manualmente en los cursos seleccionados.</p>
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
    </div>
  )
}
