import { useState, useEffect, useMemo } from 'react'
import * as api from '../services/adminApi'
import { fmtDate } from '../utils/helpers'
import { useAdminAuth } from '../context/AdminAuthContext'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

export default function AdminLeads() {
  const { isAdmin } = useAdminAuth()
  const { toasts, toast, remove } = useToast()

  const [leads, setLeads]             = useState([])
  const [stats, setStats]             = useState(null)
  const [loading, setLoading]         = useState(true)
  const [showStats, setShowStats]     = useState(false)
  const [filterLeido, setFilterLeido] = useState('')
  const [filterArea, setFilterArea]   = useState('')
  const [filterCurso, setFilterCurso] = useState('')
  const [selected, setSelected]       = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [exporting, setExporting]     = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const leadsRes = await api.getLeads()
      setLeads(leadsRes.data || [])
    } catch {
      toast('Error cargando leads', 'error')
    } finally {
      setLoading(false)
    }
    // Stats are optional — fetch independently so a failure doesn't block the list
    try {
      const statsRes = await api.getLeadsStats()
      setStats(statsRes)
    } catch {}
  }

  // Unique areas and cursos for filter dropdowns
  const areas = useMemo(() => {
    const s = new Set(leads.map(l => l.attributes.area).filter(Boolean))
    return [...s].sort()
  }, [leads])

  const cursosEnLeads = useMemo(() => {
    const map = new Map()
    leads.forEach(l => {
      if (l.attributes.curso_id && l.attributes.cursoTitulo) {
        map.set(l.attributes.curso_id, l.attributes.cursoTitulo)
      }
    })
    return [...map.entries()]
  }, [leads])

  const filtered = useMemo(() => (leads || []).filter(l => {
    const a = l.attributes
    if (filterLeido === 'no_leido' && a.leido) return false
    if (filterLeido === 'leido' && !a.leido) return false
    if (filterArea && a.area !== filterArea) return false
    if (filterCurso && String(a.curso_id) !== filterCurso) return false
    return true
  }), [leads, filterLeido, filterArea, filterCurso])

  const unreadCount = leads.filter(l => !l.attributes.leido).length

  async function openLead(lead) {
    setSelected(lead)
    if (!lead.attributes.leido) {
      try {
        await api.markLeadRead(lead.id)
        setLeads(p => p.map(x => x.id === lead.id ? { ...x, attributes: { ...x.attributes, leido: true } } : x))
      } catch {}
    }
  }

  async function handleDelete() {
    try {
      await api.deleteLead(deleteTarget.id)
      setLeads(p => p.filter(x => x.id !== deleteTarget.id))
      if (selected?.id === deleteTarget.id) setSelected(null)
      toast('Lead eliminado')
    } catch { toast('Error al eliminar', 'error') }
    finally { setDeleteTarget(null) }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const filters = {}
      if (filterArea) filters.area = filterArea
      if (filterCurso) filters.curso_id = filterCurso
      await api.downloadLeadsCSV(filters)
    } catch { toast('Error al exportar', 'error') }
    finally { setExporting(false) }
  }

  const maxByArea  = Math.max(1, ...(stats?.byArea  || []).map(r => r.total))
  const maxByCurso = Math.max(1, ...(stats?.byCurso || []).map(r => r.total))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Leads de contacto</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {leads.length} mensajes
            {unreadCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount} sin leer</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(p => !p)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl font-medium transition-colors border ${showStats ? 'bg-[#003d7a] text-white border-[#003d7a]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <span className="material-icons text-[16px]">bar_chart</span>
            Estadísticas
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <span className="material-icons text-[16px]">{exporting ? 'refresh' : 'download'}</span>
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {/* Stats panel */}
      {showStats && stats && (
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="material-icons text-[16px] text-[#003d7a]">category</span>
              Leads por área
            </h3>
            <div className="space-y-2">
              {(stats.byArea || []).map(r => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 truncate max-w-[70%]">{r.label}</span>
                    <span className="font-bold text-gray-800">{r.total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#003d7a] rounded-full transition-all"
                      style={{ width: `${(r.total / maxByArea) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {!stats.byArea?.length && <p className="text-xs text-gray-400 text-center py-2">Sin datos aún</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="material-icons text-[16px] text-[#F0A500]">school</span>
              Leads por curso
            </h3>
            <div className="space-y-2">
              {(stats.byCurso || []).map(r => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 truncate max-w-[70%]">{r.label}</span>
                    <span className="font-bold text-gray-800">{r.total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F0A500] rounded-full transition-all"
                      style={{ width: `${(r.total / maxByCurso) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {!stats.byCurso?.length && <p className="text-xs text-gray-400 text-center py-2">Sin datos aún</p>}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Read status */}
        {['', 'no_leido', 'leido'].map((v, i) => (
          <button
            key={v}
            onClick={() => setFilterLeido(v)}
            className={`text-sm px-3 py-1.5 rounded-xl font-medium transition-colors ${filterLeido === v ? 'bg-[#003d7a] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {['Todos', 'Sin leer', 'Leídos'][i]}
          </button>
        ))}

        {/* Area filter */}
        {areas.length > 0 && (
          <select
            value={filterArea}
            onChange={e => setFilterArea(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-medium focus:outline-none focus:border-[#003d7a]"
          >
            <option value="">Todas las áreas</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}

        {/* Curso filter */}
        {cursosEnLeads.length > 0 && (
          <select
            value={filterCurso}
            onChange={e => setFilterCurso(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-medium focus:outline-none focus:border-[#003d7a] max-w-[220px]"
          >
            <option value="">Todos los cursos</option>
            {cursosEnLeads.map(([id, titulo]) => (
              <option key={id} value={String(id)}>{titulo}</option>
            ))}
          </select>
        )}

        {(filterArea || filterCurso || filterLeido) && (
          <button
            onClick={() => { setFilterArea(''); setFilterCurso(''); setFilterLeido('') }}
            className="text-sm px-3 py-1.5 rounded-xl font-medium bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
          >
            <span className="material-icons text-[14px] align-middle mr-0.5">close</span>
            Limpiar filtros
          </button>
        )}

        <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} resultados</span>
      </div>

      {/* List + Detail */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d7a]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 text-center py-12 text-gray-400">
              <span className="material-icons text-3xl mb-1 block">contact_mail</span>
              <p className="text-sm">Sin mensajes</p>
            </div>
          ) : filtered.map(lead => {
            const a = lead.attributes
            const isSelected = selected?.id === lead.id
            return (
              <button
                key={lead.id}
                onClick={() => openLead(lead)}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${
                  isSelected ? 'border-[#003d7a] ring-1 ring-[#003d7a]/20' : 'border-gray-100'
                } ${!a.leido ? 'border-l-4 border-l-[#F0A500]' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!a.leido && <span className="w-2 h-2 rounded-full bg-[#F0A500] shrink-0" />}
                      <p className="text-sm font-semibold text-gray-900 truncate">{a.nombre}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{a.email}</p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {a.area && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-md">
                          <span className="material-icons text-[10px]">category</span>
                          {a.area}
                        </span>
                      )}
                      {a.cursoTitulo && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-md max-w-[160px] truncate">
                          <span className="material-icons text-[10px]">school</span>
                          <span className="truncate">{a.cursoTitulo}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{a.mensaje}</p>
                  </div>
                  <p className="text-xs text-gray-300 shrink-0 mt-0.5">{fmtDate(a.createdAt)}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Mensaje de {selected.attributes.nombre}</h2>
                <div className="flex gap-1">
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteTarget(selected)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-icons text-[18px]">delete</span>
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
                    <span className="material-icons text-[18px]">close</span>
                  </button>
                </div>
              </div>

              {/* Interest highlight */}
              {(selected.attributes.area || selected.attributes.cursoTitulo) && (
                <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-100 rounded-xl">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Interés declarado</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.attributes.area && (
                      <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-lg px-3 py-1.5">
                        <span className="material-icons text-[16px] text-blue-600">category</span>
                        <div>
                          <p className="text-[10px] text-gray-400">Área</p>
                          <p className="text-sm font-bold text-gray-800">{selected.attributes.area}</p>
                        </div>
                      </div>
                    )}
                    {selected.attributes.cursoTitulo && (
                      <div className="flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-3 py-1.5 flex-1 min-w-0">
                        <span className="material-icons text-[16px] text-amber-500">school</span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400">Curso</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{selected.attributes.cursoTitulo}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <dl className="grid sm:grid-cols-2 gap-4 mb-5 text-sm">
                {[
                  ['Nombre',   selected.attributes.nombre],
                  ['Email',    selected.attributes.email],
                  ['Teléfono', selected.attributes.telefono || '—'],
                  ['RUT',      selected.attributes.rut || '—'],
                  ['Empresa',  selected.attributes.empresa || '—'],
                  ['Tipo',     selected.attributes.tipo || '—'],
                  ['Fecha',    fmtDate(selected.attributes.createdAt)],
                ].map(([label, val]) => (
                  <div key={label}>
                    <dt className="text-xs text-gray-400 font-medium mb-0.5">{label}</dt>
                    <dd className="font-semibold text-gray-800">{val}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="text-xs text-gray-400 font-medium mb-1.5">Mensaje</p>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selected.attributes.mensaje}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                <a
                  href={`mailto:${selected.attributes.email}?subject=Re: ${selected.attributes.cursoTitulo ? `Consulta sobre "${selected.attributes.cursoTitulo}"` : 'Contacto CETMED'}`}
                  className="flex items-center gap-2 bg-[#003d7a] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#002d5a] transition-colors"
                >
                  <span className="material-icons text-[18px]">reply</span>
                  Responder por email
                </a>
                {selected.attributes.telefono && (
                  <a
                    href={`tel:${selected.attributes.telefono}`}
                    className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <span className="material-icons text-[18px]">phone</span>
                    Llamar
                  </a>
                )}
                {selected.attributes.telefono && (
                  <a
                    href={`https://wa.me/${selected.attributes.telefono.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${selected.attributes.nombre}, te contactamos desde CETMED`)}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-50 transition-colors"
                  >
                    <span className="material-icons text-[18px]">chat</span>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <span className="material-icons text-4xl mb-2 block">contact_mail</span>
                <p className="text-sm">Seleccioná un mensaje para verlo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar lead"
        message={`¿Eliminar el mensaje de "${deleteTarget?.attributes?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
      <Toast toasts={toasts} remove={remove} />
    </div>
  )
}
