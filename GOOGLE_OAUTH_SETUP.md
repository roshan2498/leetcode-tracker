# 🔧 Google OAuth Setup Guide

## The Error: redirect_uri_mismatch

This error occurs when the redirect URI in your Google OAuth configuration doesn't match what NextAuth.js expects.

## ✅ Step-by-Step Fix:

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Select your project or create a new one

### 2. Enable Google+ API
- Go to "APIs & Services" > "Library"
- Search for "Google+ API" and enable it
- Or use "Google Identity" API (newer)

### 3. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth 2.0 Client IDs"
- Choose "Web application"

### 4. Configure Authorized Redirect URIs
**IMPORTANT**: Add these EXACT URIs:

```
http://localhost:3000/api/auth/callback/google
```

**For production, also add:**
```
https://yourdomain.com/api/auth/callback/google
```

### 5. Update Your .env File
Replace the placeholder values in your `.env` file:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"
```

### 6. Generate a Secure Secret
Run this command to generate a secure NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## 🚨 Common Mistakes:

1. **Wrong redirect URI format** - Must be exactly: `http://localhost:3000/api/auth/callback/google`
2. **Missing protocol** - Don't forget `http://` or `https://`
3. **Wrong port** - Make sure it's port 3000 (or whatever port you're using)
4. **Trailing slash** - Don't add a trailing slash to the redirect URI
5. **Using wrong environment** - Make sure you're editing the correct `.env` file

## ✅ Test Your Setup:

1. Save your `.env` file
2. Restart your development server: `npm run dev`
3. Visit: http://localhost:3000
4. Click "Sign in with Google"

## 🔍 Still Having Issues?

Check these:
- [ ] Google OAuth consent screen is configured
- [ ] Redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- [ ] Client ID and Secret are correct in `.env`
- [ ] Development server is running on port 3000
- [ ] No typos in the redirect URI

## 📱 For Production:

When deploying, update:
1. `NEXTAUTH_URL` to your production domain
2. Add production redirect URI to Google Console
3. Use environment variables for secrets
