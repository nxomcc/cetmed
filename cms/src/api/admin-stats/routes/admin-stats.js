'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/admin/stats',
      handler: 'admin-stats.stats',
      config: { policies: [], middlewares: [] },
    },
  ],
};
