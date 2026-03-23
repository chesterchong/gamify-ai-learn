-- AlterTable
ALTER TABLE "AiQuizQuestion" ADD COLUMN "generationVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "QuizImportBatch" ADD COLUMN "primaryCollectionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "QuizImportBatch_primaryCollectionId_key" ON "QuizImportBatch"("primaryCollectionId");

-- AddForeignKey
ALTER TABLE "QuizImportBatch" ADD CONSTRAINT "QuizImportBatch_primaryCollectionId_fkey" FOREIGN KEY ("primaryCollectionId") REFERENCES "AiQuizCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: oldest collection per batch becomes primary (pooled row for existing data)
UPDATE "QuizImportBatch" b
SET "primaryCollectionId" = sub.id
FROM (
  SELECT DISTINCT ON ("batchId") id, "batchId"
  FROM "AiQuizCollection"
  WHERE "batchId" IS NOT NULL
  ORDER BY "batchId", "createdAt" ASC, id ASC
) sub
WHERE b.id = sub."batchId"
  AND b."primaryCollectionId" IS NULL;
