import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
@Entity('event_notifications')
export class EventNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event)
  event: Event;

  @ManyToOne(() => Notification)
  notification: Notification;
}
