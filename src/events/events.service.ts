import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { TicketType } from './entities/ticket-type.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(TicketType)
    private ticketTypeRepo: Repository<TicketType>,
  ) {}

  async create(dto: CreateEventDto, organizer: User): Promise<Event> {
    const event = this.eventRepo.create({
      ...dto,
      organizer,
      status: 'active',
    });
    return this.eventRepo.save(event);
  }

  async findAll(category?: string, date?: string, page: number = 1): Promise<Event[]> {
    const query = this.eventRepo.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.ticketTypes', 'ticketTypes')
      .where('event.status = :status', { status: 'active' });

    if (category) {
      query.andWhere('event.category = :category', { category });
    }

    if (date) {
      query.andWhere('event.date = :date', { date });
    }

    const take = 10;
    const skip = (page - 1) * take;
    query.take(take).skip(skip);

    return query.getMany();
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['organizer', 'ticketTypes'],
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findByOrganizer(organizerId: number): Promise<Event[]> {
    return this.eventRepo.find({
      where: { organizer: { id: organizerId } },
      relations: ['ticketTypes'],
    });
  }

  async update(id: number, dto: Partial<CreateEventDto>, organizerId: number): Promise<Event> {
    const event = await this.findOne(id);
    if (event.organizer.id !== organizerId) {
      throw new ForbiddenException('You can only edit your own events');
    }
    Object.assign(event, dto);
    return this.eventRepo.save(event);
  }

  async remove(id: number, organizerId: number): Promise<{ message: string }> {
    const event = await this.findOne(id);
    if (event.organizer.id !== organizerId) {
      throw new ForbiddenException('You can only delete your own events');
    }
    await this.eventRepo.delete(id);
    return { message: 'Event deleted successfully' };
  }

  async createTicketType(
    eventId: number,
    dto: CreateTicketTypeDto,
    organizerId: number,
  ): Promise<TicketType> {
    const event = await this.findOne(eventId);
    if (event.organizer.id !== organizerId) {
      throw new ForbiddenException('You can only add tickets to your own events');
    }
    const ticketType = this.ticketTypeRepo.create({ ...dto, event });
    return this.ticketTypeRepo.save(ticketType);
  }

  async getTicketTypes(eventId: number): Promise<TicketType[]> {
    return this.ticketTypeRepo.find({ where: { event: { id: eventId } } });
  }

  async getOrganizerRevenue(eventId: number, organizerId: number): Promise<any> {
    const event = await this.findOne(eventId);
    if (event.organizer.id !== organizerId) {
      throw new ForbiddenException('Access denied');
    }
    const ticketTypes = await this.getTicketTypes(eventId);
    const totalRevenue = ticketTypes.reduce((sum, t) => sum + t.price * t.sold, 0);
    return { eventId, totalRevenue, ticketTypes };
  }
}