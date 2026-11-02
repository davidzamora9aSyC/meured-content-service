CREATE SCHEMA IF NOT EXISTS "meured_content";

CREATE TYPE "meured_content"."MeuredContentStatus" AS ENUM ('PUBLISHED', 'DELETED', 'FLAGGED');
CREATE TYPE "meured_content"."MeuredVoteTargetType" AS ENUM ('POST', 'COMMENT');
CREATE TYPE "meured_content"."MeuredReportStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED');

CREATE TABLE "meured_content"."MeuredCategory" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeuredCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_content"."MeuredPost" (
  "id" TEXT NOT NULL,
  "authorAuthUserId" TEXT NOT NULL,
  "categoryId" TEXT,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "meured_content"."MeuredContentStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeuredPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_content"."MeuredComment" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "authorAuthUserId" TEXT NOT NULL,
  "parentCommentId" TEXT,
  "body" TEXT NOT NULL,
  "status" "meured_content"."MeuredContentStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeuredComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_content"."MeuredVote" (
  "id" TEXT NOT NULL,
  "targetType" "meured_content"."MeuredVoteTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "authUserId" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeuredVote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_content"."MeuredTag" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeuredTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_content"."MeuredPostTag" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "MeuredPostTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_content"."MeuredPostBookmark" (
  "id" TEXT NOT NULL,
  "authUserId" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeuredPostBookmark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_content"."MeuredPostAttachment" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "imageId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeuredPostAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_content"."MeuredReport" (
  "id" TEXT NOT NULL,
  "reporterAuthUserId" TEXT NOT NULL,
  "targetType" "meured_content"."MeuredVoteTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "details" TEXT,
  "status" "meured_content"."MeuredReportStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeuredReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MeuredCategory_slug_key" ON "meured_content"."MeuredCategory"("slug");
CREATE INDEX "MeuredPost_authorAuthUserId_idx" ON "meured_content"."MeuredPost"("authorAuthUserId");
CREATE INDEX "MeuredPost_categoryId_idx" ON "meured_content"."MeuredPost"("categoryId");
CREATE INDEX "MeuredPost_createdAt_idx" ON "meured_content"."MeuredPost"("createdAt");
CREATE INDEX "MeuredComment_postId_idx" ON "meured_content"."MeuredComment"("postId");
CREATE INDEX "MeuredComment_authorAuthUserId_idx" ON "meured_content"."MeuredComment"("authorAuthUserId");
CREATE INDEX "MeuredComment_createdAt_idx" ON "meured_content"."MeuredComment"("createdAt");
CREATE UNIQUE INDEX "MeuredVote_targetType_targetId_authUserId_key" ON "meured_content"."MeuredVote"("targetType","targetId","authUserId");
CREATE INDEX "MeuredVote_authUserId_idx" ON "meured_content"."MeuredVote"("authUserId");
CREATE INDEX "MeuredVote_targetType_targetId_idx" ON "meured_content"."MeuredVote"("targetType","targetId");
CREATE UNIQUE INDEX "MeuredTag_slug_key" ON "meured_content"."MeuredTag"("slug");
CREATE UNIQUE INDEX "MeuredPostTag_postId_tagId_key" ON "meured_content"."MeuredPostTag"("postId","tagId");
CREATE INDEX "MeuredPostTag_tagId_idx" ON "meured_content"."MeuredPostTag"("tagId");
CREATE UNIQUE INDEX "MeuredPostBookmark_authUserId_postId_key" ON "meured_content"."MeuredPostBookmark"("authUserId","postId");
CREATE INDEX "MeuredPostBookmark_authUserId_idx" ON "meured_content"."MeuredPostBookmark"("authUserId");
CREATE INDEX "MeuredPostAttachment_postId_idx" ON "meured_content"."MeuredPostAttachment"("postId");
CREATE INDEX "MeuredPostAttachment_imageId_idx" ON "meured_content"."MeuredPostAttachment"("imageId");
CREATE INDEX "MeuredReport_reporterAuthUserId_idx" ON "meured_content"."MeuredReport"("reporterAuthUserId");
CREATE INDEX "MeuredReport_status_idx" ON "meured_content"."MeuredReport"("status");
CREATE INDEX "MeuredReport_targetType_targetId_idx" ON "meured_content"."MeuredReport"("targetType","targetId");

ALTER TABLE "meured_content"."MeuredPost"
  ADD CONSTRAINT "MeuredPost_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "meured_content"."MeuredCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "meured_content"."MeuredComment"
  ADD CONSTRAINT "MeuredComment_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "meured_content"."MeuredPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meured_content"."MeuredComment"
  ADD CONSTRAINT "MeuredComment_parentCommentId_fkey"
  FOREIGN KEY ("parentCommentId") REFERENCES "meured_content"."MeuredComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "meured_content"."MeuredPostTag"
  ADD CONSTRAINT "MeuredPostTag_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "meured_content"."MeuredPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meured_content"."MeuredPostTag"
  ADD CONSTRAINT "MeuredPostTag_tagId_fkey"
  FOREIGN KEY ("tagId") REFERENCES "meured_content"."MeuredTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meured_content"."MeuredPostBookmark"
  ADD CONSTRAINT "MeuredPostBookmark_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "meured_content"."MeuredPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meured_content"."MeuredPostAttachment"
  ADD CONSTRAINT "MeuredPostAttachment_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "meured_content"."MeuredPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

