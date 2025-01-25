import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class LatestNewsQueryDto {
  @IsOptional()
  @IsString()
  language: string = 'en';

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  topic: string;
}
