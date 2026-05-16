# RepoSense — Instant Codebase Intelligence 🚀

<div align="center">

![RepoSense Logo](https://img.shields.io/badge/RepoSense-AI%20Powered-blue?style=for-the-badge&logo=github)
[![IBM Bob](https://img.shields.io/badge/Powered%20by-IBM%20Bob-purple?style=for-the-badge&logo=ibm)](https://www.ibm.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Hackathon](https://img.shields.io/badge/lablab.ai-IBM%20Bob%20Hackathon-orange?style=for-the-badge)](https://lablab.ai)

**Understand any codebase in 30 seconds with IBM Bob AI**

[Live Demo](#-live-demo) • [Documentation](#-getting-started) • [Architecture](#-architecture) • [Team](#-team)

</div>

---

## 🏆 IBM Bob Hackathon Submission

**Built for:** [lablab.ai IBM Bob Hackathon](https://lablab.ai) - May 2026  
**Category:** "Turn idea into impact faster"  
**Challenge:** Accelerate developer onboarding and codebase understanding using IBM Bob's advanced AI capabilities

This project demonstrates how IBM Bob can revolutionize the way developers understand and navigate unfamiliar codebases, turning days of exploration into seconds of AI-powered insight.

---

## 🎯 Problem Statement

### The Developer Onboarding Crisis

Every developer faces this challenge:

- 📚 **2-5 days wasted** reading through unfamiliar codebases
- 🔍 **Hours spent** searching for the right entry points
- 🤔 **Confusion** about architecture and dependencies
- ⚠️ **Risk** of breaking things due to incomplete understanding
- 😰 **Frustration** from lack of documentation or outdated guides

**The cost?** Lost productivity, delayed features, and developer burnout.

### Real-World Impact

- New team members take **weeks** to become productive
- Open-source contributors struggle to make their first PR
- Code reviews are slow because reviewers don't understand context
- Technical debt accumulates as developers avoid unfamiliar code
- Junior developers feel overwhelmed and discouraged

**We needed a solution that could read and understand entire codebases like a senior developer — instantly.**

---

## 💡 Solution

**RepoSense** is an AI-powered codebase intelligence platform that leverages **IBM Bob** to provide instant, comprehensive understanding of any GitHub repository.

### 🌟 5 Key Features Powered by IBM Bob

#### 1. **📊 Interactive Architecture Map**
- D3.js force-directed graph visualization
- Color-coded modules by type (frontend, backend, database, config, test)
- Click any module to ask Bob specific questions
- **Bob's Role:** Analyzes entire codebase structure and generates accurate dependency graphs

#### 2. **🔥 Risk Heatmap**
- Visual complexity scoring for every file
- Identifies high-risk areas that need attention
- Filter by risk level (High/Medium/Low)
- **Bob's Role:** Evaluates code complexity, dependencies, and potential issues across all files

#### 3. **📖 AI-Generated Onboarding Guide**
- Personalized markdown guide for new developers
- Key files, setup instructions, and architecture overview
- Export to PDF for offline reading
- **Bob's Role:** Creates comprehensive, context-aware documentation by understanding the entire project

#### 4. **💬 Interactive Chat with Bob**
- Ask questions about any part of the codebase
- Get instant answers with full repository context
- Session history for continuous conversations
- **Bob's Role:** Provides intelligent answers using complete codebase knowledge, not just single files

#### 5. **⚡ Smart Caching**
- Firebase Firestore integration
- Instant results for previously analyzed repos
- Cost-efficient Bob API usage
- **Bob's Role:** Analysis results are cached, but Bob remains available for follow-up questions

---

## 🤖 How IBM Bob Powers This

### Why IBM Bob is Essential

Unlike traditional AI assistants that only see individual files, **IBM Bob can read and understand entire repositories** — making it uniquely suited for codebase intelligence.

### 5 Critical Bob AI Tasks

#### 1. **Repository Summary Generation**
```
Task: Generate a comprehensive 3-paragraph summary
Input: Complete repository structure + all file contents
Output: Executive summary covering purpose, tech stack, and key features
Why Bob: Needs full context to understand project scope and relationships
```

**Example Prompt:**
```
You are analyzing a complete codebase. Generate a comprehensive 3-paragraph summary:
1. What this project does and its main purpose
2. Key technologies and architecture patterns used
3. Notable features and design decisions

Repository structure: [FULL TREE]
File contents: [ALL CODE]
```

#### 2. **Architecture Map Generation**
```
Task: Create interactive dependency graph
Input: All files, imports, and relationships
Output: JSON with nodes (modules) and edges (dependencies)
Why Bob: Must understand cross-file dependencies and module relationships
```

**Example Prompt:**
```
Analyze this entire codebase and generate an architecture map as JSON.
Identify all major modules, their types (frontend/backend/database/config/test),
and their dependencies. Return format: {nodes: [], edges: []}

[COMPLETE CODEBASE CONTEXT]
```

#### 3. **Complexity Heatmap Generation**
```
Task: Score every file's complexity and risk
Input: All files with their content and relationships
Output: Risk scores (0-10) with detailed reasoning
Why Bob: Needs to evaluate complexity in context of entire system
```

**Example Prompt:**
```
Analyze all files in this repository and generate a complexity/risk assessment.
For each file, provide:
- Risk score (0-10)
- Reason for the score
- Potential issues

Consider: code complexity, dependencies, size, critical functionality

[ALL FILES WITH CONTENT]
```

#### 4. **Onboarding Guide Creation**
```
Task: Write comprehensive markdown guide for new developers
Input: Complete repository understanding
Output: Structured markdown with setup, architecture, and key files
Why Bob: Must synthesize entire codebase into coherent learning path
```

**Example Prompt:**
```
You are creating an onboarding guide for new developers joining this project.
Write a comprehensive markdown guide including:
- Project overview
- Setup instructions
- Architecture explanation
- Key files to read first
- Common workflows
- Best practices

Use your understanding of the ENTIRE codebase to create a logical learning path.

[FULL REPOSITORY CONTEXT]
```

#### 5. **Interactive Q&A with Context**
```
Task: Answer developer questions about the codebase
Input: Question + full repository context + chat history
Output: Accurate, context-aware answers
Why Bob: Questions often require understanding multiple files and their relationships
```

**Example Prompt:**
```
You are an expert on this codebase. Answer the developer's question using your
complete understanding of the repository structure, code, and patterns.

Question: [USER QUESTION]
Repository context: [FULL CODEBASE]
Previous conversation: [CHAT HISTORY]

Provide a detailed, accurate answer with code examples if relevant.
```

### The Bob Advantage

| Traditional AI | IBM Bob |
|---------------|---------|
| ❌ Single file context | ✅ Full repository context |
| ❌ Misses dependencies | ✅ Understands relationships |
| ❌ Generic answers | ✅ Project-specific insights |
| ❌ No architecture view | ✅ Complete system understanding |
| ❌ Limited code analysis | ✅ Deep pattern recognition |

**IBM Bob doesn't just read code — it understands systems.**

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         RepoSense Platform                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐       ┌───────▼────────┐
            │   Frontend      │       │    Backend     │
            │  React + Vite   │◄─────►│    FastAPI     │
            │  Tailwind + D3  │       │   Python 3.9+  │
            └─────────────────┘       └────────┬───────┘
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        │                      │                      │
                ┌───────▼────────┐    ┌───────▼────────┐    ┌───────▼────────┐
                │  GitHub API    │    │   IBM Bob AI   │    │   Firebase     │
                │  Repo Fetching │    │  5 AI Tasks    │    │   Firestore    │
                │  Tree + Files  │    │  Full Context  │    │    Caching     │
                └────────────────┘    └────────────────┘    └────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | Modern UI framework |
| | Vite | Fast build tool |
| | Tailwind CSS | Utility-first styling |
| | D3.js | Data visualizations |
| | Axios | HTTP client |
| **Backend** | FastAPI | High-performance API |
| | Python 3.9+ | Core language |
| | Pydantic | Data validation |
| | httpx | Async HTTP |
| **AI** | **IBM Bob** | **Codebase intelligence** |
| | OpenAI-compatible API | Bob integration |
| **Data** | Firebase Firestore | NoSQL database |
| | GitHub REST API | Repository access |
| **DevOps** | Git | Version control |
| | npm/pip | Package management |

### Data Flow

1. **User Input** → GitHub repository URL
2. **Backend** → Fetches repo tree and files (GitHub API)
3. **Chunking** → Smart code chunking (metadata + code chunks)
4. **IBM Bob** → Analyzes complete codebase (5 AI tasks)
5. **Caching** → Stores results in Firestore
6. **Frontend** → Displays visualizations and insights
7. **Chat** → Continuous Q&A with Bob using full context

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **GitHub Personal Access Token** ([Generate here](https://github.com/settings/tokens))
- **IBM Bob API Key** (from IBM Bob platform)
- **Firebase Project** ([Create here](https://console.firebase.google.com/))

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/reposense.git
   cd reposense/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials (see table below)
   ```

5. **Setup Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create project → Enable Firestore
   - Generate service account key (JSON)
   - Save as `firebase-credentials.json` in backend directory

6. **Run the server**
   ```bash
   uvicorn main:app --reload
   ```
   
   Backend will be available at `http://localhost:8000`  
   API docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment (optional)**
   ```bash
   cp .env.example .env
   # Default /api proxy works for development
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

### Environment Variables

#### Backend (.env)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` | ✅ Yes |
| `BOB_API_KEY` | IBM Bob API Key | `bob_xxxxxxxxxxxx` | ✅ Yes |
| `BOB_API_URL` | IBM Bob API Endpoint | `https://bob-api.ibm.com` | ✅ Yes |
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase JSON | `./firebase-credentials.json` | ✅ Yes |

#### Frontend (.env)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `/api` (dev) or `https://api.example.com` (prod) | ⚠️ Production only |

### Quick Start (Both Services)

```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate  # or source venv/bin/activate
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` and start analyzing repositories! 🎉

---

## 📸 Screenshots

### Home Page
[Screenshot: Hero landing page with gradient background and RepoInput component]

### Architecture Map
[Screenshot: D3.js force-directed graph with color-coded modules]

### Risk Heatmap
[Screenshot: Grid of risk-scored files with color coding]

### Onboarding Guide
[Screenshot: Markdown guide with styled headers and code blocks]

### Chat Interface
[Screenshot: Chat panel with IBM Bob responses]

### Results Dashboard
[Screenshot: Full results page with tabs and visualizations]

---

## 🔗 Live Demo

**🌐 Demo URL:** [Coming Soon]

**📹 Video Demo:** [Coming Soon]

**🎮 Try it yourself:**
1. Visit the demo URL
2. Enter a GitHub repository (e.g., `https://github.com/facebook/react`)
3. Click "Analyze Repository"
4. Explore the results in 30 seconds!

---

## 📊 IBM Bob Sessions

This project includes a comprehensive **Bob Session Export Report** demonstrating:

- ✅ All 5 AI tasks with actual prompts used
- ✅ Input/output examples for each task
- ✅ Token usage and cost analysis
- ✅ Performance metrics
- ✅ Quality assessment of Bob's responses

**Report Location:** `docs/bob-sessions-export.md`

The report proves how IBM Bob's full-context understanding is essential for accurate codebase intelligence.

---

## 🎯 Key Achievements

- ✅ **30-second analysis** of any GitHub repository
- ✅ **5 AI-powered features** using IBM Bob
- ✅ **Full codebase context** for accurate insights
- ✅ **Interactive visualizations** with D3.js
- ✅ **Smart caching** for instant re-analysis
- ✅ **Production-ready** code with error handling
- ✅ **Responsive design** for all devices
- ✅ **Comprehensive documentation** for judges and users

---

## 🚧 Future Enhancements

- [ ] Multi-language support (currently optimized for JavaScript/Python)
- [ ] GitHub OAuth integration for private repositories
- [ ] Team collaboration features
- [ ] Code quality metrics and suggestions
- [ ] Integration with IDEs (VS Code extension)
- [ ] Real-time repository monitoring
- [ ] Custom analysis templates
- [ ] Export reports to PDF/Markdown

---

## 👥 Team

**[Your Name]** - Full Stack Developer & AI Enthusiast  
- 🔗 [GitHub](https://github.com/yourusername)
- 🔗 [LinkedIn](https://linkedin.com/in/yourusername)
- 📧 your.email@example.com

*Built with ❤️ for the IBM Bob Hackathon on lablab.ai*

---

## 🙏 Acknowledgments

- **IBM Bob Team** for creating an incredible AI platform
- **lablab.ai** for hosting the hackathon
- **GitHub** for their comprehensive API
- **Firebase** for reliable data storage
- **Open Source Community** for amazing tools and libraries

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

<div align="center">

**⭐ Star this repo if you find it useful!**

**🐛 Found a bug? [Open an issue](https://github.com/yourusername/reposense/issues)**

**💡 Have an idea? [Start a discussion](https://github.com/yourusername/reposense/discussions)**

---

Made with 🚀 by developers, for developers

**Powered by IBM Bob AI**

</div>