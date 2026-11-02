import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

