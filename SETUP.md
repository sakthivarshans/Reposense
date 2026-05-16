# RepoSense Setup Guide

Complete setup instructions for running RepoSense locally and in production.

## Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **GitHub Personal Access Token** (for repo access)
- **IBM Bob API Key** (for AI analysis)
- **Firebase Project** (for data persistence)

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
GITHUB_TOKEN=ghp_your_github_token_here
BOB_API_KEY=your_bob_api_key_here
BOB_API_URL=https://bob-api-url.com
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

### 5. Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Click "Generate New Private Key"
6. Save the JSON file as `firebase-credentials.json` in the backend directory
7. Update `FIREBASE_CREDENTIALS_PATH` in `.env` if needed

### 6. Get GitHub Token

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Select scopes: `repo` (for private repos) or `public_repo` (for public only)
4. Copy token and add to `.env`

### 7. Get IBM Bob API Key

1. Contact IBM Bob team or access your Bob dashboard
2. Generate API key
3. Copy API key and URL to `.env`

### 8. Run Backend Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

API documentation at `http://localhost:8000/docs`

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment (Optional)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

For development, the default `/api` proxy works fine. For production:

```env
VITE_API_URL=https://your-backend-url.com/api
```

### 4. Run Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

Built files will be in `dist/` directory.

## Running Both Services

### Option 1: Two Terminals

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate  # or source venv/bin/activate on macOS/Linux
uvicorn main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Option 2: Production Mode

**Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend (build and serve):**
```bash
cd frontend
npm run build
npm run preview
```

## Testing the Application

1. Open browser to `http://localhost:5173`
2. Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
3. Click "Analyze Repository"
4. Wait for analysis (30-60 seconds)
5. Explore results: Architecture Map, Heatmap, Onboarding Guide, Chat

## Troubleshooting

### Backend Issues

**Import errors:**
```bash
pip install --upgrade -r requirements.txt
```

**Firebase connection errors:**
- Verify `firebase-credentials.json` exists
- Check file path in `.env`
- Ensure Firestore is enabled in Firebase Console

**GitHub API rate limits:**
- Use authenticated token (increases limit to 5000/hour)
- Wait for rate limit reset
- Check token permissions

**Bob API errors:**
- Verify API key is correct
- Check Bob API URL
- Ensure sufficient Bobcoins balance

### Frontend Issues

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Vite proxy errors:**
- Ensure backend is running on port 8000
- Check `vite.config.js` proxy configuration

**Build errors:**
```bash
npm run build -- --debug
```

### CORS Issues

If you see CORS errors:
1. Verify backend CORS settings in `main.py`
2. Check frontend is accessing correct API URL
3. Ensure both services are running

## Production Deployment

### Backend (Railway/Render/Heroku)

1. Set environment variables in platform dashboard
2. Upload `firebase-credentials.json` securely
3. Deploy from GitHub repository
4. Use production ASGI server: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel/Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_URL` environment variable to backend URL
4. Configure redirects for SPA routing

### Environment Variables Checklist

**Backend:**
- ✅ GITHUB_TOKEN
- ✅ BOB_API_KEY
- ✅ BOB_API_URL
- ✅ FIREBASE_CREDENTIALS_PATH

**Frontend:**
- ✅ VITE_API_URL (production only)

## API Endpoints

### Analysis
- `POST /api/analyze` - Analyze repository
- `POST /api/chat` - Chat with repository context

### Statistics
- `GET /api/health` - Health check
- `GET /api/stats` - Platform statistics

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend    │─────▶│   GitHub    │
│  (React)    │      │  (FastAPI)   │      │     API     │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ├─────────────▶ IBM Bob AI
                            │
                            └─────────────▶ Firebase Firestore
```

## Support

For issues or questions:
1. Check this setup guide
2. Review error logs
3. Verify all environment variables
4. Check API documentation at `/docs`

## License

See LICENSE file for details.