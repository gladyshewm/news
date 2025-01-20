import { IsDate, IsNumber } from 'class-validator';
import { PublisherDto } from './publisher.dto';

export class AuthorStatsDto {
  publisher: PublisherDto;

  @IsNumber()
  publisherId: number;

  @IsNumber()
  totalArticles: number;

  @IsNumber()
  totalClicks: number;

  @IsDate()
  lastUpdated: Date;
}
