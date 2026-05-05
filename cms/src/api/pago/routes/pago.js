'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/pagos/intent',
      handler: 'pago.intent',
      config: {
        auth: false, // public endpoint (amount recalculated server-side)
        policies: [],
      },
    },
  ],
};
