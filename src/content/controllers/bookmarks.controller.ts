import { Controller, Delete, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { ContentService } from '../content.service';
import { getMeuredContext } from '../content.types';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly contentService: ContentService) {}

  @Get('me')
  listMyBookmarks(@Headers() headers: Record<string, string | undefined>) {
    return this.contentService.listMyBookmarks(this.context(headers));
  }

  @Post('posts/:postId')
  bookmarkPost(@Headers() headers: Record<string, string | undefined>, @Param('postId') postId: string) {
    return this.contentService.bookmarkPost(this.context(headers), postId);
  }

  @Delete('posts/:postId')
  unbookmarkPost(@Headers() headers: Record<string, string | undefined>, @Param('postId') postId: string) {
    return this.contentService.unbookmarkPost(this.context(headers), postId);
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

