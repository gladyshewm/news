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

  publisher: Publisher;

  @IsDate()
  date: Date;
}
