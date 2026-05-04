import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TicketType } from './ticket-type.entity';

@Entity({ name: 'EVENTS' })
export class Event {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'TITLE', length: 200 })
  title: string;

  @Column({ name: 'EVENT_DATE', type: 'date' })
  date: Date;

  @Column({ name: 'TIME', length: 10 })
  time: string;

  @Column({ name: 'VENUE', length: 200 })
  venue: string;

  @Column({ name: 'CAPACITY' })
  capacity: number;

  @Column({ name: 'POSTER', nullable: true, length: 500 })
  poster: string;

  @Column({ name: 'CATEGORY', length: 50, nullable: true })
  category: string;

  @Column({ name: 'STATUS', length: 20, default: 'active' })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ORGANIZER_ID' })
  organizer: User;

  @OneToMany(() => TicketType, (ticketType) => ticketType.event, { cascade: true })
  ticketTypes: TicketType[];

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt: Date;
}