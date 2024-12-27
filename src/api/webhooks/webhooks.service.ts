import { HttpStatus, Injectable, RawBodyRequest } from '@nestjs/common';
import { Request, Response } from 'express';

import { StripeService } from 'src/lib/stripe/stripe.service';
import { PaymentPackagesService } from '../payment-packages/payment-packages.service';
import { CreatePaymentPackageRequestDto } from '../payment-packages/dtos/requests/create-payment-package.request.dto';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentPackagesService: PaymentPackagesService,
    private readonly postService: PostsService,
  ) {}

  async handleStripeWebhook(req: RawBodyRequest<Request>, res: Response) {
    const sig = req.headers['stripe-signature'] as string;

    let event;

    try {
      event = await this.stripeService.verifyWebhookSignature(req.rawBody, sig);
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .send(`Webhook Error: ${error.message}`);
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const metadata = session.metadata;
        const postId = metadata.postId;
        await this.postService.forcePublishPost(postId);
        break;
      case 'product.created':
        const product = event.data.object;
        const priceList = await this.stripeService.getPriceList(product.id);
        const price = priceList.data[0];

        const createPaymentPackageRequestDto =
          new CreatePaymentPackageRequestDto();
        createPaymentPackageRequestDto.stripeProductId = product.id;
        createPaymentPackageRequestDto.name = product.name;
        createPaymentPackageRequestDto.description = product.description;
        createPaymentPackageRequestDto.price = price.unit_amount;
        createPaymentPackageRequestDto.currency = price.currency;

        await this.paymentPackagesService.create(
          createPaymentPackageRequestDto,
        );
        break;
      case 'product.updated':
      // TODO: need to implement later
      case 'product.deleted':
      // TODO: need to implement later
      default:
        console.log('Unhandled event type:', event.type);
    }

    res.status(HttpStatus.OK).send('Event received');
  }
}
