import { Body, Controller, Get, Headers, Param, Post, Query, UnauthorizedException } from '@nestjs/common';
import { ContentService } from '../content.service';
import { getMeuredContext } from '../content.types';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  list(
    @Headers() headers: Record<string, string | undefined>,
    @Param('postId') postId: string,
    @Query('take') takeRaw?: string,
  ) {
    const take = Math.max(1, Math.min(parseInt(takeRaw ?? '50', 10) || 50, 200));
    return this.contentService.listComments(this.context(headers), postId, { take });
  }

  @Post()
  create(
    @Headers() headers: Record<string, string | undefined>,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.contentService.createComment(this.context(headers), postId, dto);
  }

  private context(headers: Record<string, string | undefined>) {
    try {
      const context = getMeuredContext(headers);
      if (context.activeProduct !== 'MEURED') throw new Error('Acceso MeuRed requerido');
      return context;
    } catch {
      throw new UnauthorizedException('Contexto MeuRed requerido');
    }
  }
}

