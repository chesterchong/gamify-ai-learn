-- Link app user to Supabase Auth (OAuth) for metadata sync
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "supabaseAuthId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseAuthId_key" ON "User"("supabaseAuthId");

-- Every account must be admin or student (user type)
UPDATE "User"
SET "professionalRole" = 'student'
WHERE "professionalRole" IS NULL
   OR TRIM("professionalRole") = ''
   OR LOWER(TRIM("professionalRole")) NOT IN ('admin', 'student');

ALTER TABLE "User" ALTER COLUMN "professionalRole" SET DEFAULT 'student';
ALTER TABLE "User" ALTER COLUMN "professionalRole" SET NOT NULL;

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_professionalRole_check";
ALTER TABLE "User" ADD CONSTRAINT "User_professionalRole_check" CHECK ("professionalRole" IN ('admin', 'student'));
