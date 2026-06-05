'use strict';

module.exports = {
  routes: [
    { method: 'POST',   path: '/contacto-leads',      handler: 'contacto-lead.create',  config: { auth: false } },
    { method: 'GET',    path: '/contacto-leads',      handler: 'contacto-lead.find'    },
    { method: 'GET',    path: '/contacto-leads/:id',  handler: 'contacto-lead.findOne' },
    { method: 'PUT',    path: '/contacto-leads/:id',  handler: 'contacto-lead.update'  },
    { method: 'DELETE', path: '/contacto-leads/:id',  handler: 'contacto-lead.delete'  },
  ],
};
