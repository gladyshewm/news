import { PublisherDto } from '@app/shared';
import { IsNumber } from 'class-validator';

export class PublishersDBResponseDto {
  data: PublisherDto[];

  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pages: number;
}
