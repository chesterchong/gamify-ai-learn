-- Split course code vs title: code in courseCode, title/description in courseNote.

ALTER TABLE "QuizImportBatch" ADD COLUMN "courseCode" TEXT;
ALTER TABLE "AiQuizCollection" ADD COLUMN "courseCode" TEXT;
