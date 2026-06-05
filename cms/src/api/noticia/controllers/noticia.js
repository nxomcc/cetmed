'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::noticia.noticia', ({ strapi }) => ({
  async registerView(ctx) {
    const { id } = ctx.params;
    const noticia = await strapi.entityService.findOne('api::noticia.noticia', id, { fields: ['vistas'] });
    if (!noticia) return ctx.notFound();
    await strapi.entityService.update('api::noticia.noticia', id, {
      data: { vistas: (noticia.vistas || 0) + 1 },
    });
    ctx.send({ ok: true });
  },
}));
