import { useState, useEffect } from 'react'
import * as api from '../services/adminApi'
import { fmtDate, fmtClp } from '../utils/helpers'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const EMPTY = {
  codigo: '',
  tipo: 'porcentaje',
  valor: '',
  activo: true,
  fecha_expiracion: '',
  limite_usos: '',
  descripcion: '',
  alcance: 'todos',
  curso_id: '',
  curso_query: '',
}

function Badge({ activo }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{activo ? 'Activo' : 'Inactivo'}</span>
}

function toDateTimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromDateTimeLocal(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export default function AdminDescuentos() {
  const { toasts, toast, remove } = useToast()
  const [descuentos, setDescuentos] = useState([])
  const [cursos, setCursos]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [form, setForm]             = useState(EMPTY)
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showForm, setShowForm]     = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const discountsRes = await api.getDescuentos()
      setDescuentos(discountsRes.data || [])
    } catch {
      toast('Error cargando descuentos', 'error')
    } finally {
      setLoading(false)
    }

    try {
      const coursesRes = await api.getCursosForSelect()
      setCursos(coursesRes || [])
    } catch {
      setCursos([])
      toast('No se pudieron cargar los cursos para descuentos', 'error')
    }
  }

  function openCreate() { setEditId(null); setForm(EMPTY); setShowForm(true) }

  function startEdit(d) {
    const a = d.attributes
    setEditId(d.id)
    setForm({
      codigo: a.codigo || '',
      tipo: a.tipo || 'porcentaje',
      valor: a.valor ?? '',
      activo: !!a.activo,
      fecha_expiracion: toDateTimeLocal(a.fecha_expiracion),
      limite_usos: a.limite_usos ?? '',
      descripcion: a.descripcion || '',
      alcance: a.curso_id ? 'curso' : 'todos',
      curso_id: a.curso_id || '',
      curso_query: a.curso_id ? courseTitle(a.curso_id, a) : '',
    })
    setShowForm(true)
  }

  function cancel() { setShowForm(false); setEditId(null); setForm(EMPTY) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (form.alcance === 'curso' && !form.curso_id) {
        throw new Error('Selecciona un curso de la lista')
      }
      const data = {
        codigo: form.codigo.toUpperCase().trim(),
        tipo: form.tipo,
        valor: Number(form.valor),
        activo: form.activo,
        fecha_expiracion: fromDateTimeLocal(form.fecha_expiracion),
        limite_usos: form.limite_usos ? Number(form.limite_usos) : null,
        descripcion: form.descripcion,
        curso_id: form.alcance === 'curso' && form.curso_id ? Number(form.curso_id) : null,
      }
      if (editId) {
        await api.updateDescuento(editId, data)
        setDescuentos(p => p.map(x => x.id === editId ? { ...x, attributes: { ...x.attributes, ...data } } : x))
        toast('Descuento actualizado')
      } else {
        const r = await api.createDescuento(data)
        setDescuentos(p => [r.data, ...p])
        toast('Descuento creado')
      }
      cancel()
    } catch (err) {
      toast(err.message || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await api.deleteDescuento(deleteTarget.id)
      setDescuentos(p => p.filter(x => x.id !== deleteTarget.id))
      toast('Descuento eliminado')
    } catch {
      toast('Error al eliminar', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  async function toggleActivo(d) {
    const next = !d.attributes.activo
    try {
      await api.updateDescuento(d.id, { activo: next })
      setDescuentos(p => p.map(x => x.id === d.id ? { ...x, attributes: { ...x.attributes, activo: next } } : x))
    } catch {
      toast('Error al actualizar', 'error')
    }
  }

  function courseTitle(id, row) {
    return row?.cursos?.titulo || cursos.find(c => Number(c.id) === Number(id))?.titulo || `Curso #${id}`
  }

  const filteredCursos = cursos
    .filter(c => !form.curso_query || c.titulo?.toLowerCase().includes(form.curso_query.toLowerCase()))
    .slice(0, 8)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Descuentos</h1>
          <p className="text-gray-400 text-sm mt-0.5">{descuentos.length} codigos de descuento</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#003d7a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#002d5a] transition-colors">
          <span className="material-icons text-[18px]">add</span>
          Nuevo codigo
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-gray-900 text-lg mb-5">{editId ? 'Editar descuento' : 'Nuevo codigo de descuento'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Codigo *</label>
                  <input required value={form.codigo} onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-[#003d7a] uppercase" placeholder="VERANO20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo *</label>
                  <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#003d7a]">
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto_fijo">Monto fijo (CLP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Valor *</label>
                  <input required type="number" min={0} value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#003d7a]" placeholder={form.tipo === 'porcentaje' ? '20' : '5000'} />
                  <p className="text-xs text-gray-400 mt-1">{form.tipo === 'porcentaje' ? 'Ej: 20 = 20% de descuento' : 'Monto en CLP'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Limite de usos</label>
                  <input type="number" min={1} value={form.limite_usos} onChange={e => setForm(p => ({ ...p, limite_usos: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#003d7a]" placeholder="Sin limite" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Alcance del codigo</label>
                  <select value={form.alcance} onChange={e => setForm(p => ({ ...p, alcance: e.target.value, curso_id: e.target.value === 'todos' ? '' : p.curso_id }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#003d7a]">
                    <option value="todos">Todas las compras</option>
                    <option value="curso">Curso especifico</option>
                  </select>
                </div>
                {form.alcance === 'curso' && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Curso</label>
                    <input
                      value={form.curso_query}
                      onChange={e => {
                        const value = e.target.value
                        const exact = cursos.find(c => c.titulo?.toLowerCase() === value.toLowerCase())
                        setForm(p => ({ ...p, curso_query: value, curso_id: exact?.id || '' }))
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#003d7a]"
                      placeholder="Escribe para buscar un curso..."
                    />
                    <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-1">
                      {filteredCursos.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-gray-400">Sin cursos coincidentes</p>
                      ) : filteredCursos.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, curso_id: c.id, curso_query: c.titulo }))}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${Number(form.curso_id) === Number(c.id) ? 'bg-[#003d7a] text-white' : 'text-gray-700 hover:bg-white'}`}
                        >
                          {c.titulo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de expiracion</label>
                  <input type="datetime-local" value={form.fecha_expiracion} onChange={e => setForm(p => ({ ...p, fecha_expiracion: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#003d7a]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descripcion interna</label>
                  <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#003d7a]" placeholder="Campana de verano 2025..." />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.activo} onChange={e => setForm(p => ({ ...p, activo: e.target.checked }))} className="w-4 h-4 accent-[#003d7a]" />
                <span className="text-sm font-medium text-gray-700">Codigo activo</span>
              </label>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="flex-1 bg-[#003d7a] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#002d5a] disabled:opacity-60">
                  {saving ? 'Guardando...' : editId ? 'Guardar' : 'Crear codigo'}
                </button>
                <button type="button" onClick={cancel} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d7a]" /></div>
        ) : descuentos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="material-icons text-4xl mb-2 block">local_offer</span>
            <p>Sin codigos de descuento</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Codigo', 'Descuento', 'Alcance', 'Usos', 'Expira', 'Estado', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {descuentos.map(d => {
                  const a = d.attributes
                  return (
                    <tr key={d.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg text-sm">{a.codigo}</span>
                        {a.descripcion && <p className="text-xs text-gray-400 mt-0.5">{a.descripcion}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {a.tipo === 'porcentaje' ? `${a.valor}%` : fmtClp(a.valor)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[220px]">
                        {a.curso_id ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                            <span className="material-icons text-[14px]">school</span>
                            <span className="truncate">{courseTitle(a.curso_id, a)}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                            <span className="material-icons text-[14px]">shopping_cart</span>
                            Todas
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {a.usos_actuales || 0}{a.limite_usos ? ` / ${a.limite_usos}` : ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{a.fecha_expiracion ? fmtDate(a.fecha_expiracion) : '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActivo(d)}>
                          <Badge activo={a.activo} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => startEdit(d)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#003d7a] hover:bg-blue-50 transition-colors">
                            <span className="material-icons text-[18px]">edit</span>
                          </button>
                          <button onClick={() => setDeleteTarget(d)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <span className="material-icons text-[18px]">delete</span>
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar descuento"
        message={`Eliminar el codigo "${deleteTarget?.attributes?.codigo}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
      <Toast toasts={toasts} remove={remove} />
    </div>
  )
}
