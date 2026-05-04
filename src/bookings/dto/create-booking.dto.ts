// src/bookings/dto/create-booking.dto.ts
import { IsInt, Min, Max, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethodDto {
  MOBILE_MONEY = 'mobile_money',
  PAY_LATER = 'pay_later',
}

export class CreateBookingDto {
  @IsInt()
  @Type(() => Number)
  eventId: number;

  @IsInt()
  @Type(() => Number)
  ticketTypeId: number;

  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  quantity: number;

  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Please provide a valid phone number',
  })
  mobileMoneyNumber?: string;
}