'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::curso.curso', ({ strapi }) => ({
  async find(ctx) {
    // Public requests only see active courses
    if (!ctx.state.user) {
      ctx.query.filters = { ...(ctx.query.filters || {}), activo: true };
    }
    return super.find(ctx);
  },

  async registerView(ctx) {
    const { id } = ctx.params;
    const curso = await strapi.entityService.findOne('api::curso.curso', id, { fields: ['vistas'] });
    if (!curso) return ctx.notFound();
    await strapi.entityService.update('api::curso.curso', id, {
      data: { vistas: (curso.vistas || 0) + 1 },
    });
    ctx.send({ ok: true });
  },
}));
