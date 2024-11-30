import { IsNumber } from 'class-validator';
import { TrendingTopicDto } from './trending-topic.dto';

export class TrendingTopicsDBResponseDto {
  data: TrendingTopicDto[];

  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pages: number;
}
