import { IsString } from 'class-validator';

export class SearchArticlesQueryDto {
  @IsString()
  articleQuery: string;

  @IsString()
  language: string;
}
