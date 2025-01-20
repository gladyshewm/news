import { IsDate, IsIP, IsNumber, IsString } from 'class-validator';
import { TrendingTopicDto } from './trending-topic.dto';

export class NewsClickDto {
  trendingTopic: TrendingTopicDto;

  @IsNumber()
  trendingTopicId: number;

  @IsIP()
  ipAddress: string;

  @IsString()
  userAgent: string;

  @IsDate()
  clickedAt: Date;
}
