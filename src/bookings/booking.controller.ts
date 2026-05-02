// src/bookings/booking.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(AuthGuard('jwt'))
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  @Roles('customer')
  @UseGuards(RolesGuard)
  createBooking(@Req() req, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user, dto);
  }

  @Get('user/my')
  @Roles('customer')
  @UseGuards(RolesGuard)
  getUserBookings(@Req() req) {
    return this.bookingService.getUserBookings(req.user.id);
  }

  @Get(':id')
  getBooking(@Param('id') id: string, @Req() req) {
    // Customers can see their own, admins can see any
    if (req.user.role === 'customer') {
      return this.bookingService.findOne(+id, req.user.id);
    }
    return this.bookingService.findOne(+id);
  }

  @Get('lookup/:bookingId')
  lookupByBookingId(@Param('bookingId') bookingId: string) {
    return this.bookingService.findByBookingId(bookingId);
  }

  @Post(':id/cancel')
  @Roles('customer')
  @UseGuards(RolesGuard)
  cancelBooking(@Param('id') id: string, @Req() req, @Body('reason') reason?: string) {
    return this.bookingService.cancelBooking(+id, req.user.id, reason);
  }

  @Get('event/:eventId/summary')
  @Roles('organizer', 'admin')
  @UseGuards(RolesGuard)
  getEventBookingSummary(@Param('eventId') eventId: string, @Req() req) {
    if (req.user.role === 'organizer') {
      return this.bookingService.getBookingSummary(+eventId);
    }
    return this.bookingService.getBookingSummary(+eventId);
  }

  @Get('event/:eventId/bookings')
  @Roles('organizer', 'admin')
  @UseGuards(RolesGuard)
  getEventBookings(@Param('eventId') eventId: string, @Req() req) {
    if (req.user.role === 'organizer') {
      return this.bookingService.getEventBookings(+eventId, req.user.id);
    }
    return this.bookingService.getEventBookings(+eventId);
  }
}