"""
Firestore Service
Handles interactions with Firebase Firestore database using firebase-admin SDK
"""

import os
import hashlib
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
from functools import partial
import logging

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logging.warning("Firebase Admin SDK not installed. Install with: pip install firebase-admin")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def hash_repo_url(repo_url: str) -> str:
    """
    Create a consistent hash from repository URL
    
    Args:
        repo_url: GitHub repository URL
    
    Returns:
        MD5 hex digest of the normalized URL
    """
    # Lowercase and strip trailing slash
    normalized = repo_url.lower().rstrip('/')
    
    # Return MD5 hex digest
    return hashlib.md5(normalized.encode()).hexdigest()


class FirestoreService:
    """Service for interacting with Firebase Firestore"""
    
    def __init__(self):
        self.db = None
        
        if not FIREBASE_AVAILABLE:
            logger.error("Firebase Admin SDK not available. Please install: pip install firebase-admin")
            return
        
        try:
            # Initialize Firebase Admin SDK if not already initialized
            if not firebase_admin._apps:
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
                
                if not cred_path:
                    logger.error("FIREBASE_CREDENTIALS_PATH environment variable not set")
                    return
                
                if not os.path.exists(cred_path):
                    logger.error(f"Firebase credentials file not found: {cred_path}")
                    return
                
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized successfully")
            
            self.db = firestore.client()
            logger.info("Firestore client created successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}", exc_info=True)
            self.db = None
    
    async def get_cached_analysis(self, repo_hash: str) -> Optional[Dict[str, Any]]:
        """
        Query cached analysis from Firestore
        
        Args:
            repo_hash: MD5 hash of repository URL
        
        Returns:
            Document data if exists, else None
        """
        if not self.db:
            logger.warning("Firestore not available")
            return None
        
        try:
            logger.info(f"Querying cached analysis for hash: {repo_hash}")
            
            # Run sync Firestore call in executor
            loop = asyncio.get_event_loop()
            doc_ref = self.db.collection('analyses').document(repo_hash)
            doc = await loop.run_in_executor(None, doc_ref.get)
            
            if doc.exists:
                logger.info(f"Cache hit for {repo_hash}")
                return doc.to_dict()
            
            logger.info(f"Cache miss for {repo_hash}")
            return None
            
        except Exception as e:
            logger.error(f"Error querying cached analysis: {e}", exc_info=True)
            return None
    
    async def save_analysis(self, repo_hash: str, analysis: Dict[str, Any]) -> None:
        """
        Save analysis to Firestore and update global stats
        
        Args:
            repo_hash: MD5 hash of repository URL
            analysis: Analysis data to save
        """
        if not self.db:
            logger.warning("Firestore not available")
            return
        
        try:
            logger.info(f"Saving analysis for hash: {repo_hash}")
            
            # Add created_at timestamp
            analysis['created_at'] = datetime.utcnow()
            analysis['repo_hash'] = repo_hash
            
            loop = asyncio.get_event_loop()
            
            # Save to analyses/{repo_hash}
            doc_ref = self.db.collection('analyses').document(repo_hash)
            await loop.run_in_executor(None, partial(doc_ref.set, analysis))
            logger.info(f"Analysis saved for {repo_hash}")
            
            # Update global stats
            await self._update_global_stats(analysis.get('repo_url', ''))
            
        except Exception as e:
            logger.error(f"Error saving analysis: {e}", exc_info=True)
    
    async def _update_global_stats(self, repo_url: str) -> None:
        """
        Update global statistics
        
        Args:
            repo_url: Repository URL
        """
        try:
            loop = asyncio.get_event_loop()
            stats_ref = self.db.collection('stats').document('global')
            
            # Get current stats
            doc = await loop.run_in_executor(None, stats_ref.get)
            
            if doc.exists:
                data = doc.to_dict()
                total_analyses = data.get('total_analyses', 0) + 1
                recent_repos = data.get('recent_repos', [])
            else:
                total_analyses = 1
                recent_repos = []
            
            # Add to recent_repos (keep last 10 only)
            recent_repos.insert(0, {
                'repo_url': repo_url,
                'analyzed_at': datetime.utcnow()
            })
            recent_repos = recent_repos[:10]
            
            # Update stats
            stats_data = {
                'total_analyses': total_analyses,
                'recent_repos': recent_repos,
                'updated_at': datetime.utcnow()
            }
            
            await loop.run_in_executor(None, partial(stats_ref.set, stats_data))
            logger.info(f"Global stats updated: {total_analyses} total analyses")
            
        except Exception as e:
            logger.error(f"Error updating global stats: {e}", exc_info=True)
    
    async def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Query chat session history from Firestore
        
        Args:
            session_id: Chat session identifier
        
        Returns:
            List of chat messages or empty list
        """
        if not self.db:
            logger.warning("Firestore not available")
            return []
        
        try:
            logger.info(f"Querying session history for: {session_id}")
            
            loop = asyncio.get_event_loop()
            doc_ref = self.db.collection('sessions').document(session_id)
            doc = await loop.run_in_executor(None, doc_ref.get)
            
            if doc.exists:
                data = doc.to_dict()
                chat_history = data.get('chatHistory', [])
                logger.info(f"Retrieved {len(chat_history)} messages for session {session_id}")
                return chat_history
            
            logger.info(f"No history found for session {session_id}")
            return []
            
        except Exception as e:
            logger.error(f"Error querying session history: {e}", exc_info=True)
            return []
    
    async def save_chat_message(
        self,
        session_id: str,
        repo_url: str,
        role: str,
        content: str
    ) -> None:
        """
        Save chat message to Firestore session
        
        Args:
            session_id: Chat session identifier
            repo_url: Repository URL
            role: Message role ("user" or "assistant")
            content: Message content
        """
        if not self.db:
            logger.warning("Firestore not available")
            return
        
        try:
            logger.info(f"Saving chat message for session: {session_id}")
            
            loop = asyncio.get_event_loop()
            doc_ref = self.db.collection('sessions').document(session_id)
            
            # Get existing session
            doc = await loop.run_in_executor(None, doc_ref.get)
            
            # Create new message
            new_message = {
                'role': role,
                'content': content,
                'timestamp': datetime.utcnow()
            }
            
            if doc.exists:
                # Append to existing chatHistory
                data = doc.to_dict()
                chat_history = data.get('chatHistory', [])
                chat_history.append(new_message)
                
                # Keep max 50 messages (trim oldest)
                if len(chat_history) > 50:
                    chat_history = chat_history[-50:]
                
                session_data = {
                    'repo_url': data.get('repo_url', repo_url),
                    'chatHistory': chat_history,
                    'updated_at': datetime.utcnow()
                }
            else:
                # Create new session
                session_data = {
                    'repo_url': repo_url,
                    'chatHistory': [new_message],
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            
            await loop.run_in_executor(None, partial(doc_ref.set, session_data))
            logger.info(f"Chat message saved for session {session_id}")
            
        except Exception as e:
            logger.error(f"Error saving chat message: {e}", exc_info=True)
    
    async def get_global_stats(self) -> Dict[str, Any]:
        """
        Get global statistics from Firestore
        
        Returns:
            Dictionary with global stats, defaults to zeros if not exists
        """
        if not self.db:
            logger.warning("Firestore not available")
            return {
                'total_analyses': 0,
                'total_repos': 0,
                'recent_repos': []
            }
        
        try:
            logger.info("Querying global stats")
            
            loop = asyncio.get_event_loop()
            stats_ref = self.db.collection('stats').document('global')
            doc = await loop.run_in_executor(None, stats_ref.get)
            
            if doc.exists:
                data = doc.to_dict()
                logger.info(f"Global stats retrieved: {data.get('total_analyses', 0)} analyses")
                
                # Calculate total_repos from recent_repos
                recent_repos = data.get('recent_repos', [])
                unique_repos = len(set(r.get('repo_url', '') for r in recent_repos))
                
                return {
                    'total_analyses': data.get('total_analyses', 0),
                    'total_repos': unique_repos,
                    'recent_repos': recent_repos
                }
            
            logger.info("No global stats found, returning defaults")
            return {
                'total_analyses': 0,
                'total_repos': 0,
                'recent_repos': []
            }
            
        except Exception as e:
            logger.error(f"Error querying global stats: {e}", exc_info=True)
            return {
                'total_analyses': 0,
                'total_repos': 0,
                'recent_repos': []
            }

# Made with Bob
