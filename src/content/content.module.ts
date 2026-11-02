import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { ContentService } from './content.service';
import { CategoriesController } from './controllers/categories.controller';
import { PostsController } from './controllers/posts.controller';
import { CommentsController } from './controllers/comments.controller';
import { VotesController } from './controllers/votes.controller';
import { BookmarksController } from './controllers/bookmarks.controller';
import { StatsController } from './controllers/stats.controller';

@Module({
  imports: [PrismaModule, RabbitmqModule],
  providers: [ContentService],
  controllers: [
    CategoriesController,
    PostsController,
    CommentsController,
    VotesController,
    BookmarksController,
    StatsController,
  ],
})
export class ContentModule {}
