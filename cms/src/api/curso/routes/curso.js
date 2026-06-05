'use strict';

module.exports = {
  routes: [
    { method: 'POST',   path: '/cursos/:id/view', handler: 'curso.registerView', config: { auth: false } },
    { method: 'GET',    path: '/cursos',           handler: 'curso.find',         config: { auth: false } },
    { method: 'GET',    path: '/cursos/:id',       handler: 'curso.findOne',      config: { auth: false } },
    { method: 'POST',   path: '/cursos',           handler: 'curso.create'   },
    { method: 'PUT',    path: '/cursos/:id',       handler: 'curso.update'   },
    { method: 'DELETE', path: '/cursos/:id',       handler: 'curso.delete'   },
  ],
};
