'use strict';

/**
 * Pago controller — crea un Stripe PaymentIntent
 *
 * Para usar Flow.cl o Transbank WebPay Plus en lugar de Stripe:
 * 1. Instalar el SDK correspondiente (ej: npm install flow-cl)
 * 2. Reemplazar la lógica de Stripe por la API de Flow/Transbank
 * 3. Actualizar las env vars (FLOW_API_KEY, FLOW_SECRET_KEY, etc.)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  async intent(ctx) {
    const { items } = ctx.request.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return ctx.badRequest('No items provided');
    }

    // Verify items and calculate total from DB (never trust client-side prices)
    let amount = 0;
    for (const item of items) {
      const curso = await strapi.entityService.findOne('api::curso.curso', item.id, {
        fields: ['precio'],
      });
      if (!curso) return ctx.notFound(`Curso ${item.id} not found`);
      amount += curso.precio;
    }

    // Stripe uses smallest currency unit — CLP has no decimals (already integer)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'clp',
      automatic_payment_methods: { enabled: true },
      metadata: {
        curso_ids: items.map(i => i.id).join(','),
      },
    });

    ctx.body = { clientSecret: paymentIntent.client_secret };
  },
};
