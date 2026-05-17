"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import re


# Request Schemas
class AnalyzeRequest(BaseModel):
    """Request schema for repository analysis"""
    repo_url: str = Field(..., description="GitHub repository URL")
    force_refresh: bool = Field(default=False, description="Force re-analysis even if cached")
    
    @field_validator('repo_url')
    @classmethod
    def validate_github_url(cls, v: str) -> str:
        """Validate that the URL is a valid GitHub repository URL"""
        github_pattern = r'^https?://github\.com/[\w-]+/[\w.-]+/?$'
        if not re.match(github_pattern, v.rstrip('/')):
            raise ValueError('Invalid GitHub repository URL format')
        return v.rstrip('/')
    
    class Config:
        json_schema_extra = {
            "example": {
                "repo_url": "https://github.com/username/repository",
                "force_refresh": False
            }
        }


class ChatRequest(BaseModel):
    """Request schema for chat endpoint"""
    repo_url: str = Field(..., description="GitHub repository URL")
    question: str = Field(..., description="User question about the repository")
    session_id: str = Field(..., description="Chat session identifier")
    
    @field_validator('question')
    @classmethod
    def validate_question(cls, v: str) -> str:
        """Ensure question is not empty"""
        if not v.strip():
            raise ValueError('Question cannot be empty')
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "repo_url": "https://github.com/username/repository",
                "question": "What does the main.py file do?",
                "session_id": "session_123"
            }
        }


# Response Schemas
class FileRisk(BaseModel):
    """Schema for file risk assessment"""
    filename: str = Field(..., description="File path")
    risk_score: float = Field(..., ge=0, le=10, description="Risk score from 0 to 10")
    reason: str = Field(..., description="Explanation for the risk score")
    
    class Config:
        json_schema_extra = {
            "example": {
                "filename": "src/auth/login.py",
                "risk_score": 7.5,
                "reason": "High complexity with multiple authentication methods and error handling paths"
            }
        }


class ArchitectureNode(BaseModel):
    """Schema for architecture graph nodes"""
    id: str
    label: str
    type: str  # file, directory, module, class, function, frontend, backend, database, config, test
    group: Optional[str] = None
    description: Optional[str] = None  # AI often returns this; make it optional to avoid validation errors
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "src/main.py",
                "label": "main.py",
                "type": "file",
                "group": "core"
            }
        }


class ArchitectureEdge(BaseModel):
    """Schema for architecture graph edges"""
    source: str
    target: str
    # 'type' is optional because the AI commonly returns 'label' instead.
    # Defaults to 'depends_on' so validation never fails on AI output.
    type: Optional[str] = Field(default="depends_on", description="Relationship type: import, call, inherit, depends_on")
    label: Optional[str] = None  # Human-readable edge label used by D3 visualization
    
    class Config:
        json_schema_extra = {
            "example": {
                "source": "src/main.py",
                "target": "src/utils.py",
                "type": "import"
            }
        }


class ArchitectureGraph(BaseModel):
    """Schema for D3 architecture visualization"""
    nodes: List[ArchitectureNode]
    edges: List[ArchitectureEdge]


class AnalysisResult(BaseModel):
    """Response schema for repository analysis"""
    repo_url: str = Field(..., description="GitHub repository URL")
    summary: str = Field(..., description="AI-generated summary of the repository")
    tech_stack: List[str] = Field(..., description="List of technologies used")
    architecture: ArchitectureGraph = Field(..., description="Architecture graph for D3 visualization")
    complexity_map: List[FileRisk] = Field(..., description="List of files with risk scores")
    onboarding_guide: str = Field(..., description="Markdown-formatted onboarding guide")
    cached: bool = Field(default=False, description="Whether this result was cached")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Analysis timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "repo_url": "https://github.com/username/repository",
                "summary": "A modern web application built with FastAPI and React...",
                "tech_stack": ["Python", "FastAPI", "React", "PostgreSQL"],
                "architecture": {
                    "nodes": [
                        {"id": "main.py", "label": "main.py", "type": "file", "group": "core"}
                    ],
                    "edges": [
                        {"source": "main.py", "target": "utils.py", "type": "import"}
                    ]
                },
                "complexity_map": [
                    {
                        "filename": "src/auth.py",
                        "risk_score": 7.5,
                        "reason": "High complexity authentication logic"
                    }
                ],
                "onboarding_guide": "# Getting Started\n\n## Overview\n...",
                "cached": False,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class ChatMessage(BaseModel):
    """Schema for chat messages"""
    role: str = Field(..., description="Message role: user or assistant")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatResponse(BaseModel):
    """Response schema for chat endpoint"""
    answer: str = Field(..., description="AI assistant's answer")
    session_id: str = Field(..., description="Chat session identifier")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "answer": "The main.py file serves as the entry point for the FastAPI application...",
                "session_id": "session_123",
                "timestamp": "2024-01-01T00:00:00Z"
            }
        }


class RecentRepo(BaseModel):
    """Schema for recent repository info"""
    repo_url: str
    analyzed_at: datetime
    tech_stack: List[str]


class GlobalStats(BaseModel):
    """Response schema for global statistics"""
    total_analyses: int = Field(..., description="Total number of analyses performed")
    total_repos: int = Field(..., description="Total number of unique repositories analyzed")
    recent_repos: List[RecentRepo] = Field(..., description="List of recently analyzed repositories")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_analyses": 150,
                "total_repos": 120,
                "recent_repos": [
                    {
                        "repo_url": "https://github.com/user/repo",
                        "analyzed_at": "2024-01-01T00:00:00Z",
                        "tech_stack": ["Python", "FastAPI"]
                    }
                ]
            }
        }


class HealthResponse(BaseModel):
    """Schema for health check response"""
    status: str = Field(default="ok")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseModel):
    """Schema for error responses"""
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Made with Bob
