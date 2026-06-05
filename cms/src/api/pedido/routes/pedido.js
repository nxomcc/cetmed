'use strict';

module.exports = {
  routes: [
    { method: 'GET',    path: '/pedidos',      handler: 'pedido.find'    },
    { method: 'GET',    path: '/pedidos/:id',  handler: 'pedido.findOne' },
    { method: 'POST',   path: '/pedidos',      handler: 'pedido.create'  },
    { method: 'PUT',    path: '/pedidos/:id',  handler: 'pedido.update'  },
    { method: 'DELETE', path: '/pedidos/:id',  handler: 'pedido.delete'  },
  ],
};
