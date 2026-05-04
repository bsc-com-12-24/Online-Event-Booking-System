// src/bookings/booking.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { NotificationType, NotificationChannel } from './entities/notification.entity';
import { CreateBookingDto, PaymentMethodDto } from './dto/create-booking.dto';
import { EventsService } from '../events/events.service';
import { UsersService } from '../users/users.service';
import { QrCodeService } from './services/qr-code.service';
import { NotificationService } from './services/notification.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private eventsService: EventsService,
    private usersService: UsersService,
    private qrCodeService: QrCodeService,
    private notificationService: NotificationService,
  ) {}

  async createBooking(customer: User, dto: CreateBookingDto): Promise<Booking> {
    const event = await this.eventsService.findOne(dto.eventId);
    if (event.status !== 'active') {
      throw new BadRequestException('Event is not available for booking');
    }

    const eventDate = new Date(event.date);
    if (eventDate < new Date()) {
      throw new BadRequestException('Cannot book tickets for past events');
    }

    const ticketType = await this.eventsService.getTicketTypeById(dto.ticketTypeId);
    if (!ticketType || ticketType.event.id !== dto.eventId) {
      throw new BadRequestException('Invalid ticket type for this event');
    }

    const availableQuantity = ticketType.quantity - ticketType.sold;
    if (availableQuantity < dto.quantity) {
      throw new ConflictException(
        `Only ${availableQuantity} tickets available for "${ticketType.type}"`,
      );
    }

    const totalAmount = ticketType.price * dto.quantity;
    const bookingId = this.qrCodeService.generateBookingId();

    const existingPending = await this.bookingRepo.findOne({
      where: {
        customerId: customer.id,
        eventId: dto.eventId,
        status: BookingStatus.PENDING,
      },
    });

    if (existingPending) {
      await this.cancelBooking(existingPending.id, customer.id, 'Auto-cancelled - new booking initiated');
    }

    const booking = this.bookingRepo.create({
      bookingId,
      customer,
      customerId: customer.id,
      event,
      eventId: dto.eventId,
      ticketType,
      ticketTypeId: dto.ticketTypeId,
      quantity: dto.quantity,
      unitPrice: ticketType.price,
      totalAmount,
      status: BookingStatus.PENDING,
      eventDate: event.date,
    });

    const savedBooking = await this.bookingRepo.save(booking);

    const tickets: Ticket[] = [];
    for (let i = 0; i < dto.quantity; i++) {
      const ticketCode = this.qrCodeService.generateTicketCode(
        dto.eventId,
        bookingId,
        i + 1,
      );
      const qrToken = this.qrCodeService.generateUniqueQrToken(bookingId, i);
      await this.qrCodeService.generateQrCode(
        JSON.stringify({
          ticketCode,
          qrToken,
          eventId: dto.eventId,
          bookingId,
        }),
      );

      const ticket = this.ticketRepo.create({
        ticketCode,
        qrCode: qrToken,
        booking: savedBooking,
        bookingId: savedBooking.id,
        customer,
        customerId: customer.id,
        event,
        eventId: dto.eventId,
        attendeeName: customer.name,
        attendeeEmail: customer.email,
        attendeePhone: customer.phone,
        status: TicketStatus.ACTIVE,
      });
      tickets.push(await this.ticketRepo.save(ticket));
    }

    savedBooking.tickets = tickets;

    const transactionId = this.qrCodeService.generateTransactionId();
    const payment = this.paymentRepo.create({
      transactionId,
      booking: savedBooking,
      bookingId: savedBooking.id,
      amount: totalAmount,
      status: PaymentStatus.PENDING,
      method: dto.paymentMethod === PaymentMethodDto.MOBILE_MONEY
        ? PaymentMethod.MOBILE_MONEY
        : PaymentMethod.PAY_LATER,
      mobileMoneyNumber: dto.mobileMoneyNumber,
    });
    await this.paymentRepo.save(payment);
    savedBooking.payments = [payment];

    if (dto.paymentMethod === PaymentMethodDto.MOBILE_MONEY && dto.mobileMoneyNumber) {
      await this.initiateMobileMoneyPayment(savedBooking.id, dto.mobileMoneyNumber);
    }

    return savedBooking;
  }

  async initiateMobileMoneyPayment(bookingId: number, phoneNumber: string): Promise<any> {
    const booking = await this.findOne(bookingId);
    const payment = booking.payments[0];
    
    setTimeout(async () => {
      await this.handlePaymentCallback(payment.transactionId, {
        status: 'completed',
        providerReference: `REF-${Date.now()}`,
      });
    }, 5000);
    
    return {
      message: 'Payment initiated. You will receive a confirmation shortly.',
      transactionId: payment.transactionId,
      status: 'pending',
    };
  }

  async handlePaymentCallback(transactionId: string, callbackData: any): Promise<any> {
    const payment = await this.paymentRepo.findOne({
      where: { transactionId },
      relations: ['booking', 'booking.customer'],
    });
    
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    
    if (callbackData.status === 'completed') {
      payment.status = PaymentStatus.PAID;
      payment.paidAt = new Date();
      payment.providerReference = callbackData.providerReference;
      await this.paymentRepo.save(payment);
      
      payment.booking.status = BookingStatus.CONFIRMED;
      await this.bookingRepo.save(payment.booking);
      
      const ticketType = await this.eventsService.getTicketTypeById(
        payment.booking.ticketTypeId,
      );
      ticketType.sold += payment.booking.quantity;
      await this.eventsService.updateTicketTypeSold(ticketType);
      
      await this.notificationService.sendBookingConfirmation(
        payment.booking.customer,
        payment.booking.bookingId,
        payment.booking.event.title,
      );
      
      await this.notificationService.sendPaymentConfirmation(
        payment.booking.customer,
        payment.booking.bookingId,
        payment.amount,
      );
      
      return { message: 'Payment confirmed and booking completed' };
    } else if (callbackData.status === 'failed') {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
      
      payment.booking.status = BookingStatus.FAILED;
      await this.bookingRepo.save(payment.booking);
      
      return { message: 'Payment failed. Please try again.' };
    }
    
    return { message: 'Payment status unchanged' };
  }

  async findOne(id: number, customerId?: number): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['tickets', 'payments', 'customer', 'event', 'ticketType'],
    });
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    if (customerId && booking.customerId !== customerId) {
      throw new ForbiddenException('You can only view your own bookings');
    }
    
    return booking;
  }

  async findByBookingId(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { bookingId },
      relations: ['tickets', 'payments', 'customer', 'event', 'ticketType'],
    });
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    return booking;
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { customerId: userId },
      relations: ['event', 'ticketType', 'tickets', 'payments'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelBooking(bookingId: number, userId: number, reason?: string): Promise<Booking> {
    const booking = await this.findOne(bookingId, userId);
    
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }
    
    if (booking.status === BookingStatus.CONFIRMED) {
      const eventDate = new Date(booking.eventDate);
      if (eventDate < new Date()) {
        throw new BadRequestException('Cannot cancel bookings for past events');
      }
    }
    
    const eventDate = new Date(booking.eventDate);
    const hoursUntilEvent = (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    if (hoursUntilEvent < 24) {
      throw new BadRequestException('Bookings can only be cancelled at least 24 hours before the event');
    }
    
    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    await this.bookingRepo.save(booking);
    
    await this.ticketRepo.update(
      { bookingId: booking.id },
      { status: TicketStatus.CANCELLED },
    );
    
    const ticketType = await this.eventsService.getTicketTypeById(booking.ticketTypeId);
    ticketType.sold -= booking.quantity;
    await this.eventsService.updateTicketTypeSold(ticketType);
    
    await this.notificationService.createNotification(
      booking.customer,
      'Booking Cancelled',
      `Your booking ${booking.bookingId} for "${booking.event.title}" has been cancelled.`,
      NotificationType.EVENT_CANCELLATION,
      NotificationChannel.EMAIL,
      booking.id,
    );
    
    return booking;
  }

  async getEventBookings(eventId: number, organizerId?: number): Promise<Booking[]> {
    if (organizerId) {
      const event = await this.eventsService.findOne(eventId);
      if (event.organizer.id !== organizerId) {
        throw new ForbiddenException('You can only view bookings for your own events');
      }
    }
    
    return this.bookingRepo.find({
      where: { eventId },
      relations: ['customer', 'ticketType', 'tickets', 'payments'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBookingSummary(eventId: number): Promise<any> {
    const bookings = await this.getEventBookings(eventId);
    
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === BookingStatus.CONFIRMED).length;
    const cancelledBookings = bookings.filter(b => b.status === BookingStatus.CANCELLED).length;
    const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING).length;
    
    const totalRevenue = bookings
      .filter(b => b.status === BookingStatus.CONFIRMED)
      .reduce((sum, b) => sum + b.totalAmount, 0);
    
    const totalTicketsSold = bookings
      .filter(b => b.status === BookingStatus.CONFIRMED)
      .reduce((sum, b) => sum + b.quantity, 0);
    
    return {
      eventId,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      totalRevenue,
      totalTicketsSold,
    };
  }
}