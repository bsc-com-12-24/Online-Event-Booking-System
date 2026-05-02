// src/bookings/dto/booking-response.dto.ts
import { BookingStatus } from '../entities/booking.entity';
import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';

export class TicketResponseDto {
  ticketCode: string;
  qrCode: string;
  attendeeName: string;
  status: string;
}

export class PaymentResponseDto {
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  paidAt?: Date;
}

export class BookingResponseDto {
  id: number;
  bookingId: string;
  eventTitle: string;
  eventDate: Date;
  eventVenue: string;
  ticketType: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: Date;
  tickets: TicketResponseDto[];
  payment: PaymentResponseDto | null;
}