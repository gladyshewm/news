import { IsNumber } from 'class-validator';
import { TrendingTopicDto } from '@app/shared';

export class TrendingTopicsDBResponseDto {
  data: TrendingTopicDto[];

  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pages: number;
}
