import { IsString, IsOptional, IsInt, IsUrl } from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  name: string;

  @IsString()
  logoUrl: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
