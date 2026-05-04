// src/bookings/entities/ticket.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum TicketStatus {
  ACTIVE = 'active',
  USED = 'used',
  CANCELLED = 'cancelled',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  ticketCode: string; // Unique ticket code

  @Column({ unique: true, length: 255 })
  qrCode: string; // QR code data (unique token)

  @ManyToOne(() => Booking, (booking) => booking.tickets)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column()
  bookingId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column()
  customerId: number;

  @ManyToOne(() => Event, { eager: true })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: number;

  @Column({ length: 100 })
  attendeeName: string;

  @Column({ length: 150 })
  attendeeEmail: string;

  @Column({ length: 20, nullable: true })
  attendeePhone: string;

  @Column({
    type: 'varchar2',
    length: 20,
    default: TicketStatus.ACTIVE,
  })
  status: TicketStatus;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  @Column({ nullable: true })
  verifiedBy: number; // Staff user ID who scanned the ticket

  @CreateDateColumn()
  createdAt: Date;
}