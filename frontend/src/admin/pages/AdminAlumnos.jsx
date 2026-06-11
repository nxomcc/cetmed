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
  if (course?.enrollment_mode === 'general') return false
  if (course?.enrollment_mode === 'moodle') return true
  if (!course?.moodle_course_id) return false
  const modality = normalizeModality(course.modalidad)
  if (modality.includes('asincron')) return true
  if (modality.includes('presencial')) return false
  if (/(^|[^a-z])sincron/.test(modality)) return false
  if (modality.includes('blended') || modality.includes('b-learning')) return false
  if (modality.includes('in company')) return false
  return true
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-CL')
}

function courseSummary(courses = []) {
  if (!courses.length) return 'Sin cursos'
  if (courses.length === 1) return courses[0].titulo
  return `${courses[0].titulo} +${courses.length - 1}`
}

function emailHref(alumno) {
  const subject = encodeURIComponent('Información de tu matrícula CETMED')
  return `mailto:${alumno.email || ''}?subject=${subject}`
}

function blankEdit(alumno) {
  return {
    nombre: alumno?.nombre || '',
    email: alumno?.email || '',
    telefono: alumno?.telefono || '',
    notas: alumno?.notas || '',
  }
}

const STATUS_META = {
  completado: { label: 'Activo', icon: 'check_circle', tone: 'bg-blue-100 text-[#003d7a]' },
  suspendido: { label: 'Suspendido', icon: 'block', tone: 'bg-red-100 text-red-700' },
}

function statusMeta(status) {
  return STATUS_META[status] || { label: status || 'Activo', icon: 'info', tone: 'bg-gray-100 text-gray-600' }
}

