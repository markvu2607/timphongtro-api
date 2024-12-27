import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { WebhooksService } from './webhooks.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Public()
  @Post('stripe')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    return this.webhooksService.handleStripeWebhook(req, res);
  }
}
