import { IsString } from 'class-validator';

export class SearchPublishersPayload {
  @IsString()
  query: string;

  @IsString()
  country: string;

  @IsString()
  language: string;

  @IsString()
  category: string;
}
