import { IsIn, IsString } from 'class-validator';

export class SetVoteDto {
  @IsString()
  targetId!: string;

  @IsIn(['POST', 'COMMENT'])
  targetType!: 'POST' | 'COMMENT';

  @IsIn([-1, 0, 1] as const)
  value!: -1 | 0 | 1;
}

