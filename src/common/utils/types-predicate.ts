import Stripe from 'stripe';

export const isStripeCheckoutSession = (x): x is Stripe.Checkout.Session => {
  return x && 'id' in x && 'url' in x && 'payment_status' in x;
};
