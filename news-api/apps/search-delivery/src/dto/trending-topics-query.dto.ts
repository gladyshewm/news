import { Transform } from 'class-transformer';
import { IsOptional, IsString, Min, Max, IsNumber } from 'class-validator';

export class TrendingTopicsQueryDto {
  @IsOptional()
  @IsString()
  language?: string = 'en';

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  sort: string = 'date';
}
