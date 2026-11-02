import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ContentService } from '../content.service';
import { getMeuredContext } from '../content.types';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  list(@Headers() headers: Record<string, string | undefined>) {
    return this.contentService.listCategories(this.context(headers));
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

