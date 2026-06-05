'use strict';

module.exports = {
  routes: [
    { method: 'POST',   path: '/noticias/:id/view', handler: 'noticia.registerView', config: { auth: false } },
    { method: 'GET',    path: '/noticias',           handler: 'noticia.find',         config: { auth: false } },
    { method: 'GET',    path: '/noticias/:id',       handler: 'noticia.findOne',      config: { auth: false } },
    { method: 'POST',   path: '/noticias',           handler: 'noticia.create'   },
    { method: 'PUT',    path: '/noticias/:id',       handler: 'noticia.update'   },
    { method: 'DELETE', path: '/noticias/:id',       handler: 'noticia.delete'   },
  ],
};
