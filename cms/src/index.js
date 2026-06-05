'use strict';

module.exports = {
  async bootstrap({ strapi }) {
    await setupPermissions(strapi);
  },
};

async function setupPermissions(strapi) {
  try {
    const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
    const publicRole = roles.find(r => r.type === 'public');

    // Public endpoints (no auth needed)
    const publicActions = [
      'api::curso.curso.find',
      'api::curso.curso.findOne',
      'api::curso.curso.registerView',
      'api::noticia.noticia.find',
      'api::noticia.noticia.findOne',
      'api::noticia.noticia.registerView',
      'api::categoria.categoria.find',
      'api::categoria.categoria.findOne',
      'api::contacto-lead.contacto-lead.create',
      'api::descuento.descuento.validar',
      'api::pago.pago.intent',
    ];

    if (publicRole) await applyPermissions(strapi, publicRole.id, publicActions);

    // Create editor role if missing
    let editorRole = roles.find(r => r.type === 'editor');
    if (!editorRole) {
      editorRole = await strapi.db.query('plugin::users-permissions.role').create({
        data: { name: 'Editor', description: 'Crear y editar contenido', type: 'editor' },
      });
    }

    const editorActions = [
      'api::curso.curso.find', 'api::curso.curso.findOne',
      'api::curso.curso.create', 'api::curso.curso.update',
      'api::noticia.noticia.find', 'api::noticia.noticia.findOne',
      'api::noticia.noticia.create', 'api::noticia.noticia.update',
      'api::categoria.categoria.find', 'api::categoria.categoria.findOne',
      'api::categoria.categoria.create', 'api::categoria.categoria.update',
      'api::contacto-lead.contacto-lead.find', 'api::contacto-lead.contacto-lead.findOne',
      'api::contacto-lead.contacto-lead.update',
      'api::pedido.pedido.find', 'api::pedido.pedido.findOne',
      'api::admin-stats.admin-stats.stats',
      'plugin::users-permissions.user.me',
    ];
    await applyPermissions(strapi, editorRole.id, editorActions);

    // Create admin-api role if missing
    let adminRole = roles.find(r => r.type === 'admin-api');
    if (!adminRole) {
      adminRole = await strapi.db.query('plugin::users-permissions.role').create({
        data: { name: 'Administrador', description: 'Acceso completo al panel de administración', type: 'admin-api' },
      });
    }

    const adminActions = [
      ...editorActions,
      'api::curso.curso.delete',
      'api::noticia.noticia.delete',
      'api::categoria.categoria.delete',
      'api::contacto-lead.contacto-lead.delete',
      'api::descuento.descuento.find', 'api::descuento.descuento.findOne',
      'api::descuento.descuento.create', 'api::descuento.descuento.update', 'api::descuento.descuento.delete',
      'api::pedido.pedido.create', 'api::pedido.pedido.update', 'api::pedido.pedido.delete',
      'plugin::users-permissions.user.find',
      'plugin::users-permissions.user.findOne',
      'plugin::users-permissions.user.create',
      'plugin::users-permissions.user.update',
      'plugin::users-permissions.user.destroy',
      'plugin::users-permissions.role.find',
      'plugin::users-permissions.role.findone',
    ];
    await applyPermissions(strapi, adminRole.id, adminActions);

    strapi.log.info('[CMS] Roles y permisos configurados');
  } catch (err) {
    strapi.log.error('[CMS] Error configurando permisos:', err.message);
  }
}

async function applyPermissions(strapi, roleId, actions) {
  for (const action of actions) {
    try {
      const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
        where: { action, role: roleId },
      });
      if (!existing) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: { action, role: roleId, enabled: true },
        });
      } else if (!existing.enabled) {
        await strapi.db.query('plugin::users-permissions.permission').update({
          where: { id: existing.id },
          data: { enabled: true },
        });
      }
    } catch {
      // permission action may not be registered yet on first boot
    }
  }
}
