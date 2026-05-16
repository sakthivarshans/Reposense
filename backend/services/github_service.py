"""
GitHub Service
Handles interactions with GitHub REST API using httpx (async)
"""

import httpx
import os
import base64
from typing import Dict, Any, Optional, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GitHubService:
    """Service for interacting with GitHub REST API"""
    
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        # Allowed file extensions for code analysis
        self.allowed_extensions = {
            '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.go', '.rs',
            '.cpp', '.c', '.cs', '.rb', '.php', '.swift', '.kt', '.md',
            '.yaml', '.yml', '.json', '.toml', '.env.example'
        }
        
        # Max file size to fetch content (50KB)
        self.max_file_size = 50 * 1024
        
        # Max files per repo to stay within Bob limits
        self.max_files = 150
    
    def _parse_repo_url(self, repo_url: str) -> tuple[str, str]:
        """
        Parse GitHub repository URL to extract owner and repo name
        
        Args:
            repo_url: GitHub repository URL (https://github.com/owner/repo)
        
        Returns:
            Tuple of (owner, repo_name)
        
        Raises:
            ValueError: If URL format is invalid
        """
        # Remove trailing slash and .git
        url = repo_url.rstrip('/').replace('.git', '')
        
        # Extract owner and repo from URL
        # Expected format: https://github.com/owner/repo
        parts = url.split('/')
        if len(parts) >= 2:
            owner = parts[-2]
            repo = parts[-1]
            return owner, repo
        
        raise ValueError(f"Invalid GitHub repository URL format: {repo_url}")
    
    def _is_allowed_file(self, file_path: str) -> bool:
        """
        Check if file should be included based on extension
        
        Args:
            file_path: Path to file
        
        Returns:
            True if file should be included, False otherwise
        """
        # Get file extension
        if '.' not in file_path:
            return False
        
        ext = '.' + file_path.split('.')[-1].lower()
        
        # Special case for .env.example
        if file_path.endswith('.env.example'):
            return True
        
        return ext in self.allowed_extensions
    
    async def fetch_repo_tree(self, repo_url: str) -> Optional[Dict[str, Any]]:
        """
        Fetch complete repository tree structure from GitHub
        
        Steps:
        1. Parse owner and repo from URL
        2. GET repo metadata
        3. GET full file tree (recursive)
        4. Filter code files only
        5. Fetch content for files under 50KB
        6. Return structured data
        
        Args:
            repo_url: GitHub repository URL
        
        Returns:
            Dictionary with keys:
            - metadata: {name, description, language, stars, default_branch}
            - files: [{path, content, size, extension}, ...]
            
            Returns None if repo not found or error occurs
        """
        try:
            # Step 1: Parse URL
            owner, repo = self._parse_repo_url(repo_url)
            logger.info(f"Fetching repository tree for {owner}/{repo}")
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                # Step 2: GET repo metadata
                logger.info("Fetching repository metadata...")
                repo_response = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo}",
                    headers=self.headers
                )
                
                if repo_response.status_code == 404:
                    logger.error(f"Repository not found: {owner}/{repo}")
                    return None
                elif repo_response.status_code == 403:
                    logger.error("GitHub API rate limit exceeded")
                    return None
                
                repo_response.raise_for_status()
                repo_data = repo_response.json()
                
                default_branch = repo_data.get("default_branch", "main")
                
                metadata = {
                    "name": repo_data.get("name", ""),
                    "description": repo_data.get("description", ""),
                    "language": repo_data.get("language", "Unknown"),
                    "stars": repo_data.get("stargazers_count", 0),
                    "default_branch": default_branch,
                    "owner": owner,
                    "repo": repo
                }
                
                logger.info(f"Metadata fetched: {metadata['name']} ({metadata['language']})")
                
                # Step 3: GET full file tree (recursive)
                logger.info(f"Fetching file tree for branch: {default_branch}")
                tree_response = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1",
                    headers=self.headers
                )
                tree_response.raise_for_status()
                tree_data = tree_response.json()
                
                # Step 4: Filter code files only
                all_files = tree_data.get("tree", [])
                logger.info(f"Total files in repository: {len(all_files)}")
                
                code_files = []
                for item in all_files:
                    if item["type"] == "blob":  # Only files, not directories
                        file_path = item["path"]
                        file_size = item.get("size", 0)
                        
                        # Filter by extension
                        if self._is_allowed_file(file_path):
                            code_files.append({
                                "path": file_path,
                                "size": file_size,
                                "sha": item.get("sha", ""),
                                "url": item.get("url", "")
                            })
                
                logger.info(f"Filtered to {len(code_files)} code files")
                
                # Limit to max_files
                if len(code_files) > self.max_files:
                    logger.info(f"Limiting to {self.max_files} files")
                    # Prioritize smaller files and common important files
                    code_files = sorted(code_files, key=lambda x: (
                        0 if any(name in x['path'].lower() for name in ['readme', 'main', 'index', 'app']) else 1,
                        x['size']
                    ))[:self.max_files]
                
                # Step 5: Fetch content for files under 50KB
                files_with_content = []
                for file_info in code_files:
                    if file_info["size"] <= self.max_file_size:
                        content = await self._fetch_file_content(
                            client, owner, repo, file_info["path"]
                        )
                        
                        if content is not None:
                            # Get extension
                            ext = '.' + file_info["path"].split('.')[-1] if '.' in file_info["path"] else ''
                            
                            files_with_content.append({
                                "path": file_info["path"],
                                "content": content,
                                "size": file_info["size"],
                                "extension": ext
                            })
                    else:
                        logger.debug(f"Skipping large file: {file_info['path']} ({file_info['size']} bytes)")
                
                logger.info(f"Fetched content for {len(files_with_content)} files")
                
                # Step 6: Return structured data
                return {
                    "metadata": metadata,
                    "files": files_with_content
                }
                
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.error(f"Repository not found: {repo_url}")
            elif e.response.status_code == 403:
                logger.error("GitHub API rate limit exceeded or access forbidden")
            else:
                logger.error(f"GitHub API error: {e}")
            return None
        except Exception as e:
            logger.error(f"Error fetching repository tree: {e}", exc_info=True)
            return None
    
    async def _fetch_file_content(
        self,
        client: httpx.AsyncClient,
        owner: str,
        repo: str,
        file_path: str
    ) -> Optional[str]:
        """
        Fetch content of a specific file from GitHub
        
        Args:
            client: httpx AsyncClient instance
            owner: Repository owner
            repo: Repository name
            file_path: Path to file in repository
        
        Returns:
            File content as string, or None if failed
        """
        try:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/contents/{file_path}",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            
            # Decode base64 content
            content = base64.b64decode(data["content"]).decode('utf-8', errors='ignore')
            return content
            
        except Exception as e:
            logger.debug(f"Failed to fetch content for {file_path}: {e}")
            return None

# Made with Bob
