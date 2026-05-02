import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('USERS')
export class User {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id: number;

  @Column({ name: 'NAME', type: 'varchar2', length: 255 })
  name: string;

  @Column({ name: 'EMAIL', type: 'varchar2', length: 255, unique: true })
  email: string;

  @Column({ name: 'PASSWORD', type: 'varchar2', length: 255 })
  password: string;

  @Column({ name: 'ROLE', type: 'varchar2', length: 20, default: UserRole.CUSTOMER })
  role: string;

  @Column({ name: 'PHONE', type: 'varchar2', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'STATUS', type: 'varchar2', length: 20, default: UserStatus.PENDING })
  status: string;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'timestamp' })
  updatedAt: Date;
}