# 🚨 SUPABASE CONFIGURATION NEEDED

## To: Database/Infrastructure Team

The App Preview Generator v002 requires Supabase configuration to enable cloud features.

### What's Needed:

1. **Create Supabase Project**
   - Project name: `app-preview-generator` (or similar)
   - Region: Your preferred region

2. **Add to Doppler**
   Please add these secrets to Doppler (suggest creating new project `app-preview-generator` or adding to `devportal`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your_supabase_project_url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   ```

3. **Run Database Migrations**
   Execute these SQL files in order:
   - `/v002/supabase/schema.sql` - Base tables for projects
   - `/v002/supabase/auth-schema.sql` - Auth and user tables

4. **Enable Authentication**
   In Supabase Dashboard → Authentication:
   - ✅ Enable Email/Password
   - ✅ Enable Google OAuth (optional but recommended)
   - Set redirect URL: `https://[your-domain]/auth/callback`

### Current Status:
- ❌ No Supabase project exists
- ❌ No credentials in Doppler
- ✅ All application code is ready
- ✅ Database schemas are prepared

### Features Waiting on This:
- User authentication (sign up/login)
- Cloud project storage
- Project sharing with unique URLs
- User profiles and preferences
- Activity tracking
- Collaboration features

### Priority: HIGH
Without this configuration, the app only works in local-only mode without any cloud features.

### Once Configured:
The app will automatically detect the Supabase credentials and enable all cloud features. No code changes needed.

---
**Contact**: Please update this file or notify the dev team once configuration is complete.