import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { VerificationService, TicketVerificationResult } from './verification.service';

@Controller('verify')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('ticket/:qrCode')
  @Roles('organizer', 'admin')
  async verifyTicket(@Param('qrCode') qrCode: string, @Req() req): Promise<TicketVerificationResult> {
    return this.verificationService.verifyTicket(
      qrCode,
      req.user.id,
      req.user.role,
    );
  }

  @Get('ticket/:qrCode/status')
  @Roles('organizer', 'admin')
  async checkTicketStatus(@Param('qrCode') qrCode: string, @Req() req): Promise<TicketVerificationResult> {
    return this.verificationService.checkTicketStatus(
      qrCode,
      req.user.id,
      req.user.role,
    );
  }

  @Get('event/:eventId/tickets')
  @Roles('organizer', 'admin')
  async getEventTickets(@Param('eventId') eventId: string, @Req() req): Promise<any> {
    return this.verificationService.getEventTickets(
      +eventId,
      req.user.id,
      req.user.role,
    );
  }

  @Post('batch')
  @Roles('organizer', 'admin')
  async batchVerify(@Body() body: { qrCodes: string[] }, @Req() req): Promise<any> {
    if (!body.qrCodes || body.qrCodes.length === 0) {
      throw new BadRequestException('Please provide at least one QR code.');
    }
    return this.verificationService.validateBatchTickets(
      body.qrCodes,
      req.user.id,
      req.user.role,
    );
  }
}
