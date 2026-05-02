// src/bookings/entities/payment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  PAY_LATER = 'pay_later',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  transactionId: string;

  @ManyToOne(() => Booking, (booking) => booking.payments)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column()
  bookingId: number;

  @Column({ type: 'float' })
  amount: number;

  @Column({
    type: 'varchar2',
    length: 20,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'varchar2',
    length: 20,
  })
  method: PaymentMethod;

  @Column({ nullable: true, length: 20 })
  mobileMoneyNumber: string;

  @Column({ nullable: true, length: 50 })
  provider: string;

  @Column({ nullable: true, length: 100 })
  providerReference: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}