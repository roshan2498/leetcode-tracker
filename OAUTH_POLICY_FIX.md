## 🚨 Google OAuth 2.0 Policy Compliance Fix

### Step 1: Configure OAuth Consent Screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Select your project
3. Choose "External" user type (unless you have a Google Workspace)
4. Fill in the required fields:

**App Information:**
- App name: "LeetCode Tracker" (or any name you prefer)
- User support email: Your email
- App logo: Optional

**App Domain:**
- Application home page: http://localhost:3000
- Application privacy policy: http://localhost:3000/privacy (optional)
- Application terms of service: http://localhost:3000/terms (optional)

**Authorized Domains:**
- Add: localhost

**Developer Contact Information:**
- Email addresses: Your email

### Step 2: Add Test Users (if in Testing mode)
1. In the OAuth consent screen
2. Go to "Test users" section
3. Add your email address as a test user

### Step 3: Verify Redirect URIs
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. In "Authorized redirect URIs", make sure you have:
   - http://localhost:3000/api/auth/callback/google

### Step 4: Update Your .env File
Replace the placeholder with your actual Client ID:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="DO2R/cjoasWfDv3z07fa30ZNExedawoCuUqbCEVrUQg="
GOOGLE_CLIENT_ID="454650474746-hpb7lvo6m93b46fv8jaoshph4qem9p73.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret"
```

### Step 5: Publish Your App (if needed)
If you're still in "Testing" mode:
1. Go back to OAuth consent screen
2. Click "PUBLISH APP"
3. Confirm the action

### Common Issues:
- App not published (stuck in testing mode)
- Missing required fields in consent screen
- No test users added
- Wrong redirect URI format
- Missing authorized domains
