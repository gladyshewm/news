import { IsOptional, IsString } from 'class-validator';
import { SupportedTopicsDto } from '@app/shared';

export class TrendingTopicsPayload {
  @IsString()
  topic: SupportedTopicsDto;

  @IsString()
  language: string;

  @IsOptional()
  @IsString()
  country?: string;
}
