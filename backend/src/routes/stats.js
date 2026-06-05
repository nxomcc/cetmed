'use strict'
const { Router } = require('express')
const { query, queryOne } = require('../db')
const { verifyToken, requireEditor } = require('../middleware/auth')

const router = Router()

router.get('/admin/stats', verifyToken, requireEditor, async (req, res) => {
  try {
    const [
      cursosCount, noticiasCount,
      leadsTotal, leadsUnread,
      revenueRow, ordersRow,
      topCursos, recentPedidos, rawMonthly,
    ] = await Promise.all([
      queryOne('SELECT COUNT(*) as n FROM cursos WHERE activo = true'),
      queryOne('SELECT COUNT(*) as n FROM noticias'),
      queryOne('SELECT COUNT(*) as n FROM leads'),
      queryOne('SELECT COUNT(*) as n FROM leads WHERE leido = false'),
      queryOne("SELECT COALESCE(SUM(total), 0) as total FROM pedidos WHERE estado = 'completado'"),
      queryOne("SELECT COUNT(*) as n FROM pedidos WHERE estado = 'completado'"),
      query('SELECT id, titulo, vistas FROM cursos ORDER BY vistas DESC LIMIT 5'),
      query('SELECT id, nombre_cliente, email_cliente, total, estado, created_at FROM pedidos ORDER BY created_at DESC LIMIT 5'),
      query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as mes,
          DATE_TRUNC('month', created_at) as mes_date,
          COALESCE(SUM(total), 0)::float as ingresos
        FROM pedidos
        WHERE estado = 'completado'
          AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY mes_date, mes
        ORDER BY mes_date ASC
      `),
    ])

    // Build last 6 months ensuring all months are present
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setDate(1)
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleDateString('es-CL', { month: 'short' })
      const key = d.toISOString().slice(0, 7)
      const found = rawMonthly.find(m => m.mes_date.toISOString().slice(0, 7) === key)
      months.push({ mes: label, ingresos: found ? Number(found.ingresos) : 0 })
    }

    res.json({
      totalCursos: Number(cursosCount.n),
      totalNoticias: Number(noticiasCount.n),
      totalLeads: Number(leadsTotal.n),
      unreadLeads: Number(leadsUnread.n),
      totalRevenue: Number(revenueRow.total),
      totalOrders: Number(ordersRow.n),
      monthlyRevenue: months,
      topCursos,
      recentPedidos: recentPedidos.map(p => ({
        id: p.id,
        nombre_cliente: p.nombre_cliente,
        email_cliente: p.email_cliente,
        total: Number(p.total),
        estado: p.estado,
        createdAt: p.created_at,
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

module.exports = router
