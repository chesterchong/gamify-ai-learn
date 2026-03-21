-- CreateTable
CREATE TABLE "AiQuizCollection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchId" TEXT,
    "title" TEXT NOT NULL,
    "courseNote" TEXT,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQuizCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuizQuestion" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "stem" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "sourceSnippet" TEXT,

    CONSTRAINT "AiQuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiQuizQuestion_collectionId_idx" ON "AiQuizQuestion"("collectionId");

-- AddForeignKey
ALTER TABLE "AiQuizCollection" ADD CONSTRAINT "AiQuizCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizCollection" ADD CONSTRAINT "AiQuizCollection_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "QuizImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizQuestion" ADD CONSTRAINT "AiQuizQuestion_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "AiQuizCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
