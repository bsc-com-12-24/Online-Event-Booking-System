import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../bookings/entities/ticket.entity';
import { Event } from '../events/entities/event.entity';
import { NotificationService } from '../bookings/services/notification.service';
import { NotificationType, NotificationChannel } from '../bookings/entities/notification.entity';

export interface TicketVerificationResult {
  valid: boolean;
  message: string;
  usedAt?: Date;
  verifiedBy?: number;
  status?: string;
  ticketCode?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  eventTitle?: string;
  eventVenue?: string;
  verifiedAt?: Date;
  eventDate?: Date;
  isEventStarted?: boolean;
  canVerify?: boolean;
}

export interface BatchVerificationResult {
  qrCode: string;
  valid: boolean;
  message: string;
  usedAt?: Date;
  verifiedBy?: number;
  status?: string;
  ticketCode?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  eventTitle?: string;
  eventVenue?: string;
  verifiedAt?: Date;
}

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    private notificationService: NotificationService,
  ) {}

  async verifyTicket(qrCode: string, userId: number, userRole: string): Promise<TicketVerificationResult> {
    const ticket = await this.ticketRepo.findOne({
      where: { qrCode },
      relations: ['event', 'event.organizer', 'customer', 'booking'],
    });

    if (!ticket) {
      throw new BadRequestException('Invalid ticket QR code. Please check and try again.');
    }

    if (userRole !== 'admin' && ticket.event.organizer.id !== userId) {
      throw new ForbiddenException('You can only verify tickets for your own events.');
    }

    const event = await this.eventRepo.findOne({
      where: { id: ticket.eventId, status: 'active' },
    });

    if (!event) {
      throw new BadRequestException('The event for this ticket no longer exists.');
    }

    if (ticket.status === TicketStatus.USED) {
      return {
        valid: false,
        message: 'Ticket has already been used.',
        usedAt: ticket.usedAt,
        verifiedBy: ticket.verifiedBy,
        status: 'already_used',
      };
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      return {
        valid: false,
        message: 'Ticket has been cancelled.',
        status: 'cancelled',
      };
    }

    const eventDate = new Date(event.date);
    const currentDate = new Date();
    
    if (eventDate > currentDate) {
      const hoursUntilEvent = Math.ceil((eventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60));
      return {
        valid: false,
        message: `Event has not started yet. ${hoursUntilEvent} hours remaining.`,
        eventDate: event.date,
        status: 'event_not_started',
      };
    }

    ticket.status = TicketStatus.USED;
    ticket.usedAt = new Date();
    ticket.verifiedBy = userId;
    await this.ticketRepo.save(ticket);

    await this.notificationService.createNotification(
      ticket.customer,
      'Ticket Verified - Entry Granted',
      `Your ticket for "${ticket.event.title}" at ${ticket.event.venue} has been verified. Welcome to the event!`,
      NotificationType.TICKET_VERIFIED,
      NotificationChannel.SMS,
      ticket.id,
    );

    return {
      valid: true,
      message: 'Ticket verified successfully. Entry granted.',
      ticketCode: ticket.ticketCode,
      attendeeName: ticket.attendeeName,
      attendeeEmail: ticket.attendeeEmail,
      eventTitle: ticket.event.title,
      eventVenue: ticket.event.venue,
      verifiedAt: ticket.usedAt,
      status: 'success',
    };
  }

  async checkTicketStatus(qrCode: string, userId: number, userRole: string): Promise<TicketVerificationResult> {
    const ticket = await this.ticketRepo.findOne({
      where: { qrCode },
      relations: ['event', 'event.organizer', 'customer'],
    });

    if (!ticket) {
      throw new BadRequestException('Invalid ticket QR code.');
    }

    if (userRole !== 'admin' && ticket.event.organizer.id !== userId) {
      throw new ForbiddenException('Access denied.');
    }

    const eventDate = new Date(ticket.event.date);
    const currentDate = new Date();
    const isEventStarted = eventDate <= currentDate;

    return {
      valid: ticket.status === TicketStatus.ACTIVE,
      status: ticket.status,
      usedAt: ticket.usedAt,
      ticketCode: ticket.ticketCode,
      attendeeName: ticket.attendeeName,
      eventTitle: ticket.event.title,
      eventDate: ticket.event.date,
      isEventStarted,
      canVerify: isEventStarted && ticket.status === TicketStatus.ACTIVE,
      message: ticket.status === TicketStatus.ACTIVE ? 'Ticket is valid and ready for verification' : 'Ticket is not valid',
    };
  }

  async getEventTickets(eventId: number, userId: number, userRole: string): Promise<any> {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['organizer'],
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    if (userRole !== 'admin' && event.organizer.id !== userId) {
      throw new ForbiddenException('Access denied. You can only view tickets for your own events.');
    }

    const tickets = await this.ticketRepo.find({
      where: { eventId },
      relations: ['customer', 'booking'],
      order: { createdAt: 'DESC' },
    });

    const summary = {
      totalTickets: tickets.length,
      activeTickets: tickets.filter(t => t.status === TicketStatus.ACTIVE).length,
      usedTickets: tickets.filter(t => t.status === TicketStatus.USED).length,
      cancelledTickets: tickets.filter(t => t.status === TicketStatus.CANCELLED).length,
      tickets: tickets.map(t => ({
        ticketCode: t.ticketCode,
        qrCode: t.qrCode,
        status: t.status,
        attendeeName: t.attendeeName,
        attendeeEmail: t.attendeeEmail,
        usedAt: t.usedAt,
        createdAt: t.createdAt,
      })),
    };

    return summary;
  }

  async validateBatchTickets(qrCodes: string[], userId: number, userRole: string): Promise<any> {
    const results: BatchVerificationResult[] = [];
    
    for (const qrCode of qrCodes) {
      try {
        const result = await this.verifyTicket(qrCode, userId, userRole);
        results.push({
          qrCode,
          valid: result.valid,
          message: result.message,
          usedAt: result.usedAt,
          verifiedBy: result.verifiedBy,
          status: result.status,
          ticketCode: result.ticketCode,
          attendeeName: result.attendeeName,
          attendeeEmail: result.attendeeEmail,
          eventTitle: result.eventTitle,
          eventVenue: result.eventVenue,
          verifiedAt: result.verifiedAt,
        });
      } catch (error) {
        results.push({
          qrCode,
          valid: false,
          message: error.message,
        });
      }
    }

    return {
      totalScanned: qrCodes.length,
      validCount: results.filter(r => r.valid === true).length,
      invalidCount: results.filter(r => r.valid === false).length,
      results,
    };
  }
}
