# RepoSense

An AI-powered codebase intelligence tool for developers that helps analyze, understand, and navigate repositories with ease.

## Features

- 🔍 **Repository Analysis** - Deep analysis of code structure and architecture
- 🗺️ **Architecture Visualization** - Interactive architecture maps and dependency graphs
- 🔥 **Activity Heatmaps** - Visualize code activity and hotspots
- 💬 **AI Chat Assistant** - Ask questions about your codebase
- 📊 **Statistics Dashboard** - Comprehensive repository metrics
- 🚀 **Onboarding Guide** - Help new developers understand the codebase quickly

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Firebase Firestore** - Cloud database for storing analysis results
- **GitHub API** - Repository data fetching
- **Bob AI** - AI-powered code intelligence

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **D3.js** - Data visualization library
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Prerequisites

- Python 3.9+
- Node.js 18+
- GitHub Personal Access Token
- Bob AI API Key
- Firebase Project with Firestore enabled

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd reposense
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env and add your credentials
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
GITHUB_TOKEN=your_github_personal_access_token
BOB_API_KEY=your_bob_api_key
BOB_API_URL=https://api.bob.ai/v1
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

### 5. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Generate a service account key (Project Settings > Service Accounts)
4. Download the JSON file and save it as `firebase-credentials.json` in the backend directory

## Running the Application

### Start Backend Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
reposense/
├── backend/              # FastAPI backend
│   ├── main.py          # Application entry point
│   ├── routers/         # API route handlers
│   ├── services/        # Business logic and external integrations
│   └── models/          # Pydantic schemas
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── api/         # API client
│   └── public/          # Static assets
└── README.md
```

## Usage

1. **Enter Repository URL** - Paste a GitHub repository URL on the home page
2. **Analyze** - Click analyze to start the codebase analysis
3. **Explore** - View architecture maps, heatmaps, and statistics
4. **Chat** - Ask questions about the codebase using the AI assistant
5. **Navigate** - Use the onboarding guide to understand key components

## Development

### Backend Development

```bash
# Run tests
pytest

# Format code
black .

# Lint code
flake8
```

### Frontend Development

```bash
# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.