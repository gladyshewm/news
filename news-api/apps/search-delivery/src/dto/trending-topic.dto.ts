import { IsDate, IsNumber, IsString, IsUrl } from 'class-validator';

export class Publisher {
  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsString()
  favicon: string;
}

export class TrendingTopicDto {
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

  @IsNumber()
  contentLength: number;

  @IsString({ each: true })
  authors: string[];

  publisher: Publisher;

  @IsDate()
  date: Date;
}
