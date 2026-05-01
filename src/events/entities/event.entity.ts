import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  ManyToOne,
  OneToMany 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TicketType } from './ticket-type.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ length: 10 })
  time: string;

  @Column({ length: 200 })
  venue: string;

  @Column()
  capacity: number;

  @Column({ nullable: true, length: 500 })
  poster: string;

  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ type: 'varchar2', length: 20, default: 'active' })
  status: string;

  @ManyToOne(() => User, { eager: true })
  organizer: User;

  @OneToMany(() => TicketType, (ticketType) => ticketType.event, { cascade: true })
  ticketTypes: TicketType[];

  @CreateDateColumn()
  createdAt: Date;
}