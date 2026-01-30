# Enable Google OAuth Sign-in

Your app already uses Supabase for Google login. Follow these steps to enable it.

---

## 1. Create Google OAuth credentials

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create or select a project (e.g. "CSarena").
3. Open **APIs & Services** → **Credentials**.
4. Click **Create Credentials** → **OAuth client ID**.
5. If asked, configure the **OAuth consent screen**:
   - User type: **External** (or Internal for workspace-only).
   - App name: e.g. **CSarena**.
   - Support email: your email.
   - Save and continue through scopes and test users if needed.
6. Back in **Credentials**, create **OAuth client ID** again:
   - Application type: **Web application**.
   - Name: e.g. **CSarena Web**.
   - **Authorized redirect URIs** → **Add URI**:
     ```text
     https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
     ```
     Replace `<YOUR-PROJECT-REF>` with your Supabase project ref (from Supabase URL: `https://xxxx.supabase.co`).
7. Click **Create** and copy the **Client ID** and **Client Secret**.

---

## 2. Enable Google in Supabase

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** → your project.
2. Go to **Authentication** → **Providers**.
3. Find **Google** and turn it **ON**.
4. Paste:
   - **Client ID** (from Google).
   - **Client Secret** (from Google).
5. Click **Save**.

---

## 3. Redirect URLs in Supabase (if needed)

1. In the same project: **Authentication** → **URL Configuration**.
2. Under **Redirect URLs**, ensure your app URLs are listed, e.g.:
   - `http://localhost:5173/signup` (local)
   - `https://yourdomain.com/signup` (production).
3. **Site URL** can be your main app URL (e.g. `http://localhost:5173` or production).

---

## 4. Test

1. Open your app’s signup page (e.g. `/signup`).
2. Click **Continue with Google**.
3. Sign in with Google and approve; you should be redirected back and logged in.

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| "redirect_uri_mismatch" | Add exactly `https://<project-ref>.supabase.co/auth/v1/callback` in Google Cloud Console → Credentials → your OAuth client → Authorized redirect URIs. |
| "Access blocked: invalid_client" | Check Client ID and Client Secret in Supabase; ensure no extra spaces. |
| Redirects to wrong page | In Supabase → URL Configuration, add your app URL (e.g. `http://localhost:5173/signup`) under Redirect URLs. |

Your Supabase project ref is in your frontend env: `VITE_SUPABASE_URL` (e.g. `https://abcdefgh.supabase.co` → ref is `abcdefgh`).
