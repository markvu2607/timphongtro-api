import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(configService.get<string>('stripe.secretKey'), {
      apiVersion: null,
    });
  }

  async createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    metadata: any,
  ): Promise<Stripe.Checkout.Session> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.configService.get<string>('web.url')}/dashboard/payment?status=success`,
      cancel_url: `${this.configService.get<string>('web.url')}/dashboard/payment?status=cancel`,
      metadata,
    });

    return session;
  }

  async verifyWebhookSignature(
    payload: Buffer,
    sig: string,
  ): Promise<Stripe.Event> {
    const endpointSecret = this.configService.get<string>(
      'stripe.webhookSecret',
    );
    return this.stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  }

  async getPriceList(productId: string) {
    return this.stripe.prices.list({
      product: productId,
      active: true,
    });
  }
}
