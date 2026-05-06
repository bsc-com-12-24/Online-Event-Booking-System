import { IsNumber } from 'class-validator';

export class MarkAsReadDto {
  @IsNumber()
  notificationId: number;
}
