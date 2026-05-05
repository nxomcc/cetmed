'use strict';

module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'please-change-this-secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'please-change-this-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'please-change-this-salt'),
    },
  },
});
