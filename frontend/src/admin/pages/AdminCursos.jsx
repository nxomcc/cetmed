import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../services/adminApi'
import { useAdminAuth } from '../context/AdminAuthContext'
import { imgSrc, fmtClp } from '../utils/helpers'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{ width: 40, height: 22 }}
      className={`rounded-full relative transition-colors shrink-0 ${on ? 'bg-green-500' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}

export default function AdminCursos() {
  const { isAdmin } = useAdminAuth()
  const { toasts, toast, remove } = useToast()
  const [cursos, setCursos]       = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterMod, setFilterMod] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [cRes, catRes] = await Promise.all([api.getCursos(), api.getCategorias()])
      setCursos(cRes.data || [])
      setCategorias(catRes.data || [])
    } catch { toast('Error cargando cursos', 'error') }
    finally { setLoading(false) }
  }

  const filtered = useMemo(() => (cursos || []).filter(c => {
    const a = c.attributes
    const ms = !search || a.titulo.toLowerCase().includes(search.toLowerCase())
    const mc = !filterCat || String(a.categoria?.data?.id) === filterCat
    const mm = !filterMod || a.modalidad === filterMod
    return ms && mc && mm
  }), [cursos, search, filterCat, filterMod])

  async function toggleActivo(c) {
    const next = !c.attributes.activo
    try {
      await api.updateCurso(c.id, { activo: next })
      setCursos(p => p.map(x => x.id === c.id ? { ...x, attributes: { ...x.attributes, activo: next } } : x))
      toast(`Curso ${next ? 'activado' : 'desactivado'}`)
    } catch { toast('Error al actualizar', 'error') }
  }

  async function togglePublish(c) {
    const published = !!c.attributes.publishedAt
    const next = published ? null : new Date().toISOString()
    try {
      await api.updateCurso(c.id, { publishedAt: next })
      setCursos(p => p.map(x => x.id === c.id ? { ...x, attributes: { ...x.attributes, publishedAt: next } } : x))
      toast(published ? 'Curso despublicado' : 'Curso publicado')
    } catch { toast('Error al actualizar', 'error') }
  }

  async function handleDelete() {
    try {
      await api.deleteCurso(deleteTarget.id)
      setCursos(p => p.filter(x => x.id !== deleteTarget.id))
      toast('Curso eliminado')
    } catch { toast('Error al eliminar', 'error') }
    finally { setDeleteTarget(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Cursos</h1>
          <p className="text-gray-400 text-sm mt-0.5">{cursos.length} cursos en total</p>
        </div>
        <Link to="/admin/cursos/nuevo" className="flex items-center gap-2 bg-[#003d7a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#002d5a] transition-colors">
          <span className="material-icons text-[18px]">add</span>
          Nuevo curso
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-gray-50 rounded-lg px-3 py-2">
          <span className="material-icons text-gray-400 text-[18px]">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-transparent flex-1 text-sm outline-none" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.attributes.nombre}</option>)}
        </select>
        <select value={filterMod} onChange={e => setFilterMod(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <option value="">Todas las modalidades</option>
          {['Presencial', 'E-Learning', 'Blended', 'In Company'].map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d7a]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="material-icons text-4xl mb-2 block">school</span>
            <p>No se encontraron cursos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Curso', 'Categoría', 'Precio', 'Modalidad', 'Activo', 'Publicado', 'Vistas', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => {
                  const a = c.attributes
                  const thumb = imgSrc(a.imagen, a.titulo, a.slug)
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {thumb
                              ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><span className="material-icons text-gray-300 text-[18px]">school</span></div>}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 max-w-[200px] truncate">{a.titulo}</p>
                            <p className="text-xs text-gray-400">{a.horas ? `${a.horas}h` : ''} {a.nivel}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{a.categoria?.data?.attributes?.nombre || '—'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{fmtClp(a.precio)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{a.modalidad}</span>
                      </td>
                      <td className="px-4 py-3"><Toggle on={a.activo} onChange={() => toggleActivo(c)} /></td>
                      <td className="px-4 py-3"><Toggle on={!!a.publishedAt} onChange={() => togglePublish(c)} /></td>
                      <td className="px-4 py-3 text-sm text-gray-400 text-center">{a.vistas || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/admin/cursos/${c.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-[#003d7a] hover:bg-blue-50 transition-colors">
                            <span className="material-icons text-[18px]">edit</span>
                          </Link>
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
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar curso"
        message={`¿Seguro que querés eliminar "${deleteTarget?.attributes?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
      <Toast toasts={toasts} remove={remove} />
    </div>
  )
}
