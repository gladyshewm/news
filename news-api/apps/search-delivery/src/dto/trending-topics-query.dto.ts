import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Min,
  Max,
  IsNumber,
  IsArray,
} from 'class-validator';

export class TrendingTopicsQueryDto {
  @IsOptional()
  @IsString()
  language?: string = 'en';

  @IsOptional()
  @IsString()
  sort?: string = 'date';

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsString({ each: true })
  topic?: string[];

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsString({ each: true })
  publisher?: string[];

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
}
