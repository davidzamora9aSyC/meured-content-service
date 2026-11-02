import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeuredContext } from './content.types';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SetVoteDto } from './dto/set-vote.dto';
import { RabbitPublisher } from '../rabbitmq/rabbitmq.publisher';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbit: RabbitPublisher,
  ) {}

  listCategories(_context: MeuredContext) {
    return this.prisma.meuredCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async getTopContributors(_context: MeuredContext, params: { take: number }) {
    const rows = await this.prisma.meuredPost.groupBy({
      by: ['authorAuthUserId'],
      where: { status: 'PUBLISHED' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: params.take,
    });

    return rows.map((row) => ({
      authUserId: row.authorAuthUserId,
      posts: row._count.id,
    }));
  }

  async listPosts(_context: MeuredContext, params: { take: number; cursor?: string }) {
    const { take, cursor } = params;
    const rows = await this.prisma.meuredPost.findMany({
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
    });
    const nextCursor = rows.length === take ? rows[rows.length - 1]?.id ?? null : null;
    return { items: rows, nextCursor };
  }

  async getPost(_context: MeuredContext, id: string) {
    const post = await this.prisma.meuredPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post no encontrado');
    return post;
  }

  async createPost(context: MeuredContext, dto: CreatePostDto) {
    const title = dto.title.trim();
    const body = dto.body.trim();
    if (!title || !body) throw new BadRequestException('title/body requeridos');

    const post = await this.prisma.meuredPost.create({
      data: {
        authorAuthUserId: context.authUserId,
        title,
        body,
        categoryId: dto.categoryId ?? null,
        status: 'PUBLISHED',
      },
    });
    await this.rabbit.publish('meured.content.post.created', {
      actorAuthUserId: context.authUserId,
      objectType: 'POST',
      objectId: post.id,
      payload: { title: post.title, categoryId: post.categoryId },
      occurredAt: new Date().toISOString(),
    });
    return post;
  }

  async updatePost(context: MeuredContext, id: string, dto: UpdatePostDto) {
    const existing = await this.prisma.meuredPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post no encontrado');
    if (existing.authorAuthUserId !== context.authUserId) {
      throw new ForbiddenException('Solo el autor puede editar');
    }
    const post = await this.prisma.meuredPost.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        body: dto.body !== undefined ? dto.body.trim() : undefined,
        categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
      },
    });
    return post;
  }

  async deletePost(context: MeuredContext, id: string) {
    const existing = await this.prisma.meuredPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post no encontrado');
    if (existing.authorAuthUserId !== context.authUserId) {
      throw new ForbiddenException('Solo el autor puede eliminar');
    }
    await this.prisma.meuredPost.update({
      where: { id },
      data: { status: 'DELETED' },
    });
    return { ok: true };
  }

  async listComments(_context: MeuredContext, postId: string, params: { take: number }) {
    const postExists = await this.prisma.meuredPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!postExists) throw new NotFoundException('Post no encontrado');
    const items = await this.prisma.meuredComment.findMany({
      where: { postId, status: 'PUBLISHED' },
      orderBy: { createdAt: 'asc' },
      take: params.take,
    });
    return { items };
  }

  async createComment(context: MeuredContext, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.meuredPost.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'PUBLISHED') throw new NotFoundException('Post no encontrado');
    const body = dto.body.trim();
    if (!body) throw new BadRequestException('body requerido');
    const comment = await this.prisma.meuredComment.create({
      data: {
        postId,
        authorAuthUserId: context.authUserId,
        parentCommentId: dto.parentCommentId ?? null,
        body,
        status: 'PUBLISHED',
      },
    });
    await this.rabbit.publish('meured.content.comment.created', {
      actorAuthUserId: context.authUserId,
      objectType: 'COMMENT',
      objectId: comment.id,
      payload: { postId: comment.postId, parentCommentId: comment.parentCommentId ?? null },
      occurredAt: new Date().toISOString(),
    });
    return comment;
  }

  async setVote(context: MeuredContext, dto: SetVoteDto) {
    if (dto.value === 0) {
      await this.prisma.meuredVote.deleteMany({
        where: {
          targetType: dto.targetType,
          targetId: dto.targetId,
          authUserId: context.authUserId,
        },
      });
      return { ok: true, value: 0 };
    }

    const vote = await this.prisma.meuredVote.upsert({
      where: {
        targetType_targetId_authUserId: {
          targetType: dto.targetType,
          targetId: dto.targetId,
          authUserId: context.authUserId,
        },
      },
      create: {
        targetType: dto.targetType,
        targetId: dto.targetId,
        authUserId: context.authUserId,
        value: dto.value,
      },
      update: { value: dto.value },
    });
    return { ok: true, vote };
  }

  listMyBookmarks(context: MeuredContext) {
    return this.prisma.meuredPostBookmark.findMany({
      where: { authUserId: context.authUserId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async bookmarkPost(context: MeuredContext, postId: string) {
    const post = await this.prisma.meuredPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) throw new NotFoundException('Post no encontrado');
    const bookmark = await this.prisma.meuredPostBookmark.upsert({
      where: { authUserId_postId: { authUserId: context.authUserId, postId } },
      create: { authUserId: context.authUserId, postId },
      update: {},
    });
    return { ok: true, bookmark };
  }

  async unbookmarkPost(context: MeuredContext, postId: string) {
    await this.prisma.meuredPostBookmark.deleteMany({ where: { authUserId: context.authUserId, postId } });
    return { ok: true };
  }
}
