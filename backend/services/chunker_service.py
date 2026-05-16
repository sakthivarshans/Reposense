"""
Chunker Service
Handles smart chunking of repository data for Bob AI analysis
"""

from typing import Dict, Any, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ChunkerService:
    """Service for chunking repository data for Bob AI"""
    
    def __init__(self):
        # Max characters per code chunk
        self.max_chunk_size = 8000
        
        # Maximum total chunks to control Bob token usage
        self.max_chunks = 10
    
    def chunk_repo(self, repo_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Create structured chunks from repository data for Bob AI analysis
        
        Chunking strategy:
        - Chunk 1: METADATA chunk with repo info and file tree listing
        - Chunk 2+: CODE chunks grouped by folder, max 8000 chars each
        
        Args:
            repo_data: Output from fetch_repo_tree with keys:
                      - metadata: {name, description, language, stars, default_branch}
                      - files: [{path, content, size, extension}, ...]
        
        Returns:
            List of chunks, each dict with:
            - type: "METADATA" or "CODE"
            - content: String content for Bob AI
            - file_paths_covered: List of file paths in this chunk
        """
        try:
            metadata = repo_data.get("metadata", {})
            files = repo_data.get("files", [])
            
            logger.info(f"Chunking repository: {metadata.get('name', 'Unknown')}")
            logger.info(f"Total files to chunk: {len(files)}")
            
            chunks = []
            
            # Chunk 1: METADATA chunk
            metadata_chunk = self._create_metadata_chunk(metadata, files)
            chunks.append(metadata_chunk)
            logger.info(f"Created METADATA chunk ({len(metadata_chunk['content'])} chars)")
            
            # Chunk 2+: CODE chunks
            code_chunks = self._create_code_chunks(files)
            chunks.extend(code_chunks)
            logger.info(f"Created {len(code_chunks)} CODE chunks")
            
            # Limit to max_chunks total
            if len(chunks) > self.max_chunks:
                logger.warning(f"Limiting chunks from {len(chunks)} to {self.max_chunks}")
                chunks = chunks[:self.max_chunks]
            
            logger.info(f"Final chunk count: {len(chunks)}")
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error chunking repository: {e}", exc_info=True)
            return []
    
    def _create_metadata_chunk(
        self,
        metadata: Dict[str, Any],
        files: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Create the METADATA chunk with repo info and file tree listing
        
        Args:
            metadata: Repository metadata
            files: List of files
        
        Returns:
            Metadata chunk dict
        """
        # Build file tree listing (paths only, no content)
        file_tree = "\n".join(f"  - {file['path']}" for file in files)
        
        # Detect primary languages from file extensions
        extensions = {}
        for file in files:
            ext = file.get('extension', '')
            if ext:
                extensions[ext] = extensions.get(ext, 0) + 1
        
        top_extensions = sorted(extensions.items(), key=lambda x: x[1], reverse=True)[:5]
        detected_languages = ", ".join(f"{ext} ({count})" for ext, count in top_extensions)
        
        content = f"""# REPOSITORY METADATA

## Basic Information
- **Name:** {metadata.get('name', 'Unknown')}
- **Description:** {metadata.get('description', 'No description provided')}
- **Primary Language:** {metadata.get('language', 'Unknown')}
- **Stars:** {metadata.get('stars', 0)}
- **Default Branch:** {metadata.get('default_branch', 'main')}

## File Statistics
- **Total Files:** {len(files)}
- **Detected Languages:** {detected_languages}

## File Tree
{file_tree}

---
"""
        
        return {
            "type": "METADATA",
            "content": content,
            "file_paths_covered": [file['path'] for file in files]
        }
    
    def _create_code_chunks(self, files: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Create CODE chunks grouped by folder, max 8000 chars each
        
        Args:
            files: List of files with content
        
        Returns:
            List of code chunk dicts
        """
        # Group files by directory
        files_by_dir = {}
        for file in files:
            path = file['path']
            directory = self._get_directory(path)
            
            if directory not in files_by_dir:
                files_by_dir[directory] = []
            files_by_dir[directory].append(file)
        
        logger.info(f"Grouped files into {len(files_by_dir)} directories")
        
        # Create chunks
        chunks = []
        current_chunk_content = ""
        current_chunk_files = []
        current_directory = None
        
        for directory in sorted(files_by_dir.keys()):
            dir_files = files_by_dir[directory]
            
            for file in dir_files:
                file_header = f"\n{'='*80}\n# FILE: {file['path']}\n{'='*80}\n\n"
                file_content = file.get('content', '')
                file_block = file_header + file_content + "\n\n"
                
                # Check if adding this file would exceed chunk size
                if len(current_chunk_content) + len(file_block) > self.max_chunk_size:
                    # Save current chunk if it has content
                    if current_chunk_content:
                        chunks.append({
                            "type": "CODE",
                            "content": current_chunk_content,
                            "file_paths_covered": current_chunk_files.copy()
                        })
                        logger.debug(f"Created CODE chunk with {len(current_chunk_files)} files "
                                   f"({len(current_chunk_content)} chars)")
                    
                    # Start new chunk
                    current_chunk_content = file_block
                    current_chunk_files = [file['path']]
                    current_directory = directory
                else:
                    # Add to current chunk
                    current_chunk_content += file_block
                    current_chunk_files.append(file['path'])
        
        # Add final chunk if it has content
        if current_chunk_content:
            chunks.append({
                "type": "CODE",
                "content": current_chunk_content,
                "file_paths_covered": current_chunk_files
            })
            logger.debug(f"Created final CODE chunk with {len(current_chunk_files)} files "
                       f"({len(current_chunk_content)} chars)")
        
        return chunks
    
    def _get_directory(self, file_path: str) -> str:
        """
        Get directory path from file path
        
        Args:
            file_path: Full file path
        
        Returns:
            Directory path or "root" if file is in root
        """
        if '/' not in file_path:
            return "root"
        
        parts = file_path.split('/')
        return '/'.join(parts[:-1])
    
    def estimate_bob_cost(self, chunks: List[Dict[str, Any]]) -> float:
        """
        Estimate Bob AI cost in Bobcoins
        
        Rough estimate: 1 Bobcoin per 2000 characters
        
        Args:
            chunks: List of chunks
        
        Returns:
            Estimated cost in Bobcoins
        """
        total_chars = sum(len(chunk['content']) for chunk in chunks)
        estimated_cost = total_chars / 2000.0
        
        logger.info(f"Estimated Bob cost: {estimated_cost:.2f} Bobcoins "
                   f"({total_chars:,} total characters)")
        
        return round(estimated_cost, 2)

# Made with Bob
