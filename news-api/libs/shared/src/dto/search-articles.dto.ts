import { IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { TrendingTopicDto } from './trending-topic.dto';
import { Type } from 'class-transformer';

export class SearchArticlesDto extends TrendingTopicDto {}

export class SearchArticlesResponseDto {
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
  @Type(() => SearchArticlesDto)
  data: SearchArticlesDto[];
}
