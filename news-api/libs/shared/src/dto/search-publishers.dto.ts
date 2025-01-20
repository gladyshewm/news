import { Type } from 'class-transformer';
import { IsString, IsUrl, ValidateNested } from 'class-validator';

export class PublisherLink {
  @IsUrl()
  url: string;

  @IsString()
  type: string;

  @IsString()
  username: string;
}

export class SearchPublishersDto {
  @IsString()
  title: string;

  @IsString()
  name: string;

  @IsUrl()
  url: string;

  @IsString()
  language: string;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsUrl()
  logo: string;

  @IsUrl()
  favicon: string;

  @ValidateNested({ each: true })
  @Type(() => PublisherLink)
  links: PublisherLink[];
}
