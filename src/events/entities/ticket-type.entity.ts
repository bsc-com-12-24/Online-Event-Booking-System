import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Event } from './event.entity';

@Entity({ name: 'ticket_types' })
export class TicketType {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'type', length: 100 })
  type: string;

  @Column({ name: 'price', type: 'float' })
  price: number;

  @Column({ name: 'quantity' })
  quantity: number;

  @Column({ name: 'sold', default: 0 })
  sold: number;

  @ManyToOne(() => Event, (event) => event.ticketTypes, { onDelete: 'CASCADE' })
  event: Event;
}
