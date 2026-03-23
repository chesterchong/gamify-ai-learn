-- CreateTable
CREATE TABLE "SocraticHintFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "questionId" TEXT,
    "vote" TEXT NOT NULL,
    "feedbackText" TEXT,
    "contextJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocraticHintFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocraticHintFeedback_userId_idx" ON "SocraticHintFeedback"("userId");

-- CreateIndex
CREATE INDEX "SocraticHintFeedback_collectionId_idx" ON "SocraticHintFeedback"("collectionId");

-- CreateIndex
CREATE INDEX "SocraticHintFeedback_createdAt_idx" ON "SocraticHintFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "SocraticHintFeedback" ADD CONSTRAINT "SocraticHintFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocraticHintFeedback" ADD CONSTRAINT "SocraticHintFeedback_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "AiQuizCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
