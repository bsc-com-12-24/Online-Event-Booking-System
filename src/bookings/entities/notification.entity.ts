// src/bookings/entities/notification.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
}

export enum NotificationType {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  EVENT_CANCELLATION = 'event_cancellation',
  EVENT_UPDATE = 'event_update',
  TICKET_VERIFIED = 'ticket_verified',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'clob' })
  message: string;

  @Column({
    type: 'varchar2',
    length: 20,
  })
  channel: NotificationChannel;

  @Column({
    type: 'varchar2',
    length: 30,
  })
  type: NotificationType;

  @Column({ nullable: true })
  relatedId: number; // bookingId, eventId, etc.

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}