import { Module } from '@nestjs/common';

import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PaymentPackagesModule } from '../payment-packages/payment-packages.module';
import { PostsModule } from '../posts/posts.module';
import { StripeModule } from 'src/lib/stripe/stripe.module';

@Module({
  imports: [PaymentPackagesModule, PostsModule, StripeModule],
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
