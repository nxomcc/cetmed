import { useState, useEffect } from 'react'
import * as api from '../services/adminApi'
import { useAdminAuth } from '../context/AdminAuthContext'
import { slugify } from '../utils/helpers'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const EMPTY = { nombre: '', slug: '', icono: '' }

export default function AdminCategorias() {
  const { isAdmin } = useAdminAuth()
  const { toasts, toast, remove } = useToast()
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading]       = useState(true)
  const [form, setForm]             = useState(EMPTY)
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const r = await api.getCategorias()
      setCategorias(r.data || [])
    } catch { toast('Error cargando categorías', 'error') }
    finally { setLoading(false) }
  }

  function setField(field, value) {
    setForm(p => {
      const next = { ...p, [field]: value }
      if (field === 'nombre' && !editId) next.slug = slugify(value)
      return next
    })
  }

  function startEdit(cat) {
    const a = cat.attributes
    setEditId(cat.id)
    setForm({ nombre: a.nombre || '', slug: a.slug || '', icono: a.icono || '' })
  }

  function cancelEdit() { setEditId(null); setForm(EMPTY) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { nombre: form.nombre, slug: form.slug, icono: form.icono }
      if (editId) {
        await api.updateCategoria(editId, data)
        setCategorias(p => p.map(x => x.id === editId ? { ...x, attributes: { ...x.attributes, ...data } } : x))
        toast('Categoría actualizada')
        cancelEdit()
      } else {
        const r = await api.createCategoria(data)
        setCategorias(p => [...p, r.data])
        toast('Categoría creada')
        setForm(EMPTY)
      }
    } catch (err) { toast(err.message || 'Error al guardar', 'error') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await api.deleteCategoria(deleteTarget.id)
      setCategorias(p => p.filter(x => x.id !== deleteTarget.id))
      toast('Categoría eliminada')
    } catch { toast('Error al eliminar', 'error') }
    finally { setDeleteTarget(null) }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Categorías</h1>
        <p className="text-gray-400 text-sm mt-0.5">{categorias.length} categorías</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">{editId ? 'Editar categoría' : 'Nueva categoría'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                <input required value={form.nombre} onChange={e => setField('nombre', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#003d7a]" placeholder="Prevención de Riesgos" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
                <input value={form.slug} onChange={e => setField('slug', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-[#003d7a]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ícono (Material Icons)</label>
                <input value={form.icono} onChange={e => setField('icono', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#003d7a]" placeholder="health_and_safety" />
                {form.icono && <span className="material-icons text-[#003d7a] mt-2 block">{form.icono}</span>}
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="flex-1 bg-[#003d7a] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#002d5a] transition-colors disabled:opacity-60">
                  {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear'}
                </button>
                {editId && (
                  <button type="button" onClick={cancelEdit} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003d7a]" /></div>
            ) : categorias.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <span className="material-icons text-3xl mb-1 block">category</span>
                <p className="text-sm">Sin categorías</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Nombre', 'Slug', 'Ícono', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categorias.map(c => {
                    const a = c.attributes
                    return (
                      <tr key={c.id} className={`hover:bg-gray-50/50 ${editId === c.id ? 'bg-blue-50/30' : ''}`}>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{a.nombre}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-400">{a.slug}</td>
                        <td className="px-4 py-3"><span className="material-icons text-[#003d7a] text-[20px]">{a.icono || 'category'}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#003d7a] hover:bg-blue-50 transition-colors">
                              <span className="material-icons text-[18px]">edit</span>
                            </button>
                            {isAdmin && (
                              <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                <span className="material-icons text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar categoría"
        message={`¿Seguro que querés eliminar "${deleteTarget?.attributes?.nombre}"? Los cursos asociados quedarán sin categoría.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
      <Toast toasts={toasts} remove={remove} />
    </div>
  )
}
