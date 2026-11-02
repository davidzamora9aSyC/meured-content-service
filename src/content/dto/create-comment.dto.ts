import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(6000)
  body!: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}

