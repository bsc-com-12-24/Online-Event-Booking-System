import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationRecipient } from './entities/NotificationRecipient.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    @InjectRepository(NotificationRecipient)
    private recipientRepo: Repository<NotificationRecipient>,
  ) {}

  // Create notification + assign to user
  async createNotification(user: User, title: string, message: string, type: NotificationType) {
    const notification = this.notificationRepo.create({
      title,
      message,
      type,
    });

    const saved = await this.notificationRepo.save(notification);

    const recipient = this.recipientRepo.create({
      notification: saved,
      user,
    });

    await this.recipientRepo.save(recipient);

    return saved;
  }

  // Get user notifications
  async getUserNotifications(userId: number) {
    return this.recipientRepo.find({
      where: { user: { id: userId } },
      relations: ['notification'],
      order: { createdAt: 'DESC' },
    });
  }

  // Mark as read
  async markAsRead(id: number) {
    const notif = await this.recipientRepo.findOne({ where: { id } });

    if (!notif) throw new NotFoundException('Notification not found');

    notif.isRead = true;
    return this.recipientRepo.save(notif);
  }

  // Admin broadcast notification
  async broadcast(title: string, message: string, users: User[]) {
    const notification = await this.notificationRepo.save(
      this.notificationRepo.create({
        title,
        message,
        type: NotificationType.ADMIN,
      }),
    );

    const recipients = users.map((user) =>
      this.recipientRepo.create({
        user,
        notification,
      }),
    );

    return this.recipientRepo.save(recipients);
  }
}
