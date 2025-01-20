import { IsDate, IsNumber, IsString, IsUrl } from 'class-validator';
import { PublisherDto } from './publisher.dto';
import { NewsClickDto } from './news-clicks.dto';

export class TrendingTopicDto {
  @IsString()
  topicId: string;

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

  @IsString()
  country: string;

  @IsNumber()
  contentLength: number;

  @IsString({ each: true })
  authors: string[];

  @IsString({ each: true })
  keywords: string[];

  publisher: PublisherDto;

  @IsDate()
  date: Date;

  newsClicks: NewsClickDto[];
}
