# 🚀 Quick Start Guide - RepoSense

Get RepoSense running in 5 minutes!

## ⚡ Prerequisites Check

Before starting, ensure you have:

- ✅ **Python 3.9+** installed
  ```bash
  python --version
  # Should show 3.9 or higher
  ```

- ✅ **Node.js 18+** installed
  ```bash
  node --version
  # Should show 18.0 or higher
  ```

- ✅ **Git** installed
  ```bash
  git --version
  ```

## 📋 Required Credentials

You'll need these before running:

1. **GitHub Personal Access Token**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scope: `public_repo` (for public repos)
   - Copy the token (starts with `ghp_`)

2. **Groq API Key**
   - Sign up at: https://console.groq.com
   - Navigate to API Keys
   - Generate new API key
   - Copy the key (starts with `gsk_`)

3. **Firebase Project**
   - Go to: https://console.firebase.google.com/
   - Create new project
   - Enable Firestore Database
   - Download service account JSON

## 🎯 Step-by-Step Setup

### Step 1: Backend Setup (5 minutes)

Open a terminal and run:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies (this may take 2-3 minutes)
pip install -r requirements.txt

# Create .env file
copy .env.example .env     # Windows
# OR
cp .env.example .env       # macOS/Linux
```

### Step 2: Configure Backend Environment

Edit `backend/.env` file with your credentials:

```env
GITHUB_TOKEN=ghp_your_actual_token_here
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=mixtral-8x7b-32768
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

### Step 3: Add Firebase Credentials

1. Place your downloaded Firebase JSON file in the `backend/` directory
2. Rename it to `firebase-credentials.json`
3. Verify the path in `.env` matches

### Step 4: Start Backend Server

```bash
# Make sure you're in backend directory with venv activated
uvicorn main:app --reload

# You should see:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete.
```

✅ **Backend is now running!** Keep this terminal open.

Test it: Open http://localhost:8000/docs in your browser

---

### Step 5: Frontend Setup (3 minutes)

Open a **NEW terminal** (keep backend running) and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (this may take 2-3 minutes)
npm install

# Start development server
npm run dev

# You should see:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

✅ **Frontend is now running!**

---

## 🎉 You're Ready!

1. Open your browser to: **http://localhost:5173**
2. You should see the RepoSense home page
3. Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
4. Click "Analyze Repository"
5. Wait 30-60 seconds for Bob to analyze
6. Explore the results!

## 🐛 Troubleshooting

### Backend Issues

**Error: "Module not found"**
```bash
# Make sure virtual environment is activated
# You should see (venv) in your terminal prompt
pip install -r requirements.txt
```

**Error: "Firebase permission denied"**
```bash
# Check that firebase-credentials.json exists in backend/
# Verify FIREBASE_CREDENTIALS_PATH in .env is correct
```

**Error: "GitHub API rate limit"**
```bash
# Verify GITHUB_TOKEN is set in .env
# Token should start with ghp_
```

**Error: "Groq API authentication failed"**
```bash
# Verify GROQ_API_KEY in .env
# Check that your Groq API key is active
# Ensure you have credits in your Groq account
```

### Frontend Issues

**Error: "Cannot connect to backend"**
```bash
# Make sure backend is running on port 8000
# Check http://localhost:8000/docs
```

**Error: "npm install fails"**
```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Port 5173 already in use**
```bash
# Kill the process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9
```

## 📝 Quick Commands Reference

### Backend
```bash
# Start backend
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
uvicorn main:app --reload

# Stop backend
Ctrl+C

# View API docs
http://localhost:8000/docs
```

### Frontend
```bash
# Start frontend
cd frontend
npm run dev

# Stop frontend
Ctrl+C

# Build for production
npm run build
```

## 🔍 Testing the Application

### Test with Sample Repositories

Try these public repositories:

1. **Small repo (fast):**
   ```
   https://github.com/vercel/next.js
   ```

2. **Medium repo:**
   ```
   https://github.com/facebook/react
   ```

3. **Your own repo:**
   ```
   https://github.com/yourusername/your-repo
   ```

### Expected Behavior

1. **Analysis takes 30-60 seconds** (Bob is reading the entire codebase)
2. **You'll see 4 tabs:**
   - Architecture: Interactive graph
   - Heatmap: Risk-scored files
   - Onboarding: AI-generated guide
   - Chat: Ask Bob questions

3. **Chat is interactive** - Ask Bob anything about the codebase!

## 💡 Tips

- **First analysis is slower** (no cache)
- **Subsequent analyses are instant** (cached in Firestore)
- **Use the chat** to ask specific questions
- **Click nodes in architecture map** to ask Bob about them
- **Filter heatmap** by risk level
- **Export onboarding guide** to PDF

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [SETUP.md](SETUP.md) for detailed setup
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## 🆘 Still Having Issues?

1. Check that all prerequisites are installed
2. Verify all credentials are correct in `.env`
3. Make sure both backend and frontend are running
4. Check the terminal for error messages
5. Open an issue on GitHub with error details

---

**Happy coding! 🚀**

*If everything works, you should see the RepoSense interface analyzing repositories in seconds!*