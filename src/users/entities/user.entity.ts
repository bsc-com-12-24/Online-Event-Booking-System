import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INACTIVE = 'inactive',
}

@Entity({ name: 'USERS' })
export class User {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'NAME', length: 100 })
  name: string;

  @Column({ name: 'EMAIL', unique: true, length: 150 })
  email: string;

  @Column({ name: 'PHONE', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'PASSWORD' })
  password: string;

  @Column({ name: 'ROLE', length: 20, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ name: 'STATUS', length: 20, default: UserStatus.ACTIVE })
  status: UserStatus;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt: Date;
}