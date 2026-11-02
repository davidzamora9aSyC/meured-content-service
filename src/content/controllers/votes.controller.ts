import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ContentService } from '../content.service';
import { getMeuredContext } from '../content.types';
import { SetVoteDto } from '../dto/set-vote.dto';

@Controller('votes')
export class VotesController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  setVote(@Headers() headers: Record<string, string | undefined>, @Body() dto: SetVoteDto) {
    return this.contentService.setVote(this.context(headers), dto);
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

