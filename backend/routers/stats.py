"""
Statistics Router
Handles endpoints for health checks and global statistics
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
import logging

from models.schemas import HealthResponse, GlobalStats, ErrorResponse
from services.firestore_service import FirestoreService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
firestore_service = FirestoreService()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    
    Returns:
        HealthResponse with status "ok"
    """
    logger.info("Health check requested")
    return HealthResponse(
        status="ok",
        timestamp=datetime.utcnow()
    )


@router.get("/stats", response_model=GlobalStats)
async def get_global_stats() -> GlobalStats:
    """
    Get global statistics
    
    This endpoint pulls statistics from Firestore stats/global document:
    - total_analyses: Total number of analyses performed
    - total_repos: Total number of unique repositories analyzed
    - recent_repos: List of recently analyzed repositories
    
    Returns:
        GlobalStats with comprehensive platform statistics
    """
    try:
        logger.info("Fetching global statistics from Firestore...")
        
        # Pull stats from Firestore
        stats_data = await firestore_service.get_global_stats()
        
        if not stats_data:
            logger.warning("No stats found in Firestore, returning default values")
            return GlobalStats(
                total_analyses=0,
                total_repos=0,
                recent_repos=[]
            )
        
        logger.info(f"Global stats retrieved: {stats_data.get('total_analyses', 0)} analyses, "
                   f"{stats_data.get('total_repos', 0)} repos")
        
        return GlobalStats(**stats_data)
        
    except Exception as e:
        logger.error(f"Error fetching global stats: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )

# Made with Bob
