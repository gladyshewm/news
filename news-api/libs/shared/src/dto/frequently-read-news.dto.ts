import { IsNumber } from 'class-validator';
import { TrendingTopicDto } from './trending-topic.dto';

export class FrequentlyReadNewsDto extends TrendingTopicDto {
  @IsNumber()
  clicksCount: number;
}
