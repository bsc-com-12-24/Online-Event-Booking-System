import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EventsService } from '../events/events.service';
import { CreateEventDto } from '../events/dto/create-event.dto';
import { CreateTicketTypeDto } from '../events/dto/create-ticket-type.dto';

@Controller('organizer')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('organizer')
export class OrganizerController {
  constructor(private eventsService: EventsService) {}

  @Get('events')
  getMyEvents(@Req() req) {
    return this.eventsService.findByOrganizer(req.user.id);
  }

  @Post('events')
  createEvent(@Body() dto: CreateEventDto, @Req() req) {
    return this.eventsService.create(dto, req.user);
  }

  @Put('events/:id')
  updateEvent(@Param('id') id: string, @Body() dto: CreateEventDto, @Req() req) {
    return this.eventsService.update(+id, dto, req.user.id);
  }

  @Delete('events/:id')
  deleteEvent(@Param('id') id: string, @Req() req) {
    return this.eventsService.remove(+id, req.user.id);
  }

  @Post('events/:id/tickets')
  createTicketType(@Param('id') id: string, @Body() dto: CreateTicketTypeDto, @Req() req) {
    return this.eventsService.createTicketType(+id, dto, req.user.id);
  }

  @Get('events/:id/revenue')
  getRevenue(@Param('id') id: string, @Req() req) {
    return this.eventsService.getOrganizerRevenue(+id, req.user.id);
  }
}