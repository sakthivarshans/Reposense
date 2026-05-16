"""
RepoSense Backend API
FastAPI application for codebase intelligence and analysis
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Import routers
from routers import analyze, stats

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="RepoSense API",
    description="AI-powered codebase intelligence tool for developers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default dev server
        "http://localhost:3000",  # Alternative React dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze.router, prefix="/api", tags=["Analysis & Chat"])
app.include_router(stats.router, prefix="/api", tags=["Statistics & Health"])


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "RepoSense API is running",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "analyze": "/api/analyze",
            "chat": "/api/chat",
            "stats": "/api/stats",
            "health": "/api/health",
            "docs": "/docs"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )

# Powered by Groq AI
