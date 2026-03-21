-- Denormalized total AI quiz submissions per user (Postgres/Supabase); incremented on each submit.

ALTER TABLE "User" ADD COLUMN "aiQuizSubmissionCount" INTEGER NOT NULL DEFAULT 0;

UPDATE "User" u
SET "aiQuizSubmissionCount" = (
  SELECT COUNT(*)::int FROM "AiQuizSubmission" s WHERE s."userId" = u."id"
);
