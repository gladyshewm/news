import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { TrendingTopicDto } from '@app/shared';

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
