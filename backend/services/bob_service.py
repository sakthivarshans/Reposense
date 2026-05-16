"""
Bob AI Service
Handles interactions with IBM Bob AI API (OpenAI-compatible endpoint)
"""

import httpx
import os
import json
from typing import Dict, Any, List, Optional
import logging
from fastapi import HTTPException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BobService:
    """Service for interacting with IBM Bob AI API"""
    
    def __init__(self):
        self.api_key = os.getenv("BOB_API_KEY")
        self.api_url = os.getenv("BOB_API_URL", "https://api.bob.ai")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.model = "bob-1"
        self.max_tokens = 2000
    
    async def _call_bob_api(self, messages: List[Dict[str, str]], max_tokens: int = None) -> str:
        """
        Make a call to Bob AI API
        
        Args:
            messages: List of message dicts with role and content
            max_tokens: Maximum tokens for response
        
        Returns:
            Response content string
        
        Raises:
            HTTPException: If Bob AI is unavailable
        """
        try:
            request_body = {
                "model": self.model,
                "messages": messages,
                "max_tokens": max_tokens or self.max_tokens
            }
            
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.api_url}/v1/chat/completions",
                    headers=self.headers,
                    json=request_body
                )
                response.raise_for_status()
                result = response.json()
                
                # Extract content from OpenAI-compatible response
                content = result["choices"][0]["message"]["content"]
                return content
                
        except httpx.HTTPError as e:
            logger.error(f"Bob AI API error: {e}")
            raise HTTPException(
                status_code=503,
                detail="Bob AI unavailable"
            )
        except Exception as e:
            logger.error(f"Unexpected error calling Bob AI: {e}", exc_info=True)
            raise HTTPException(
                status_code=503,
                detail="Bob AI unavailable"
            )
    
    async def generate_summary(self, metadata_chunk: Dict[str, Any], repo_url: str) -> str:
        """
        Generate repository summary from metadata
        
        Args:
            metadata_chunk: Chunk with type="METADATA" and content
            repo_url: Repository URL
        
        Returns:
            Plain text summary (3 paragraphs)
        """
        try:
            logger.info("Generating repository summary with Bob AI...")
            
            user_prompt = f"""Given the repo metadata and file tree below, write a clear 3-paragraph summary covering:
(1) What this project does and its purpose,
(2) The tech stack and architecture style,
(3) Who would use it and why.

Be specific. Reference actual file names.

{metadata_chunk.get('content', '')}

Repository URL: {repo_url}"""
            
            messages = [
                {
                    "role": "system",
                    "content": "You are RepoSense, an expert code analyst."
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
            
            summary = await self._call_bob_api(messages)
            logger.info("Summary generated successfully")
            return summary
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error generating summary: {e}", exc_info=True)
            return f"This repository is located at {repo_url}. Unable to generate detailed summary at this time."
    
    async def generate_architecture_map(self, code_chunks: List[Dict[str, Any]], repo_name: str) -> Dict[str, Any]:
        """
        Generate architecture map from code chunks
        
        Args:
            code_chunks: List of CODE chunks
            repo_name: Repository name
        
        Returns:
            Dict with nodes and edges for D3 visualization
        """
        try:
            logger.info("Generating architecture map with Bob AI...")
            
            # Combine code chunks (limit to avoid token overflow)
            combined_code = "\n\n".join(
                chunk.get('content', '')[:5000]  # Limit each chunk
                for chunk in code_chunks[:5]  # Max 5 chunks
                if chunk.get('type') == 'CODE'
            )
            
            user_prompt = f"""Analyze these code files and return ONLY valid JSON (no markdown) in this exact format:
{{"nodes": [{{"id": "string", "label": "string", "type": "frontend|backend|database|config|test", "file_count": number}}],
"edges": [{{"source": "id", "target": "id", "label": "imports|calls|extends"}}]}}

Identify the main modules/folders as nodes.
Draw edges where one module depends on another.
Maximum 12 nodes, 20 edges.

Repository: {repo_name}

Code files:
{combined_code}"""
            
            messages = [
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
            
            response = await self._call_bob_api(messages, max_tokens=1500)
            
            # Parse JSON response
            try:
                # Remove markdown code blocks if present
                json_str = response.strip()
                if json_str.startswith('```'):
                    json_str = json_str.split('```')[1]
                    if json_str.startswith('json'):
                        json_str = json_str[4:]
                json_str = json_str.strip()
                
                arch_map = json.loads(json_str)
                logger.info(f"Architecture map generated: {len(arch_map.get('nodes', []))} nodes")
                return arch_map
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse architecture JSON: {e}")
                # Return fallback structure
                return {
                    "nodes": [
                        {"id": "root", "label": repo_name, "type": "backend", "file_count": 1}
                    ],
                    "edges": []
                }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error generating architecture map: {e}", exc_info=True)
            return {"nodes": [], "edges": []}
    
    async def generate_complexity_map(self, code_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate complexity/risk map from code chunks
        
        Args:
            code_chunks: List of CODE chunks
        
        Returns:
            List of FileRisk dicts (top 15 highest-risk files)
        """
        try:
            logger.info("Generating complexity map with Bob AI...")
            
            # Combine code chunks
            combined_code = "\n\n".join(
                chunk.get('content', '')[:5000]
                for chunk in code_chunks[:5]
                if chunk.get('type') == 'CODE'
            )
            
            user_prompt = f"""Analyze these files for complexity. Return ONLY valid JSON array (no markdown):
[{{"filename": "path/to/file.py", "risk_score": 0-10, "reason": "one sentence explanation"}}]

Score criteria: 10=extremely complex/risky, 0=simple/safe.
Consider: nesting depth, function length, coupling, unclear naming.
Return top 15 highest-risk files only.

Code files:
{combined_code}"""
            
            messages = [
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
            
            response = await self._call_bob_api(messages, max_tokens=1500)
            
            # Parse JSON response
            try:
                json_str = response.strip()
                if json_str.startswith('```'):
                    json_str = json_str.split('```')[1]
                    if json_str.startswith('json'):
                        json_str = json_str[4:]
                json_str = json_str.strip()
                
                complexity_map = json.loads(json_str)
                logger.info(f"Complexity map generated: {len(complexity_map)} files")
                return complexity_map
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse complexity JSON: {e}")
                return []
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error generating complexity map: {e}", exc_info=True)
            return []
    
    async def generate_onboarding_guide(
        self,
        summary: str,
        arch_map: Dict[str, Any],
        complexity_map: List[Dict[str, Any]],
        repo_name: str
    ) -> str:
        """
        Generate onboarding guide for new developers
        
        Args:
            summary: Repository summary
            arch_map: Architecture map
            complexity_map: Complexity/risk map
            repo_name: Repository name
        
        Returns:
            Markdown-formatted onboarding guide
        """
        try:
            logger.info("Generating onboarding guide with Bob AI...")
            
            # Get top 5 high-risk files
            top_risks = sorted(
                complexity_map,
                key=lambda x: x.get('risk_score', 0),
                reverse=True
            )[:5]
            
            user_prompt = f"""You are a senior engineer onboarding a new developer to {repo_name}.

Using this analysis:

Summary: {summary}

Architecture: {json.dumps(arch_map, indent=2)}

High-risk files: {json.dumps(top_risks, indent=2)}

Write a structured onboarding guide in markdown:

## Welcome to {repo_name}
## What This Project Does (2-3 sentences)
## How to Get Started (numbered steps)
## Key Files to Know (table: file | purpose)
## Files to Be Careful With (risk reasons)
## Suggested First Tasks for New Devs"""
            
            messages = [
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
            
            guide = await self._call_bob_api(messages, max_tokens=2500)
            logger.info("Onboarding guide generated successfully")
            return guide
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error generating onboarding guide: {e}", exc_info=True)
            return f"# Welcome to {repo_name}\n\nOnboarding guide generation failed. Please refer to the README file."
    
    async def chat(
        self,
        question: str,
        repo_summary: str,
        chat_history: List[Dict[str, Any]]
    ) -> str:
        """
        Chat with AI about the codebase
        
        Args:
            question: User's question
            repo_summary: Repository summary for context
            chat_history: Previous chat messages
        
        Returns:
            AI assistant's answer
        """
        try:
            logger.info(f"Processing chat question: {question[:50]}...")
            
            # Build messages array
            messages = [
                {
                    "role": "system",
                    "content": f"""You are an expert assistant for a codebase.
You have deep knowledge of this repository:

{repo_summary}

Answer developer questions accurately and helpfully.
If you don't know, say so."""
                }
            ]
            
            # Add chat history (last 10 messages)
            for msg in chat_history[-10:]:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
            
            # Add current question
            messages.append({
                "role": "user",
                "content": question
            })
            
            answer = await self._call_bob_api(messages, max_tokens=1000)
            logger.info("Chat response generated successfully")
            return answer
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in chat: {e}", exc_info=True)
            return "I'm sorry, I encountered an error processing your question. Please try again."
    
    async def analyze_full(self, chunks: List[Dict[str, Any]], repo_url: str) -> Dict[str, Any]:
        """
        Orchestrate full repository analysis
        
        Calls generate_summary, generate_architecture_map,
        generate_complexity_map, and generate_onboarding_guide
        in the correct order.
        
        Args:
            chunks: List of chunks from chunker_service
            repo_url: Repository URL
        
        Returns:
            Complete AnalysisResult-compatible dict
        """
        try:
            logger.info("Starting full repository analysis with Bob AI...")
            
            # Extract metadata and code chunks
            metadata_chunk = next((c for c in chunks if c.get('type') == 'METADATA'), None)
            code_chunks = [c for c in chunks if c.get('type') == 'CODE']
            
            if not metadata_chunk:
                raise ValueError("No metadata chunk found")
            
            # Extract repo name from URL
            repo_name = repo_url.rstrip('/').split('/')[-1]
            
            # Step 1: Generate summary
            logger.info("Step 1/4: Generating summary...")
            summary = await self.generate_summary(metadata_chunk, repo_url)
            
            # Step 2: Generate architecture map
            logger.info("Step 2/4: Generating architecture map...")
            arch_map = await self.generate_architecture_map(code_chunks, repo_name)
            
            # Step 3: Generate complexity map
            logger.info("Step 3/4: Generating complexity map...")
            complexity_map = await self.generate_complexity_map(code_chunks)
            
            # Step 4: Generate onboarding guide
            logger.info("Step 4/4: Generating onboarding guide...")
            onboarding_guide = await self.generate_onboarding_guide(
                summary, arch_map, complexity_map, repo_name
            )
            
            # Extract tech stack from metadata
            tech_stack = []
            if metadata_chunk:
                content = metadata_chunk.get('content', '')
                if 'Detected Languages:' in content:
                    lang_line = content.split('Detected Languages:')[1].split('\n')[0]
                    tech_stack = [lang.split('(')[0].strip() for lang in lang_line.split(',')]
            
            logger.info("Full analysis completed successfully")
            
            return {
                "summary": summary,
                "tech_stack": tech_stack[:10],  # Limit to 10
                "architecture": arch_map,
                "complexity_map": complexity_map,
                "onboarding_guide": onboarding_guide
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in full analysis: {e}", exc_info=True)
            raise HTTPException(
                status_code=503,
                detail=f"Bob AI analysis failed: {str(e)}"
            )

# Made with Bob
