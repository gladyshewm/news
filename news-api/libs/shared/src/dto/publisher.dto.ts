import { IsString, IsUrl } from 'class-validator';
import { AuthorStatsDto } from './author-stats.dto';

export class PublisherDto {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsString()
  favicon: string;

  authorStats: AuthorStatsDto[];
}
