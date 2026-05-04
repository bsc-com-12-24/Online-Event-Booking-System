// src/bookings/payment-webhook.controller.ts
import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('payments')
export class PaymentWebhookController {
  constructor(private bookingService: BookingService) {}

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async handlePaymentCallback(
    @Body() callbackData: any,
    @Headers('x-webhook-signature') signature: string,
  ) {
    // In production, verify the webhook signature here
    
    const { transactionId, status, providerReference } = callbackData;
    
    return this.bookingService.handlePaymentCallback(transactionId, {
      status,
      providerReference,
    });
  }
}