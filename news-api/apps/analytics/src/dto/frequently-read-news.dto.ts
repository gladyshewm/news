import { TrendingTopicDto } from '@app/shared';
import { IsNumber } from 'class-validator';

export class FrequentlyReadNewsDto extends TrendingTopicDto {
  @IsNumber()
  clicksCount: number;
}
