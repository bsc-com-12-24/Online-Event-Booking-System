import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { Ticket } from '../bookings/entities/ticket.entity';
import { Event } from '../events/entities/event.entity';
import { NotificationService } from '../bookings/services/notification.service';
import { Notification } from '../bookings/entities/notification.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Event, Notification]),
    UsersModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService, NotificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
