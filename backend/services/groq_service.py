"""
Groq AI Service
Handles all AI-powered analysis using Groq API
"""

import os
import json
import httpx
from typing import Dict, List, Any

# Groq API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")  # Default to Mixtral


async def _call_groq(messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: int = 4000) -> str:
    """
    Make a request to Groq API
    
    Args:
        messages: List of message dicts with 'role' and 'content'
        temperature: Sampling temperature (0-2)
        max_tokens: Maximum tokens in response
        
    Returns:
        Response text from Groq
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY environment variable not set")
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(
                GROQ_API_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
            
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            raise Exception(f"Groq API error: {e.response.status_code} - {error_detail}")
        except Exception as e:
            raise Exception(f"Groq API request failed: {str(e)}")


async def generate_summary(chunks: List[Dict[str, Any]]) -> str:
    """
    Generate a comprehensive repository summary using Groq
    
    Args:
        chunks: List of code chunks with metadata
        
    Returns:
        3-paragraph summary of the repository
    """
    # Prepare context from chunks
    metadata_chunk = next((c for c in chunks if c.get("type") == "METADATA"), None)
    code_samples = "\n\n".join([
        f"File: {c.get('file', 'unknown')}\n{c.get('content', '')[:500]}"
        for c in chunks[1:6] if c.get("type") == "CODE"  # First 5 code chunks
    ])
    
    repo_structure = metadata_chunk.get("content", "") if metadata_chunk else ""
    
    messages = [
        {
            "role": "system",
            "content": "You are an expert software architect analyzing codebases. Provide clear, concise analysis."
        },
        {
            "role": "user",
            "content": f"""Analyze this codebase and generate a comprehensive 3-paragraph summary:

Repository Structure:
{repo_structure}

Sample Code:
{code_samples}

Generate exactly 3 paragraphs:
1. What this project does and its main purpose
2. Key technologies, frameworks, and architecture patterns used
3. Notable features, design decisions, and code organization

Be specific and technical."""
        }
    ]
    
    return await _call_groq(messages, temperature=0.7, max_tokens=1000)


async def generate_architecture_map(chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate architecture map as JSON with nodes and edges
    
    Args:
        chunks: List of code chunks
        
    Returns:
        Dict with 'nodes' and 'edges' for D3.js visualization
    """
    metadata_chunk = next((c for c in chunks if c.get("type") == "METADATA"), None)
    repo_structure = metadata_chunk.get("content", "") if metadata_chunk else ""
    
    messages = [
        {
            "role": "system",
            "content": "You are an expert at analyzing software architecture. Return only valid JSON."
        },
        {
            "role": "user",
            "content": f"""Analyze this codebase structure and generate an architecture map as JSON.

Repository Structure:
{repo_structure}

Return a JSON object with this exact format:
{{
  "nodes": [
    {{"id": "module1", "label": "Module Name", "type": "frontend", "description": "Brief description"}},
    {{"id": "module2", "label": "Another Module", "type": "backend", "description": "Brief description"}}
  ],
  "edges": [
    {{"source": "module1", "target": "module2", "label": "depends on"}}
  ]
}}

Types can be: frontend, backend, database, config, test
Identify 8-12 major modules and their relationships.
Return ONLY the JSON, no other text."""
        }
    ]
    
    response = await _call_groq(messages, temperature=0.3, max_tokens=2000)
    
    # Parse JSON response
    try:
        # Try to extract JSON if wrapped in markdown
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].split("```")[0].strip()
        
        return json.loads(response)
    except json.JSONDecodeError:
        # Fallback structure
        return {
            "nodes": [
                {"id": "main", "label": "Main Application", "type": "backend", "description": "Core application logic"}
            ],
            "edges": []
        }


