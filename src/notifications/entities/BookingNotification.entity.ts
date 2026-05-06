import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
@Entity('booking_notifications')
export class BookingNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Booking)
  booking: Booking;

  @ManyToOne(() => Notification)
  notification: Notification;
}
