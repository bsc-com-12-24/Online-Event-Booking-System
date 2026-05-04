import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { NotificationService } from './services/notification.service';
import { NotificationType, NotificationChannel } from './entities/notification.entity';

@Controller('verify')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('organizer')
export class VerificationController {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    private notificationService: NotificationService,
  ) {}

  @Post(':qrCode')
  async verifyTicket(@Param('qrCode') qrCode: string, @Req() req) {
    const ticket = await this.ticketRepo.findOne({
      where: { qrCode },
      relations: ['event', 'customer', 'booking'],
    });

    if (!ticket) {
      throw new BadRequestException('Invalid ticket QR code');
    }

    if (ticket.event.organizer.id !== req.user.id && req.user.role !== 'admin') {
      throw new BadRequestException('You can only verify tickets for your own events');
    }

    if (ticket.status === TicketStatus.USED) {
      return {
        valid: false,
        message: 'Ticket has already been used',
        usedAt: ticket.usedAt,
        verifiedBy: ticket.verifiedBy,
      };
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      return {
        valid: false,
        message: 'Ticket has been cancelled',
      };
    }

    const eventDate = new Date(ticket.event.date);
    if (eventDate > new Date()) {
      return {
        valid: false,
        message: 'Event has not started yet',
        eventDate: ticket.event.date,
      };
    }

    ticket.status = TicketStatus.USED;
    ticket.usedAt = new Date();
    ticket.verifiedBy = req.user.id;
    await this.ticketRepo.save(ticket);

    await this.notificationService.createNotification(
      ticket.customer,
      'Ticket Verified',
      `Your ticket for "${ticket.event.title}" has been verified for entry. Enjoy the event!`,
      NotificationType.TICKET_VERIFIED,
      NotificationChannel.SMS,
      ticket.id,
    );

    return {
      valid: true,
      message: 'Ticket verified successfully',
      ticketCode: ticket.ticketCode,
      attendeeName: ticket.attendeeName,
    };
  }

  @Get(':qrCode/status')
  async checkTicketStatus(@Param('qrCode') qrCode: string, @Req() req) {
    const ticket = await this.ticketRepo.findOne({
      where: { qrCode },
      relations: ['event'],
    });

    if (!ticket) {
      throw new BadRequestException('Invalid ticket QR code');
    }

    if (ticket.event.organizer.id !== req.user.id && req.user.role !== 'admin') {
      throw new BadRequestException('Access denied');
    }

    return {
      valid: ticket.status === TicketStatus.ACTIVE,
      status: ticket.status,
      usedAt: ticket.usedAt,
    };
  }
}