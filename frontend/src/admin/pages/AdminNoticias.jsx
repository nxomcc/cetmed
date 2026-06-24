import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../services/adminApi'
import { useAdminAuth } from '../context/AdminAuthContext'
import { imgSrc, fmtDate } from '../utils/helpers'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} style={{ width: 40, height: 22 }} className={`rounded-full relative transition-colors ${on ? 'bg-green-500' : 'bg-gray-300'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}

export default function AdminNoticias() {
  const { isAdmin } = useAdminAuth()
  const { toasts, toast, remove } = useToast()
  const [noticias, setNoticias]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const r = await api.getNoticias()
      setNoticias(r.data || [])
    } catch { toast('Error cargando noticias', 'error') }
    finally { setLoading(false) }
  }

  const filtered = useMemo(() => (noticias || []).filter(n =>
    !search || n.attributes.titulo.toLowerCase().includes(search.toLowerCase())
  ), [noticias, search])

  async function togglePublish(n) {
    const published = !!n.attributes.publishedAt
    const next = published ? null : new Date().toISOString()
    try {
      await api.updateNoticia(n.id, { publishedAt: next })
      setNoticias(p => p.map(x => x.id === n.id ? { ...x, attributes: { ...x.attributes, publishedAt: next } } : x))
      toast(published ? 'Noticia despublicada' : 'Noticia publicada')
    } catch { toast('Error al actualizar', 'error') }
  }

  async function handleDelete() {
    try {
      await api.deleteNoticia(deleteTarget.id)
      setNoticias(p => p.filter(x => x.id !== deleteTarget.id))
      toast('Noticia eliminada')
    } catch { toast('Error al eliminar', 'error') }
    finally { setDeleteTarget(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Noticias</h1>
          <p className="text-gray-400 text-sm mt-0.5">{noticias.length} noticias en total</p>
        </div>
        <Link to="/admin/noticias/nueva" className="flex items-center gap-2 bg-[#003d7a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#002d5a] transition-colors">
          <span className="material-icons text-[18px]">add</span>
          Nueva noticia
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <span className="material-icons text-gray-400 text-[18px]">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar noticia..." className="bg-transparent flex-1 text-sm outline-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d7a]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="material-icons text-4xl mb-2 block">article</span>
            <p>No se encontraron noticias</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Noticia', 'Publicada', 'Vistas', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(n => {
                  const a = n.attributes
                  const thumb = imgSrc(a.imagen, a.titulo, a.slug, 'news')
                  return (
                    <tr key={n.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {thumb
                              ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><span className="material-icons text-gray-300 text-[18px]">article</span></div>}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 max-w-[280px] truncate">{a.titulo}</p>
                            <p className="text-xs text-gray-400">{fmtDate(a.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Toggle on={!!a.publishedAt} onChange={() => togglePublish(n)} /></td>
                      <td className="px-4 py-3 text-sm text-gray-400">{a.vistas || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/admin/noticias/${n.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-[#003d7a] hover:bg-blue-50 transition-colors">
                            <span className="material-icons text-[18px]">edit</span>
                          </Link>
                          {isAdmin && (
                            <button onClick={() => setDeleteTarget(n)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
        title="Eliminar noticia"
        message={`¿Seguro que querés eliminar "${deleteTarget?.attributes?.titulo}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
      <Toast toasts={toasts} remove={remove} />
    </div>
  )
}
