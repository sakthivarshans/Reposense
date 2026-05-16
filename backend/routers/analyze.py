"""
Repository Analysis Router
Handles endpoints for analyzing GitHub repositories and chat interactions
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime
import hashlib
import logging

from models.schemas import (
    AnalyzeRequest, 
    AnalysisResult, 
    ChatRequest, 
    ChatResponse,
    ErrorResponse
)
from services.github_service import GitHubService
from services.bob_service import BobService
from services.firestore_service import FirestoreService
from services.chunker_service import ChunkerService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
github_service = GitHubService()
bob_service = BobService()
firestore_service = FirestoreService()
chunker_service = ChunkerService()


def create_cache_key(repo_url: str) -> str:
    """
    Create a cache key by hashing the repository URL
    
    Args:
        repo_url: GitHub repository URL
    
    Returns:
        SHA256 hash of the URL
    """
    return hashlib.sha256(repo_url.encode()).hexdigest()


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_repository(request: AnalyzeRequest) -> AnalysisResult:
    """
    Analyze a GitHub repository
    
    This endpoint:
    1. Validates GitHub URL format (done by Pydantic)
    2. Creates a cache key from the URL hash
    3. Checks Firestore for existing analysis
    4. Fetches repository tree from GitHub
    5. Chunks the repository code
    6. Analyzes with Bob AI
    7. Saves result to Firestore
    8. Returns AnalysisResult
    
    Args:
        request: AnalyzeRequest with repo_url and force_refresh flag
    
    Returns:
        AnalysisResult with comprehensive repository analysis
    """
    try:
        logger.info(f"Starting analysis for repository: {request.repo_url}")
        
        # Step 1: Validate GitHub URL (already done by Pydantic validator)
        repo_url = request.repo_url
        
        # Step 2: Create cache key
        cache_key = create_cache_key(repo_url)
        logger.info(f"Cache key generated: {cache_key}")
        
        # Step 3: Check Firestore for existing analysis
        if not request.force_refresh:
            logger.info("Checking cache for existing analysis...")
            cached_result = await firestore_service.get_cached_analysis(cache_key)
            
            if cached_result:
                logger.info("Cache hit! Returning cached analysis")
                cached_result["cached"] = True
                return AnalysisResult(**cached_result)
            
            logger.info("Cache miss. Proceeding with fresh analysis")
        else:
            logger.info("Force refresh requested. Skipping cache check")
        
        # Step 4: Fetch repository tree from GitHub
        logger.info("Fetching repository tree from GitHub...")
        repo_tree = await github_service.fetch_repo_tree(repo_url)
        
        if not repo_tree:
            raise HTTPException(
                status_code=404,
                detail="Repository not found or inaccessible. Please check the URL and ensure the repository is public."
            )
        
        logger.info(f"Repository tree fetched successfully. Files: {len(repo_tree.get('files', []))}")
        
        # Step 5: Chunk the repository
        logger.info("Chunking repository code...")
        chunks = chunker_service.chunk_repo(repo_tree)
        logger.info(f"Repository chunked into {len(chunks)} chunks")
        
        # Log estimated Bob cost
        estimated_cost = chunker_service.estimate_bob_cost(chunks)
        logger.info(f"Estimated Bob AI cost: {estimated_cost} Bobcoins")
        
        # Step 6: Analyze with Bob AI
        logger.info("Analyzing repository with Bob AI...")
        analysis = await bob_service.analyze_full(chunks, repo_url)
        
        if not analysis:
            raise HTTPException(
                status_code=500,
                detail="Failed to analyze repository with Bob AI. Please try again later."
            )
        
        logger.info("Bob AI analysis completed successfully")
        
        # Step 7: Prepare result
        result = AnalysisResult(
            repo_url=repo_url,
            summary=analysis.get("summary", "No summary available"),
            tech_stack=analysis.get("tech_stack", []),
            architecture=analysis.get("architecture", {"nodes": [], "edges": []}),
            complexity_map=analysis.get("complexity_map", []),
            onboarding_guide=analysis.get("onboarding_guide", "# Onboarding Guide\n\nNo guide available."),
            cached=False,
            created_at=datetime.utcnow()
        )
        
        # Step 8: Save to Firestore
        logger.info("Saving analysis to Firestore...")
        await firestore_service.save_analysis(
            cache_key,
            result.model_dump()
        )
        logger.info("Analysis saved to Firestore successfully")
        
        logger.info(f"Analysis completed for {repo_url}")
        return result
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error during analysis: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_repository(request: ChatRequest) -> ChatResponse:
    """
    Chat with AI about a repository
    
    This endpoint:
    1. Receives repo_url, question, and session_id
    2. Loads chat history from Firestore for this session
    3. Calls Bob AI with question, repo context, and history
    4. Appends message to Firestore session history
    5. Returns answer string
    
    Args:
        request: ChatRequest with repo_url, question, and session_id
    
    Returns:
        ChatResponse with AI answer
    """
    try:
        logger.info(f"Chat request for repo: {request.repo_url}, session: {request.session_id}")
        
        # Step 1: Get repository context
        cache_key = create_cache_key(request.repo_url)
        logger.info("Loading repository context from cache...")
        
        repo_context = await firestore_service.get_cached_analysis(cache_key)
        
        if not repo_context:
            raise HTTPException(
                status_code=404,
                detail="Repository not analyzed yet. Please analyze the repository first."
            )
        
        logger.info("Repository context loaded successfully")
        
        # Step 2: Load chat history
        logger.info(f"Loading chat history for session: {request.session_id}")
        chat_history = await firestore_service.get_session_history(request.session_id)
        logger.info(f"Loaded {len(chat_history)} previous messages")
        
        # Step 3: Call Bob AI
        logger.info("Sending question to Bob AI...")
        answer = await bob_service.chat(
            question=request.question,
            repo_summary=repo_context.get("summary", "No summary available"),
            chat_history=chat_history
        )
        
        if not answer:
            raise HTTPException(
                status_code=500,
                detail="Failed to get response from Bob AI. Please try again."
            )
        
        logger.info("Received answer from Bob AI")
        
        # Step 4: Append to chat history
        logger.info("Saving chat messages to Firestore...")
        # Save user message
        await firestore_service.save_chat_message(
            session_id=request.session_id,
            repo_url=request.repo_url,
            role="user",
            content=request.question
        )
        # Save assistant message
        await firestore_service.save_chat_message(
            session_id=request.session_id,
            repo_url=request.repo_url,
            role="assistant",
            content=answer
        )
        logger.info("Chat messages saved successfully")
        
        # Step 5: Return response
        response = ChatResponse(
            answer=answer,
            session_id=request.session_id,
            timestamp=datetime.utcnow()
        )
        
        logger.info(f"Chat request completed for session: {request.session_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during chat: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {str(e)}"
        )

# Made with Bob
