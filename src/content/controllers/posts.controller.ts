import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { ContentService } from '../content.service';
import { getMeuredContext } from '../content.types';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  list(
    @Headers() headers: Record<string, string | undefined>,
    @Query('take') takeRaw?: string,
    @Query('cursor') cursor?: string,
  ) {
    const take = Math.max(1, Math.min(parseInt(takeRaw ?? '20', 10) || 20, 50));
    return this.contentService.listPosts(this.context(headers), { take, cursor });
  }

  @Get(':id')
  get(@Headers() headers: Record<string, string | undefined>, @Param('id') id: string) {
    return this.contentService.getPost(this.context(headers), id);
  }

  @Post()
  create(@Headers() headers: Record<string, string | undefined>, @Body() dto: CreatePostDto) {
    return this.contentService.createPost(this.context(headers), dto);
  }

  @Patch(':id')
  update(
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.contentService.updatePost(this.context(headers), id, dto);
  }

  @Delete(':id')
  remove(@Headers() headers: Record<string, string | undefined>, @Param('id') id: string) {
    return this.contentService.deletePost(this.context(headers), id);
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

