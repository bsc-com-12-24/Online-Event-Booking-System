import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('organizers')
  getOrganizers(@Query('status') status?: string) {
    return this.adminService.getAllOrganizers(status);
  }

  @Post('organizers/:id/approve')
  approveOrganizer(@Param('id') id: string) {
    return this.adminService.approveOrganizer(+id);
  }

  @Post('organizers/:id/reject')
  rejectOrganizer(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.rejectOrganizer(+id, reason);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }
}