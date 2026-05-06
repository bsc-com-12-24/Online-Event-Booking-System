
import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // Get logged-in user notifications
  @Get()
  getMyNotifications(@Req() req) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  // Mark as read
  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }
}
