# Supabase Storage Setup for Profile Photos

This guide explains how to set up Supabase Storage for profile photo uploads.

## Steps

1. **Go to your Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Select your project

2. **Create a Storage Bucket**
   - Go to **Storage** in the left sidebar
   - Click **New bucket**
   - Name it either:
     - `avatars` (preferred), or
     - `profile-photos` (fallback)
   - Make it **Public** (so profile photos can be accessed via URL)
   - Click **Create bucket**

3. **Set Bucket Policies (Required)**

   **Method 1: Using SQL Editor (Recommended)**
   - Go to **SQL Editor** in the left sidebar
   - Click **New query**
   - Copy and paste the following SQL (replace `'avatars'` with your bucket name if different):
     ```sql
     -- Policy 1: Allow authenticated users to upload
     CREATE POLICY "Authenticated uploads"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'avatars');
     
     -- Policy 2: Allow public read access
     CREATE POLICY "Public reads"
     ON storage.objects FOR SELECT
     TO public
     USING (bucket_id = 'avatars');
     ```
   - Click **Run** (or press Ctrl+Enter)
   - You should see "Success. No rows returned"

   **Method 2: Using Policy UI**
   - Click on your bucket
   - Go to **Policies** tab
   - Click **New Policy**
   - For the first policy:
     - Name: `Authenticated uploads`
     - Allowed operation: `INSERT`
     - Target roles: `authenticated`
     - USING expression: Leave empty
     - WITH CHECK expression: `bucket_id = 'avatars'`
   - For the second policy:
     - Name: `Public reads`
     - Allowed operation: `SELECT`
     - Target roles: `public`
     - USING expression: `bucket_id = 'avatars'`
     - WITH CHECK expression: Leave empty

   **Note:** Replace `'avatars'` with `'profile-photos'` if you named your bucket differently.

4. **Verify Setup**
   - The EditProfile component will automatically try both `avatars` and `profile-photos` buckets
   - If upload fails, check the browser console for error messages

## File Structure

Profile photos are stored as:
```
avatars/
  profile-photos/
    {email_normalized}_{timestamp}.{ext}
```

Example: `avatars/profile-photos/user_example_com_1704067200000.jpg`

## Troubleshooting

- **Upload fails**: Check that the bucket exists and is public
- **403 Forbidden**: Check bucket policies allow authenticated uploads
- **Image not displaying**: Ensure the bucket is public or the policy allows public reads
