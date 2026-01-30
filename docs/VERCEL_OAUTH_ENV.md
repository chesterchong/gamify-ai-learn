# Vercel: Google/GitHub OAuth (500 on /api/auth/supabase)

If `POST /api/auth/supabase` returns **500** on your Vercel backend, check the following.

## 1. Required environment variables (backend on Vercel)

In **Vercel → your backend project → Settings → Environment Variables**, set:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (use **Supabase connection pooler** for serverless: port **6543**, or add `?pgbouncer=true`). |
| `SESSION_SECRET` | Strong random string for session signing. |
| `SUPABASE_URL` | Your Supabase project URL, e.g. `https://xxxx.supabase.co`. |
| `CLIENT_ORIGIN` | Your frontend URL, e.g. `https://your-app.vercel.app` (for CORS and cookies). |

Optional:

| Variable | Description |
|----------|-------------|
| `SUPABASE_JWT_AUD` | JWT audience. Defaults to `authenticated`. If Google login still fails with 401, try your **Supabase project ref** (the UUID in your Supabase URL). |
| `SUPABASE_JWKS_URL` | Override JWKS URL if needed (default: `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`). |
| `DEBUG_ERRORS` | Set to `true` to include error details in API responses (use only temporarily). |

## 2. Supabase JWT audience (common cause of 401/500)

Supabase access tokens use an **audience** claim. If verification fails:

1. In Supabase Dashboard go to **Project Settings → API** and note the **Project URL** and **JWT secret** (you don’t need to paste the secret into Vercel).
2. Decode your JWT at [jwt.io](https://jwt.io) (use the access token from the browser after Google login). Check the `aud` claim.
3. Set `SUPABASE_JWT_AUD` on Vercel to that value. It is often:
   - `authenticated`, or
   - Your **project ref** (the UUID part of `https://<project-ref>.supabase.co`).

Redeploy the backend after changing env vars.

## 3. Database and session store

- Use the **connection pooler** URL for Prisma on Vercel (e.g. Supabase pooler on port **6543**), not the direct port 5432, to avoid exhausting connections in serverless.
- Ensure the `session` table exists (the app can create it if the store is configured with `createTableIfMissing: true`).

## 4. See the real error

- **Vercel → Backend project → Logs**: check the function logs for `[auth/supabase]` messages after a failed Google login.
- Temporarily set `DEBUG_ERRORS=true` on the backend and retry; the API may return a `detail` field with the error message.

## 5. Frontend

- `VITE_API_URL` (or your build-time API URL) must point to the deployed backend, e.g. `https://gamify-ai-learn-backend.vercel.app`.
- In Supabase Dashboard → **Authentication → URL Configuration**, add your production **Site URL** and **Redirect URLs** (e.g. `https://your-app.vercel.app/signup`).
