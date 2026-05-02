// src/bookings/booking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { PaymentWebhookController } from './payment-webhook.controller';
import { BookingService } from './booking.service';
import { QrCodeService } from './services/qr-code.service';
import { NotificationService } from './services/notification.service';
import { Booking } from './entities/booking.entity';
import { Ticket } from './entities/ticket.entity';
import { Payment } from './entities/payment.entity';
import { Notification } from './entities/notification.entity';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Ticket, Payment, Notification]),
    EventsModule,
    UsersModule,
  ],
  controllers: [BookingController, PaymentWebhookController],
  providers: [BookingService, QrCodeService, NotificationService],
  exports: [BookingService, NotificationService],
})
export class BookingModule {}