import { IsString, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsString()
  venue: string;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsString()
  @IsOptional()
  poster?: string;

  @IsString()
  @IsOptional()
  category?: string;
}