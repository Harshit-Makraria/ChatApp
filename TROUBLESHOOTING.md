# Troubleshooting "Failed to Fetch User" Error

## Quick Diagnosis Steps

### 1. Check Environment Variables
Run the app and look for the green/red environment status indicator in the bottom-right corner.

**Required Variables:**
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_PROJECT_ID=your_project_id
VITE_DATABASE_ID=your_database_id
VITE_COLLECTION_ID_USERS=your_users_collection_id
```

### 2. Check Browser Console
Open DevTools (F12) and look for console logs:

**Good signs:**
- ✅ "User session found: {user object}"
- ✅ "User profile loaded: {profile object}"

**Bad signs:**
- ❌ "No active session"
- ❌ "Error getting user profile"
- ❌ "Missing database or collection configuration"

### 3. Common Issues & Solutions

#### Issue: Missing Environment Variables
**Symptoms:** Red status indicator, "Missing database or collection configuration"
**Solution:** 
1. Copy `.env.example` to `.env`
2. Fill in all required values from your Appwrite console

#### Issue: User Collection Doesn't Exist
**Symptoms:** "Collection not found" error
**Solution:**
1. Go to Appwrite console → Database
2. Create `users` collection with these attributes:
   - `name` (string, required)
   - `email` (string, required)
   - `is_online` (boolean, default: false)
   - `last_seen` (datetime)
   - `avatar_url` (string, optional)
   - `bio` (string, optional)

#### Issue: Permission Problems
**Symptoms:** "Unauthorized" or "Forbidden" errors
**Solution:**
1. Go to Appwrite console → Database → users collection → Settings
2. Set permissions:
   - Create: Any authenticated user
   - Read: Any authenticated user
   - Update: Document owner
   - Delete: Document owner

#### Issue: User Profile Creation Fails
**Symptoms:** "Error creating user profile"
**Solution:**
1. Check collection attributes match exactly
2. Verify permissions are set correctly
3. Check if user ID conflicts with existing document

### 4. Debug Commands

Open browser console and run:

```javascript
// Check environment variables
console.log('Environment check:', {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  project: import.meta.env.VITE_PROJECT_ID,
  database: import.meta.env.VITE_DATABASE_ID,
  users_collection: import.meta.env.VITE_COLLECTION_ID_USERS
});

// Check current user session
import { account } from './src/appwriteConfig';
account.get().then(user => console.log('Current user:', user));
```

### 5. Manual Recovery Steps

If all else fails:

1. **Clear Browser Data:**
   - Clear cookies and localStorage
   - Hard refresh (Ctrl+Shift+R)

2. **Re-login:**
   - Go to `/login`
   - Log out and log back in

3. **Check Appwrite Console:**
   - Verify project is active
   - Check database exists
   - Verify collections are created
   - Test API from console

### 6. Development Helpers

The app now includes:

- **Environment Debug Panel:** Shows missing environment variables
- **Enhanced Logging:** Detailed console logs for debugging  
- **Error Boundary:** User-friendly error pages with solutions
- **Fallback Profile:** Creates minimal profile if database fails

### 7. Contact Support

If issue persists, provide these details:

1. Environment status (green/red indicator)
2. Browser console errors
3. Appwrite project configuration
4. Steps taken to reproduce

The enhanced error handling should now provide clear guidance on what's wrong and how to fix it!
