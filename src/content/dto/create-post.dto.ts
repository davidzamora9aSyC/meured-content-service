import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

