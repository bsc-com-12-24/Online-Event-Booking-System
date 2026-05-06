import { Booking } from '../../bookings/entities/booking.entity';
import { Notification } from './notification.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

export enum NotificationType {
  BOOKING = 'BOOKING',
  EVENT = 'EVENT',
  ADMIN = 'ADMIN',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => NotificationRecipient, (nr) => nr.notification)
  recipients: NotificationRecipient[];
}
