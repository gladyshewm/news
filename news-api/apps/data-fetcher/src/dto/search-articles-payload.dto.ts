import { IsString } from 'class-validator';

export class SearchArticlesPayload {
  @IsString()
  query: string;

  @IsString()
  language: string;
}
