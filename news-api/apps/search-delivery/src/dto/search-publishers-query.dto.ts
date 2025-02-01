import { IsString } from 'class-validator';

export class SearchPublishersQueryDto {
  @IsString()
  name: string;
}
