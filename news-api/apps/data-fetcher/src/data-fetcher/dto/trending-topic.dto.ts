import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class Publisher {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsString()
  favicon: string;
}

export class TrendingTopicDto {
  @IsString()
  title: string;

  @IsUrl()
  url: string;

  @IsString()
  excerpt: string;

  @IsUrl()
  thumbnail: string;

  @IsString()
  language: string;

  @IsNumber()
  contentLength: number;

  @IsString({ each: true })
  authors: string[];

  publisher: Publisher;

  @IsDate()
  date: Date;
}

export class TrendingTopicsResponseDto {
  @IsBoolean()
  success: boolean;

  @IsNumber()
  size: number;

  @IsNumber()
  totalHits: number;

  @IsNumber()
  hitsPerPage: number;

  @IsNumber()
  page: number;

  @IsNumber()
  totalPages: number;

  @IsNumber()
  timeMs: number;

  @ValidateNested({ each: true })
  @Type(() => TrendingTopicDto)
  data: TrendingTopicDto[];
}
