# 🔥 Firebase Firestore Setup Guide

Complete step-by-step guide to set up Firebase Firestore for RepoSense.

## 📋 Overview

RepoSense uses Firebase Firestore to:
- Cache repository analysis results
- Store chat session history
- Track global statistics

## 🚀 Step-by-Step Setup

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click **"Add project"** or **"Create a project"**
   - Enter project name: `reposense` (or any name you prefer)
   - Click **"Continue"**

3. **Google Analytics (Optional)**
   - You can disable Google Analytics for this project
   - Click **"Continue"**

4. **Wait for Project Creation**
   - Firebase will create your project (takes ~30 seconds)
   - Click **"Continue"** when ready

### Step 2: Enable Firestore Database

1. **Navigate to Firestore**
   - In the left sidebar, click **"Build"** → **"Firestore Database"**
   - Or click **"Firestore Database"** from the main dashboard

2. **Create Database**
   - Click **"Create database"** button

3. **Choose Security Rules**
   - Select **"Start in production mode"** (recommended)
   - Click **"Next"**
   
   > **Note:** Production mode starts with secure rules. We'll configure them next.

4. **Select Location**
   - Choose a Cloud Firestore location closest to you:
     - `us-central1` (Iowa) - Good for US
     - `europe-west1` (Belgium) - Good for Europe
     - `asia-south1` (Mumbai) - Good for India/Asia
   - Click **"Enable"**

5. **Wait for Database Creation**
   - Firestore will initialize (takes ~1 minute)

### Step 3: Configure Security Rules

1. **Go to Rules Tab**
   - Click on the **"Rules"** tab in Firestore

2. **Update Rules**
   - Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to analyses collection
    match /analyses/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write to sessions collection
    match /sessions/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write to stats collection
    match /stats/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. **Publish Rules**
   - Click **"Publish"** button

> **Security Note:** These rules allow unrestricted access. For production, implement proper authentication.

### Step 4: Download Service Account Credentials

1. **Go to Project Settings**
   - Click the **⚙️ gear icon** next to "Project Overview" in the left sidebar
   - Select **"Project settings"**

2. **Navigate to Service Accounts**
   - Click on the **"Service accounts"** tab at the top

3. **Generate New Private Key**
   - You'll see "Firebase Admin SDK" section
   - Click **"Generate new private key"** button
   - A dialog will appear warning you to keep the key secure
   - Click **"Generate key"**

4. **Download JSON File**
   - A JSON file will automatically download
   - The filename will be like: `reposense-xxxxx-firebase-adminsdk-xxxxx.json`

5. **Rename and Move File**
   - Rename the downloaded file to: `firebase-credentials.json`
   - Move it to your RepoSense `backend/` directory

### Step 5: Verify File Structure

Your `backend/` directory should now have:

```
backend/
├── firebase-credentials.json  ← Your downloaded file
├── .env
├── .env.example
├── main.py
├── requirements.txt
└── ...
```

### Step 6: Update .env File

Edit `backend/.env` and verify:

```env
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

## ✅ Verification

### Test Firebase Connection

1. **Start your backend server:**
   ```bash
   cd backend
   venv\Scripts\activate
   uvicorn main:app --reload
   ```

2. **Check logs for:**
   ```
   INFO:     Firebase initialized successfully
   INFO:     Firestore client created successfully
   ```

3. **If you see errors:**
   - Verify `firebase-credentials.json` exists in `backend/`
   - Check that the file is valid JSON
   - Ensure `FIREBASE_CREDENTIALS_PATH` in `.env` is correct

### Test with API

1. **Open API docs:** http://localhost:8000/docs

2. **Try the `/api/stats` endpoint:**
   - Click on `GET /api/stats`
   - Click "Try it out"
   - Click "Execute"
   - Should return: `{"total_analyses": 0, "total_repos": 0, "recent_repos": []}`

## 📊 Understanding Firestore Collections

RepoSense creates these collections automatically:

### 1. `analyses` Collection
- **Purpose:** Cache repository analysis results
- **Document ID:** MD5 hash of repository URL
- **Fields:**
  - `repo_url`: GitHub repository URL
  - `repo_hash`: MD5 hash
  - `summary`: AI-generated summary
  - `architecture_map`: Architecture visualization data
  - `complexity_map`: File complexity scores
  - `onboarding_guide`: Markdown onboarding guide
  - `created_at`: Timestamp

### 2. `sessions` Collection
- **Purpose:** Store chat conversation history
- **Document ID:** Session ID (UUID)
- **Fields:**
  - `repo_url`: Repository being discussed
  - `chatHistory`: Array of messages
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

### 3. `stats` Collection
- **Purpose:** Track global usage statistics
- **Document ID:** `global`
- **Fields:**
  - `total_analyses`: Total number of analyses
  - `recent_repos`: Last 10 analyzed repositories
  - `updated_at`: Timestamp

## 🔒 Security Best Practices

### For Development
- Current rules allow unrestricted access (fine for local development)
- Keep `firebase-credentials.json` private (already in `.gitignore`)

### For Production
Update Firestore rules to require authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Then implement Firebase Authentication in your app.

## 🐛 Troubleshooting

### Error: "Firebase permission denied"

**Solution:**
1. Check Firestore rules allow read/write
2. Verify credentials file is valid JSON
3. Ensure project has Firestore enabled

### Error: "Module 'firebase_admin' not found"

**Solution:**
```bash
pip install firebase-admin
```

### Error: "Invalid credentials"

**Solution:**
1. Re-download service account key from Firebase Console
2. Ensure file is named `firebase-credentials.json`
3. Verify file is in `backend/` directory

### Error: "Firestore not available"

**Solution:**
1. Check that Firestore Database is enabled in Firebase Console
2. Verify you selected a location when creating the database
3. Wait a few minutes for Firestore to fully initialize

## 💡 Optional: View Data in Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Click "Firestore Database" in left sidebar
4. You'll see your collections and documents as they're created

## 🎉 You're Done!

Firebase Firestore is now configured for RepoSense!

**Next Steps:**
1. Make sure `firebase-credentials.json` is in `backend/`
2. Verify `.env` has correct `FIREBASE_CREDENTIALS_PATH`
3. Start the backend server
4. Run your first repository analysis!

---

**Need Help?**
- Firebase Documentation: https://firebase.google.com/docs/firestore
- Firebase Console: https://console.firebase.google.com/