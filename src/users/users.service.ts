import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async update(id: number, data: Partial<User>): Promise<void> {
    await this.repo.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findByRoleAndStatus(
    role: UserRole,
    status: UserStatus,
  ): Promise<User[]> {
    return this.repo.find({ where: { role, status } });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.repo.find({ where: { role } });
  }
}
