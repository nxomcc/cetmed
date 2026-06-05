'use strict';

module.exports = {
  async stats(ctx) {
    if (!ctx.state.user) return ctx.unauthorized();

    try {
      const [totalCursos, totalNoticias, totalLeads, unreadLeads, allPedidos, topCursos, recentPedidos] =
        await Promise.all([
          strapi.db.query('api::curso.curso').count(),
          strapi.db.query('api::noticia.noticia').count(),
          strapi.db.query('api::contacto-lead.contacto-lead').count(),
          strapi.db.query('api::contacto-lead.contacto-lead').count({ where: { leido: false } }),
          strapi.db.query('api::pedido.pedido').findMany({
            where: { estado: 'completado' },
            select: ['total', 'createdAt'],
          }),
          strapi.db.query('api::curso.curso').findMany({
            orderBy: { vistas: 'desc' },
            limit: 5,
            select: ['titulo', 'vistas', 'precio'],
          }),
          strapi.db.query('api::pedido.pedido').findMany({
            orderBy: { createdAt: 'desc' },
            limit: 10,
            select: ['nombre_cliente', 'email_cliente', 'total', 'estado', 'createdAt', 'items'],
          }),
        ]);

      const totalRevenue = allPedidos.reduce((s, p) => s + (p.total || 0), 0);
      const totalOrders = allPedidos.length;

      // Revenue per month (last 6 months)
      const now = new Date();
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const slice = allPedidos.filter(p => {
          const d = new Date(p.createdAt);
          return d >= start && d < end;
        });
        monthlyRevenue.push({
          mes: start.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' }),
          ingresos: slice.reduce((s, p) => s + (p.total || 0), 0),
          pedidos: slice.length,
        });
      }

      ctx.send({ totalCursos, totalNoticias, totalLeads, unreadLeads, totalRevenue, totalOrders, topCursos, monthlyRevenue, recentPedidos });
    } catch (err) {
      ctx.throw(500, err.message);
    }
  },
};
