-- CreateTable (baseline - table may already exist from connect-pg-simple)
CREATE TABLE IF NOT EXISTS "session" (
    "sid" VARCHAR NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex (baseline - index may already exist)
CREATE INDEX IF NOT EXISTS "session_expire_idx" ON "session"("expire");
