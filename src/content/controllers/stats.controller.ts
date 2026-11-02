import { Controller, Get, Headers, Query, UnauthorizedException } from '@nestjs/common';
import { ContentService } from '../content.service';
import { getMeuredContext } from '../content.types';

@Controller('stats')
export class StatsController {
  constructor(private readonly contentService: ContentService) {}

  @Get('top-contributors')
  topContributors(
    @Headers() headers: Record<string, string | undefined>,
    @Query('take') takeRaw?: string,
  ) {
    const take = Math.max(1, Math.min(parseInt(takeRaw ?? '3', 10) || 3, 20));
    return this.contentService.getTopContributors(this.context(headers), { take });
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