export default function AdminAlumnos() {
  const { toasts, toast, remove } = useToast()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actioningId, setActioningId] = useState(null)
  const [matriculas, setMatriculas] = useState([])
  const [selected, setSelected] = useState(null)
  const [edit, setEdit] = useState(blankEdit(null))

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

  function openAlumno(alumno) {
    setSelected(alumno)
    setEdit(blankEdit(alumno))
  }

  function closeAlumno() {
    setSelected(null)
    setEdit(blankEdit(null))
  }

  async function saveAlumno() {
    if (!selected) return
    if (!edit.nombre.trim() || !edit.email.trim()) {
      toast('Nombre y email son obligatorios', 'error')
      return
    }

    setSaving(true)
    try {
      await api.updatePedido(selected.id, {
        nombre_cliente: edit.nombre.trim(),
        email_cliente: edit.email.trim().toLowerCase(),
        telefono_cliente: edit.telefono.trim() || null,
        notas: edit.notas.trim() || null,
      })
      toast('Alumno actualizado', 'success')
      await loadMatriculas()
      closeAlumno()
    } catch (error) {
      toast(error.message || 'No se pudo actualizar el alumno', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleSuspension(alumno) {
    const willSuspend = alumno.estado !== 'suspendido'
    setActioningId(alumno.id)
    try {
      await api.suspendAlumnoRegistro(alumno.id, willSuspend)
      setMatriculas(prev => prev.map(item => item.id === alumno.id ? { ...item, estado: willSuspend ? 'suspendido' : 'completado' } : item))
      if (selected?.id === alumno.id) setSelected(prev => prev ? { ...prev, estado: willSuspend ? 'suspendido' : 'completado' } : prev)
      toast(willSuspend ? 'Alumno suspendido' : 'Alumno reactivado', 'success')
    } catch (error) {
      toast(error.message || 'No se pudo actualizar el estado del alumno', 'error')
    } finally {
      setActioningId(null)
    }
  }

  async function removeAlumno(alumno) {
    if (!window.confirm(`¿Eliminar a ${alumno.nombre || alumno.email} de la lista de alumnos?`)) return
    setActioningId(alumno.id)
    try {
      await api.deleteAlumnoRegistro(alumno.id)
      setMatriculas(prev => prev.filter(item => item.id !== alumno.id))
      if (selected?.id === alumno.id) closeAlumno()
      toast('Alumno eliminado de la lista', 'success')
    } catch (error) {
      toast(error.message || 'No se pudo eliminar el alumno', 'error')
    } finally {
      setActioningId(null)
    }
  }

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    if (!text) return matriculas
    return matriculas.filter(alumno =>
      alumno.nombre?.toLowerCase().includes(text)
      || alumno.email?.toLowerCase().includes(text)
      || alumno.telefono?.toLowerCase().includes(text)
      || alumno.estado?.toLowerCase().includes(text)
      || alumno.cursos?.some(course => course.titulo?.toLowerCase().includes(text))
    )
  }, [matriculas, query])

  const stats = useMemo(() => {
    const uniqueEmails = new Set()
    let courseRegistrations = 0
    let moodleRegistrations = 0
    let generalRegistrations = 0
    let suspended = 0

    for (const alumno of matriculas) {
      if (alumno.email) uniqueEmails.add(alumno.email.toLowerCase())
      if (alumno.estado === 'suspendido') suspended += 1
      for (const course of alumno.cursos || []) {
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
      suspended,
    }
  }, [matriculas])

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} remove={remove} />

      <div>
        <h1 className="text-2xl font-black text-gray-900">Lista de alumnos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Registro general de alumnos. Doble clic en una fila para ver o editar la ficha.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-6 gap-3">
        {[
          { label: 'Alumnos únicos', value: stats.students, icon: 'groups', tone: 'bg-blue-50 text-[#003d7a]' },
          { label: 'Matrículas', value: stats.matriculas, icon: 'receipt_long', tone: 'bg-gray-50 text-gray-700' },
          { label: 'Registros curso', value: stats.courseRegistrations, icon: 'school', tone: 'bg-gray-50 text-gray-700' },
          { label: 'Con Moodle', value: stats.moodleRegistrations, icon: 'computer', tone: 'bg-green-50 text-green-700' },
          { label: 'Registro general', value: stats.generalRegistrations, icon: 'event_note', tone: 'bg-amber-50 text-amber-700' },
          { label: 'Suspendidos', value: stats.suspended, icon: 'block', tone: 'bg-red-50 text-red-700' },
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
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre, email, teléfono o curso..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10"
            />
          </div>
          <button onClick={loadMatriculas} disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60">
            <span className={`material-icons text-[18px] ${loading ? 'animate-spin' : ''}`}>{loading ? 'refresh' : 'sync'}</span>
            Actualizar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d7a]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="material-icons text-4xl mb-2 block">group_off</span>
            No hay alumnos para mostrar
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Alumno</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cursos</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(alumno => {
                  const hasMoodle = alumno.cursos?.some(usesMoodleAccess)
                  const suspended = alumno.estado === 'suspendido'
                  const status = statusMeta(alumno.estado)
                  return (
                    <tr
                      key={alumno.id}
                      onDoubleClick={() => openAlumno(alumno)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-default ${suspended ? 'bg-red-50/30' : ''}`}
                      title="Doble clic para abrir ficha"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{alumno.nombre || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500">{alumno.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{alumno.telefono || '-'}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 line-clamp-1">{courseSummary(alumno.cursos)}</p>
                        <p className="text-xs text-gray-400">{alumno.cursos?.length || 0} curso{alumno.cursos?.length === 1 ? '' : 's'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${hasMoodle ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            <span className="material-icons text-[14px]">{hasMoodle ? 'computer' : 'event_note'}</span>
                            {hasMoodle ? 'Moodle' : 'General'}
                          </span>
                          {suspended && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${status.tone}`}>
                              <span className="material-icons text-[14px]">{status.icon}</span>
                              {status.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(alumno.fecha)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <a href={emailHref(alumno)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#003d7a] hover:bg-blue-50" title="Enviar correo">
                            <span className="material-icons text-[16px]">mail</span>
                          </a>
                          <button onClick={() => openAlumno(alumno)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#003d7a] hover:bg-blue-50" title="Editar alumno">
                            <span className="material-icons text-[16px]">edit</span>
                          </button>
                          <button onClick={() => toggleSuspension(alumno)} disabled={actioningId === alumno.id} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 disabled:opacity-50" title={suspended ? 'Reactivar alumno' : 'Suspender alumno'}>
                            <span className="material-icons text-[16px]">{suspended ? 'check_circle' : 'block'}</span>
                          </button>
                          <button onClick={() => removeAlumno(alumno)} disabled={actioningId === alumno.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-700 hover:bg-red-50 disabled:opacity-50" title="Eliminar alumno">
                            <span className="material-icons text-[16px]">delete_outline</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) closeAlumno() }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">Ficha del alumno</h2>
                <p className="text-xs text-gray-400">Registro #{selected.id}</p>
              </div>
              <button onClick={closeAlumno} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <span className="material-icons text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
                  <input value={edit.nombre} onChange={e => setEdit(p => ({ ...p, nombre: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={edit.email} onChange={e => setEdit(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
                  <input value={edit.telefono} onChange={e => setEdit(p => ({ ...p, telefono: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha</label>
                  <input value={formatDate(selected.fecha)} readOnly className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notas internas</label>
                <textarea value={edit.notas} onChange={e => setEdit(p => ({ ...p, notas: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#003d7a] focus:ring-2 focus:ring-[#003d7a]/10 resize-none" />
              </div>

              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-3">Cursos inscritos</h3>
                <div className="space-y-2">
                  {(selected.cursos || []).map(course => (
                    <div key={`${selected.id}-${course.id}`} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{course.titulo}</p>
                        <p className="text-xs text-gray-400">{course.categoria || 'Sin categoría'} · {course.modalidad || 'Sin modalidad'}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${usesMoodleAccess(course) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {usesMoodleAccess(course) ? `Moodle #${course.moodle_course_id}` : 'General'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <a href={emailHref(selected)} className="h-9 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                  <span className="material-icons text-[16px]">mail</span>
                  Enviar correo
                </a>
                <button onClick={() => toggleSuspension(selected)} disabled={actioningId === selected.id} className="h-9 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap">
                  <span className="material-icons text-[16px]">{selected.estado === 'suspendido' ? 'check_circle' : 'block'}</span>
                  {selected.estado === 'suspendido' ? 'Reactivar' : 'Suspender'}
                </button>
                <button onClick={() => removeAlumno(selected)} disabled={actioningId === selected.id} className="h-9 inline-flex items-center justify-center gap-1.5 px-3 rounded-lg border border-red-100 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 whitespace-nowrap">
                  <span className="material-icons text-[16px]">delete_outline</span>
                  Eliminar
                </button>
              </div>
              <div className="flex items-center justify-end gap-2 shrink-0">
                <button onClick={closeAlumno} className="h-9 px-3 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Cancelar
                </button>
                <button onClick={saveAlumno} disabled={saving} className="h-9 inline-flex items-center gap-1.5 px-4 bg-[#003d7a] text-white text-xs font-semibold rounded-lg hover:bg-[#002d5a] transition-colors disabled:opacity-60 whitespace-nowrap">
                  {saving && <span className="animate-spin material-icons text-[16px]">refresh</span>}
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
