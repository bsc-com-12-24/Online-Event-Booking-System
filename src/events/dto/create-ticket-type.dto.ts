import { IsString, IsNumber, Min } from 'class-validator';

export class CreateTicketTypeDto {
  @IsString()
  type: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}