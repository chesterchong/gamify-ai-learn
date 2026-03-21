-- Speeds up perfect-score lookup for quiz list (userId + collectionId filter)
CREATE INDEX IF NOT EXISTS "AiQuizSubmission_userId_collectionId_idx" ON "AiQuizSubmission"("userId", "collectionId");
