// src/bookings/services/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationChannel,
  NotificationType,
} from '../entities/notification.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async createNotification(
    user: User,
    title: string,
    message: string,
    type: NotificationType,
    channel: NotificationChannel,
    relatedId?: number,
  ): Promise<Notification> {
    const notification = this.notificationRepo.create({
      user,
      userId: user.id,
      title,
      message,
      type,
      channel,
      relatedId,
    });

    await this.notificationRepo.save(notification);

    // Send immediately based on channel
    await this.sendNotification(notification);

    return notification;
  }

  private async sendNotification(notification: Notification): Promise<void> {
    try {
      if (notification.channel === NotificationChannel.EMAIL) {
        await this.sendEmail(notification);
      } else if (notification.channel === NotificationChannel.SMS) {
        await this.sendSms(notification);
      }

      notification.isSent = true;
      notification.sentAt = new Date();
      await this.notificationRepo.save(notification);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
    }
  }

  private async sendEmail(notification: Notification): Promise<void> {
    // Integrate with your email service (Nodemailer, SendGrid, etc.)
    this.logger.log(`Sending email to ${notification.user.email}: ${notification.title}`);
    // TODO: Implement actual email sending
  }

  private async sendSms(notification: Notification): Promise<void> {
    // Integrate with SMS service (Twilio, Africa's Talking, etc.)
    this.logger.log(`Sending SMS to ${notification.user.phone}: ${notification.title}`);
    // TODO: Implement actual SMS sending
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await this.notificationRepo.update(
      { id: notificationId, userId },
      { isRead: true },
    );
  }

  async sendBookingConfirmation(user: User, bookingId: string, eventTitle: string): Promise<void> {
    const title = 'Booking Confirmation';
    const message = `Your booking ${bookingId} for "${eventTitle}" has been confirmed. Check your tickets for entry.`;
    await this.createNotification(
      user,
      title,
      message,
      NotificationType.BOOKING_CONFIRMATION,
      NotificationChannel.EMAIL,
    );
  }

  async sendPaymentConfirmation(user: User, bookingId: string, amount: number): Promise<void> {
    const title = 'Payment Received';
    const message = `Your payment of ${amount} for booking ${bookingId} has been received successfully.`;
    await this.createNotification(
      user,
      title,
      message,
      NotificationType.PAYMENT_CONFIRMATION,
      NotificationChannel.SMS,
    );
  }
}