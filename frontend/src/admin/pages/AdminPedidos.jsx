import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as api from '../services/adminApi'
import { fmtClp, fmtDate } from '../utils/helpers'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const ESTADO_STYLES = {
  completado: 'bg-green-100 text-green-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  fallido: 'bg-red-100 text-red-700',
  rechazado: 'bg-red-100 text-red-700',
  reembolsado: 'bg-gray-100 text-gray-600',
}

export default function AdminPedidos() {
  const { toasts, toast, remove } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEstado, setFilterEstado] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.getPedidos()
      .then(r => setPedidos(r.data || []))
      .catch(() => toast('Error cargando pedidos', 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const pedidoId = searchParams.get('pedido')
    if (!pedidoId || !pedidos.length) return
    const found = pedidos.find(p => String(p.id) === String(pedidoId))
    if (found) setSelected(found)
  }, [pedidos, searchParams])

  const filtered = useMemo(() => (pedidos || []).filter(p =>
    !filterEstado || p.attributes.estado === filterEstado
  ), [pedidos, filterEstado])

  function openDetail(pedido) {
    setSelected(pedido)
    setSearchParams({ pedido: String(pedido.id) })
  }

  function closeDetail() {
    setSelected(null)
    if (searchParams.has('pedido')) setSearchParams({})
  }

  async function changeEstado(pedido, estado) {
    try {
      await api.updatePedido(pedido.id, { estado })
      setPedidos(p => p.map(x => x.id === pedido.id ? { ...x, attributes: { ...x.attributes, estado } } : x))
      if (selected?.id === pedido.id) setSelected(s => ({ ...s, attributes: { ...s.attributes, estado } }))
      toast('Estado actualizado')
    } catch {
      toast('Error al actualizar', 'error')
    }
  }

  const totalRevenue = pedidos
    .filter(p => p.attributes.estado === 'completado')
    .reduce((s, p) => s + Number(p.attributes.total || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Pedidos</h1>
          <p className="text-gray-400 text-sm mt-0.5">{pedidos.length} pedidos · {fmtClp(totalRevenue)} en ingresos</p>
        </div>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white">
          <option value="">Todos los estados</option>
          {['pendiente', 'completado', 'fallido', 'rechazado', 'reembolsado'].map(e => <option key={e}>{e}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d7a]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="material-icons text-4xl mb-2 block">shopping_bag</span>
            <p>Sin pedidos{filterEstado ? ` con estado "${filterEstado}"` : ''}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['ID', 'Cliente', 'Cursos', 'Total', 'Descuento', 'Estado', 'Fecha', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const a = p.attributes
                  const courseNames = (a.items || []).map(item => item.titulo || `Curso #${item.id}`).join(', ')
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => openDetail(p)}>
                      <td className="px-4 py-3 text-sm font-mono text-gray-500">#{p.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">{a.nombre_cliente}</p>
                        <p className="text-xs text-gray-400">{a.email_cliente}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[260px] truncate">{courseNames || 'Sin cursos'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{fmtClp(a.total)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {a.codigo_descuento ? (
                          <span className="font-mono text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">{a.codigo_descuento}</span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ESTADO_STYLES[a.estado] || 'bg-gray-100 text-gray-600'}`}>{a.estado}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{fmtDate(a.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className="material-icons text-gray-300 text-[18px]">chevron_right</span>
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeDetail}>
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">Pedido #{selected.id}</h2>
              <button onClick={closeDetail} className="p-1 text-gray-400 hover:text-gray-700"><span className="material-icons">close</span></button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-gray-400 text-xs mb-0.5">Cliente</p><p className="font-semibold">{selected.attributes.nombre_cliente}</p></div>
                <div><p className="text-gray-400 text-xs mb-0.5">Email</p><p className="font-semibold break-all">{selected.attributes.email_cliente}</p></div>
                <div><p className="text-gray-400 text-xs mb-0.5">Subtotal</p><p className="font-semibold">{fmtClp(selected.attributes.subtotal)}</p></div>
                <div><p className="text-gray-400 text-xs mb-0.5">Descuento</p><p className="font-semibold">{fmtClp(selected.attributes.descuento_monto)}</p></div>
                <div><p className="text-gray-400 text-xs mb-0.5">Total</p><p className="font-bold text-lg text-gray-900">{fmtClp(selected.attributes.total)}</p></div>
                <div><p className="text-gray-400 text-xs mb-0.5">Fecha</p><p className="font-semibold">{fmtDate(selected.attributes.createdAt)}</p></div>
              </div>

              {selected.attributes.payment_id && (
                <div><p className="text-gray-400 text-xs mb-0.5">Payment ID</p><p className="font-mono text-xs text-gray-600 break-all">{selected.attributes.payment_id}</p></div>
              )}

              <div>
                <p className="text-gray-400 text-xs mb-1">Cursos comprados</p>
                {selected.attributes.items?.length ? (
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    {selected.attributes.items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="grid grid-cols-[1fr_auto] gap-3 px-3 py-2 border-b border-gray-50 last:border-b-0">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{item.titulo || `Curso #${item.id}`}</p>
                          <p className="text-xs text-gray-400">
                            ID curso: {item.id}{item.moodle_course_id ? ` · Moodle: ${item.moodle_course_id}` : ''}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-700 shrink-0">{fmtClp(item.precio || 0)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="bg-gray-50 rounded-lg p-3 text-xs text-gray-400">Este pedido no tiene cursos asociados.</p>
                )}
              </div>

              <div>
                <p className="text-gray-400 text-xs mb-1">Cambiar estado</p>
                <div className="flex gap-2 flex-wrap">
                  {['pendiente', 'completado', 'fallido', 'rechazado', 'reembolsado'].map(e => (
                    <button
                      key={e}
                      onClick={() => changeEstado(selected, e)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${selected.attributes.estado === e ? ESTADO_STYLES[e] : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} remove={remove} />
    </div>
  )
}
