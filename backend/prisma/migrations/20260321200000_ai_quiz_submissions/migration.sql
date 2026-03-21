-- CreateTable
CREATE TABLE "AiQuizSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "detailJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQuizSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiQuizSubmission_userId_idx" ON "AiQuizSubmission"("userId");

-- CreateIndex
CREATE INDEX "AiQuizSubmission_collectionId_idx" ON "AiQuizSubmission"("collectionId");

-- AddForeignKey
ALTER TABLE "AiQuizSubmission" ADD CONSTRAINT "AiQuizSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizSubmission" ADD CONSTRAINT "AiQuizSubmission_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "AiQuizCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
