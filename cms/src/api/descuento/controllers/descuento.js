'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::descuento.descuento', ({ strapi }) => ({
  async validar(ctx) {
    const { codigo, subtotal } = ctx.request.body;
    if (!codigo || subtotal == null) return ctx.badRequest('Código y subtotal requeridos');

    const descuento = await strapi.db.query('api::descuento.descuento').findOne({
      where: { codigo: String(codigo).toUpperCase().trim(), activo: true },
    });

    if (!descuento) return ctx.send({ valido: false, error: 'Código no válido' });
    if (descuento.fecha_expiracion && new Date(descuento.fecha_expiracion) < new Date())
      return ctx.send({ valido: false, error: 'Código expirado' });
    if (descuento.limite_usos && descuento.usos_actuales >= descuento.limite_usos)
      return ctx.send({ valido: false, error: 'Código agotado' });

    const monto =
      descuento.tipo === 'porcentaje'
        ? Math.round(subtotal * descuento.valor / 100)
        : Math.min(Number(descuento.valor), Number(subtotal));

    ctx.send({
      valido: true,
      descuento: {
        id: descuento.id,
        codigo: descuento.codigo,
        tipo: descuento.tipo,
        valor: descuento.valor,
        descripcion: descuento.descripcion,
      },
      montoDescuento: monto,
      total: subtotal - monto,
    });
  },
}));