async def generate_complexity_map(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generate complexity/risk scores for files
    
    Args:
        chunks: List of code chunks
        
    Returns:
        List of dicts with filename, risk_score, and reason
    """
    # Get file information from chunks
    files_info = []
    for chunk in chunks:
        if chunk.get("type") == "CODE" and chunk.get("file"):
            files_info.append({
                "file": chunk["file"],
                "content_preview": chunk.get("content", "")[:300]
            })
    
    if not files_info:
        return []
    
    # Limit to 15 files for analysis
    files_info = files_info[:15]
    
    files_list = "\n".join([
        f"{i+1}. {f['file']}\n   Preview: {f['content_preview'][:100]}..."
        for i, f in enumerate(files_info)
    ])
    
    messages = [
        {
            "role": "system",
            "content": "You are a code quality expert. Analyze code complexity and risk. Return only valid JSON."
        },
        {
            "role": "user",
            "content": f"""Analyze these files and assign risk scores (0-10) based on complexity, size, and potential issues.

Files:
{files_list}

Return a JSON array with this exact format:
[
  {{"filename": "path/to/file.js", "risk_score": 8, "reason": "High complexity, many dependencies"}},
  {{"filename": "path/to/file2.py", "risk_score": 3, "reason": "Simple utility functions"}}
]

Consider:
- Code complexity and nesting
- File size and length
- Number of dependencies
- Critical functionality
- Error handling

Return ONLY the JSON array, no other text."""
        }
    ]
    
    response = await _call_groq(messages, temperature=0.3, max_tokens=2000)
    
    # Parse JSON response
    try:
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].split("```")[0].strip()
        
        return json.loads(response)
    except json.JSONDecodeError:
        # Fallback: generate basic scores
        return [
            {
                "filename": f["file"],
                "risk_score": 5,
                "reason": "Unable to analyze complexity"
            }
            for f in files_info[:10]
        ]


async def generate_onboarding_guide(chunks: List[Dict[str, Any]], summary: str) -> str:
    """
    Generate comprehensive onboarding guide in markdown
    
    Args:
        chunks: List of code chunks
        summary: Repository summary
        
    Returns:
        Markdown formatted onboarding guide
    """
    metadata_chunk = next((c for c in chunks if c.get("type") == "METADATA"), None)
    repo_structure = metadata_chunk.get("content", "") if metadata_chunk else ""
    
    messages = [
        {
            "role": "system",
            "content": "You are a technical writer creating developer onboarding documentation. Use clear markdown formatting."
        },
        {
            "role": "user",
            "content": f"""Create a comprehensive onboarding guide for new developers joining this project.

Project Summary:
{summary}

Repository Structure:
{repo_structure}

Create a markdown guide with these sections:

## Project Overview
Brief introduction to the project

## Getting Started
### Prerequisites
### Installation Steps
### Running the Project

## Architecture
Explain the overall architecture and key components

## Key Files and Directories
Table of important files with descriptions

## Development Workflow
How to make changes and contribute

## Best Practices
Coding standards and conventions

## Common Tasks
Examples of common development tasks

Use proper markdown formatting with headers, lists, code blocks, and tables."""
        }
    ]
    
    return await _call_groq(messages, temperature=0.7, max_tokens=3000)


async def chat(question: str, chunks: List[Dict[str, Any]], history: List[Dict[str, str]] = None) -> str:
    """
    Answer questions about the codebase using Groq
    
    Args:
        question: User's question
        chunks: Repository code chunks for context
        history: Previous chat messages
        
    Returns:
        Answer to the question
    """
    # Prepare context
    metadata_chunk = next((c for c in chunks if c.get("type") == "METADATA"), None)
    repo_context = metadata_chunk.get("content", "")[:2000] if metadata_chunk else ""
    
    # Build messages
    messages = [
        {
            "role": "system",
            "content": f"""You are an expert software developer helping someone understand a codebase.

Repository Context:
{repo_context}

Answer questions clearly and concisely. Reference specific files and code when relevant."""
        }
    ]
    
    # Add chat history
    if history:
        messages.extend(history[-10:])  # Last 10 messages for context
    
    # Add current question
    messages.append({
        "role": "user",
        "content": question
    })
    
    return await _call_groq(messages, temperature=0.7, max_tokens=1000)


async def analyze_full(chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Perform full repository analysis using Groq
    
    Args:
        chunks: List of code chunks
        
    Returns:
        Complete analysis results
    """
    # Generate all components
    summary = await generate_summary(chunks)
    architecture_map = await generate_architecture_map(chunks)
    complexity_map = await generate_complexity_map(chunks)
    onboarding_guide = await generate_onboarding_guide(chunks, summary)
    
    return {
        "summary": summary,
        "architecture_map": architecture_map,
        "complexity_map": complexity_map,
        "onboarding_guide": onboarding_guide
    }

# Made with Bob
