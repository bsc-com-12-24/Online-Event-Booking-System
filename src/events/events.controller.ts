import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('date') date?: string,
    @Query('page') page?: string,
  ) {
    return this.eventsService.findAll(category, date, page ? +page : 1);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }
}