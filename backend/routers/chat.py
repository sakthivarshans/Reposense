"""
Chat Router
Handles AI-powered chat interactions about the codebase
"""

from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from models.schemas import ChatRequest, ChatResponse, ChatMessage
from services.bob_service import BobService
from services.firestore_service import FirestoreService

router = APIRouter()

# Initialize services
bob_service = BobService()
firestore_service = FirestoreService()


@router.post("/", response_model=ChatResponse)
async def chat_with_codebase(request: ChatRequest) -> ChatResponse:
    """
    Chat with AI about the codebase
    
    This endpoint:
    1. Retrieves repository context from Firestore
    2. Sends user message with context to Bob AI
    3. Returns AI response with relevant code references
    
    Args:
        request: Chat request with repo_id, message, and conversation history
    
    Returns:
        ChatResponse with AI message and source references
    """
    try:
        # Get repository analysis for context
        analysis = await firestore_service.get_analysis(request.repo_id)
        
        if not analysis:
            raise HTTPException(
                status_code=404,
                detail="Repository analysis not found. Please analyze the repository first."
            )
        
        # Prepare context for Bob AI
        context = {
            "repo_name": analysis.get("repo_name"),
            "languages": analysis.get("languages"),
            "architecture": analysis.get("architecture"),
            "files": analysis.get("files")
        }
        
        # Get AI response
        ai_response = await bob_service.chat(
            message=request.message,
            context=context,
            conversation_history=request.conversation_history
        )
        
        # Prepare response
        response = ChatResponse(
            message=ai_response["message"],
            sources=ai_response.get("sources", []),
            timestamp=datetime.utcnow()
        )
        
        # Store conversation in Firestore (optional)
        await firestore_service.store_chat_message(
            repo_id=request.repo_id,
            user_message=request.message,
            ai_response=response.message
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat failed: {str(e)}"
        )


@router.get("/{repo_id}/history", response_model=List[ChatMessage])
async def get_chat_history(repo_id: str, limit: int = 50) -> List[ChatMessage]:
    """
    Retrieve chat history for a repository
    
    Args:
        repo_id: Repository identifier
        limit: Maximum number of messages to retrieve
    
    Returns:
        List of chat messages
    """
    try:
        history = await firestore_service.get_chat_history(repo_id, limit)
        
        return [ChatMessage(**msg) for msg in history]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve chat history: {str(e)}"
        )


@router.delete("/{repo_id}/history")
async def clear_chat_history(repo_id: str) -> dict:
    """
    Clear chat history for a repository
    
    Args:
        repo_id: Repository identifier
    
    Returns:
        Success message
    """
    try:
        success = await firestore_service.clear_chat_history(repo_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Chat history not found"
            )
        
        return {"message": "Chat history cleared successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear chat history: {str(e)}"
        )

# Made with Bob
