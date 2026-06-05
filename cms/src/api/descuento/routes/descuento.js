'use strict';

module.exports = {
  routes: [
    // custom must come before /:id
    { method: 'POST', path: '/descuentos/validar', handler: 'descuento.validar', config: { auth: false } },
    { method: 'GET',    path: '/descuentos',      handler: 'descuento.find'    },
    { method: 'GET',    path: '/descuentos/:id',  handler: 'descuento.findOne' },
    { method: 'POST',   path: '/descuentos',      handler: 'descuento.create'  },
    { method: 'PUT',    path: '/descuentos/:id',  handler: 'descuento.update'  },
    { method: 'DELETE', path: '/descuentos/:id',  handler: 'descuento.delete'  },
  ],
};
