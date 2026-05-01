import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole, UserStatus } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(private usersService: UsersService) {}

  async getPendingOrganizers() {
    return this.usersService.findByRoleAndStatus(UserRole.ORGANIZER, UserStatus.PENDING);
  }

  async getAllOrganizers(status?: string) {
    if (status) {
      return this.usersService.findByRoleAndStatus(UserRole.ORGANIZER, status as UserStatus);
    }
    return this.usersService.findByRole(UserRole.ORGANIZER);
  }

  async approveOrganizer(id: number) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersService.update(id, { status: UserStatus.ACTIVE });
    return { message: 'Organizer approved successfully' };
  }

  async rejectOrganizer(id: number, reason: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersService.update(id, { status: UserStatus.INACTIVE });
    return { message: 'Organizer rejected', reason };
  }

  async deleteUser(id: number) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  async getAllUsers() {
    return this.usersService.findAll();
  }
}