import { IsNotEmpty, IsIP, IsString } from 'class-validator';

export class CreateNewsClickDto {
  @IsNotEmpty()
  trendingTopicId: number;

  @IsIP()
  ipAddress: string;

  @IsString()
  userAgent: string;
}
