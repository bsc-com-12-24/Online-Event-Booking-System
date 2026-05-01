import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Event } from './event.entity';

@Entity('ticket_types')
export class TicketType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  type: string;

  @Column({ type: 'float' })
  price: number;

  @Column()
  quantity: number;

  @Column({ default: 0 })
  sold: number;

  @ManyToOne(() => Event, (event) => event.ticketTypes, { onDelete: 'CASCADE' })
  event: Event;
}