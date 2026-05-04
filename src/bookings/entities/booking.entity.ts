import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { TicketType } from '../../events/entities/ticket-type.entity';
import { Payment } from './payment.entity';
import { Ticket } from './ticket.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

@Entity({ name: 'BOOKINGS' })
export class Booking {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'BOOKING_ID', unique: true, length: 50 })
  bookingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'CUSTOMER_ID' })
  customer: User;

  @Column({ name: 'CUSTOMER_ID' })
  customerId: number;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'EVENT_ID' })
  event: Event;

  @Column({ name: 'EVENT_ID' })
  eventId: number;

  @ManyToOne(() => TicketType)
  @JoinColumn({ name: 'TICKET_TYPE_ID' })
  ticketType: TicketType;

  @Column({ name: 'TICKET_TYPE_ID' })
  ticketTypeId: number;

  @Column({ name: 'QUANTITY' })
  quantity: number;

  @Column({ name: 'UNIT_PRICE', type: 'float' })
  unitPrice: number;

  @Column({ name: 'TOTAL_AMOUNT', type: 'float' })
  totalAmount: number;

  @Column({ name: 'STATUS', length: 20, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ name: 'EVENT_DATE', type: 'date', nullable: true })
  eventDate: Date;

  @Column({ name: 'CANCELLATION_REASON', nullable: true })
  cancellationReason: string;

  @Column({ name: 'CANCELLED_AT', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt: Date;

  @OneToMany(() => Ticket, (ticket) => ticket.booking, { cascade: true })
  tickets: Ticket[];

  @OneToMany(() => Payment, (payment) => payment.booking, { cascade: true })
  payments: Payment[];
}