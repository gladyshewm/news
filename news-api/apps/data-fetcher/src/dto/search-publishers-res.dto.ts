import { Type } from 'class-transformer';
import { IsBoolean, ValidateNested } from 'class-validator';
import { SearchPublishersDto } from '@app/shared';

export class SearchPublishersResponseDto {
  @IsBoolean()
  success: boolean;

  @ValidateNested({ each: true })
  @Type(() => SearchPublishersDto)
  data: SearchPublishersDto[];
}
