import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getStats } from '../services/adminApi'
import { fmtClp, fmtDate } from '../utils/helpers'

const ESTADO_COLOR = {
  completado: 'bg-green-100 text-green-700',
  pendiente: 'bg-yellow-100 text-yellow-700',
  fallido: 'bg-red-100 text-red-700',
  rechazado: 'bg-red-100 text-red-700',
  reembolsado: 'bg-gray-100 text-gray-600',
}

function StatCard({ icon, label, value, sub, color = 'blue', to }) {
  const colors = {
    blue: 'bg-blue-50 text-[#003d7a]',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-600',
  }

  const content = (
    <>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <span className="material-icons">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-none mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </>
  )

  const className = 'bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 transition hover:border-[#003d7a]/20 hover:shadow-sm'
  return to ? <Link to={to} className={className}>{content}</Link> : <div className={className}>{content}</div>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003d7a]" />
    </div>
  )

  if (!stats) return (
    <div className="text-center py-20 text-gray-400">
      <span className="material-icons text-5xl mb-2 block">error_outline</span>
      <p>No se pudieron cargar las estadísticas.</p>
    </div>
  )

  const noRevenue = !stats.monthlyRevenue?.length || stats.monthlyRevenue.every(m => Number(m.ingresos || 0) === 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Resumen general del sitio</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard to="/admin/pedidos" icon="payments" label="Ingresos totales" value={fmtClp(stats.totalRevenue)} sub={`${stats.totalOrders} pedidos completados`} color="green" />
        <StatCard to="/admin/cursos" icon="school" label="Cursos activos" value={stats.totalCursos} color="blue" />
        <StatCard to="/admin/noticias" icon="article" label="Noticias" value={stats.totalNoticias} color="blue" />
        <StatCard to="/admin/leads" icon="contact_mail" label="Leads sin leer" value={stats.unreadLeads} sub={`${stats.totalLeads} en total`} color={stats.unreadLeads > 0 ? 'red' : 'blue'} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Ingresos mensuales</h2>
        {noRevenue ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            Aún no hay ingresos registrados
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthlyRevenue} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => v === 0 ? '0' : fmtClp(v)} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                formatter={(v) => [fmtClp(v), 'Ingresos']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="ingresos" fill="#003d7a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Cursos más comprados</h2>
            <Link to="/admin/pedidos" className="text-xs font-semibold text-[#003d7a] hover:underline">Ver pedidos</Link>
          </div>
          {!stats.topCursosVendidos?.length ? (
            <p className="text-gray-400 text-sm text-center py-8">Sin compras registradas aún</p>
          ) : (
            <ul className="space-y-3">
              {stats.topCursosVendidos.map((c, i) => (
                <li key={c.id || i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.titulo}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-[#003d7a] rounded-full" style={{ width: `${Math.min((c.vendidos / (stats.topCursosVendidos[0]?.vendidos || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{c.vendidos} ventas</p>
                    <p className="text-xs text-gray-400">{fmtClp(c.ingresos)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Últimos pedidos</h2>
            <Link to="/admin/pedidos" className="text-xs font-semibold text-[#003d7a] hover:underline">Ver todos</Link>
          </div>
          {!stats.recentPedidos?.length ? (
            <p className="text-gray-400 text-sm text-center py-8">Sin pedidos aún</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentPedidos.map((p, i) => (
                <li key={p.id || i}>
                  <Link to={`/admin/pedidos?pedido=${p.id}`} className="flex items-center gap-3 rounded-xl p-2 -m-2 transition hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="material-icons text-gray-400 text-[16px]">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.nombre_cliente}</p>
                      <p className="text-xs text-gray-400">{fmtDate(p.createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">{fmtClp(p.total)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLOR[p.estado] || 'bg-gray-100 text-gray-600'}`}>
                        {p.estado}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
