-- CreateTable
CREATE TABLE "QuizImportBatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizImportFile" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "relativePath" TEXT NOT NULL,

    CONSTRAINT "QuizImportFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizImportBatch" ADD CONSTRAINT "QuizImportBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizImportFile" ADD CONSTRAINT "QuizImportFile_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "QuizImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
