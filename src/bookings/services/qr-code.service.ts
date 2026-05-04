// src/bookings/services/qr-code.service.ts
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class QrCodeService {
  async generateQrCode(data: string): Promise<string> {
    try {
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  generateUniqueQrToken(bookingId: string, ticketId: number): string {
    const payload = `${bookingId}-${ticketId}-${Date.now()}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  generateTicketCode(eventId: number, bookingId: string, sequence: number): string {
    const prefix = 'TKT';
    const eventPart = eventId.toString().padStart(4, '0');
    const bookingPart = bookingId.slice(-6);
    const seqPart = sequence.toString().padStart(3, '0');
    return `${prefix}-${eventPart}-${bookingPart}-${seqPart}`;
  }

  generateBookingId(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const sequence = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `BK-${year}${month}${day}-${random}-${sequence}`;
  }

  generateTransactionId(): string {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-10);
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }
}