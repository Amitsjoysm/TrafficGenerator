from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import aiohttp
from bs4 import BeautifulSoup
import re
from groq import Groq
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Groq client
groq_client = Groq(api_key=os.environ['GROQ_API_KEY'])

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class ContentCreate(BaseModel):
    url: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    input_type: str  # 'url' or 'manual'

class Content(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: Optional[str] = None
    title: str
    content: str
    optimized_title: Optional[str] = None
    optimized_description: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    structured_data: Optional[Dict[str, Any]] = None
    performance_score: float = 0.0
    views: int = 0
    llm_queries: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SyntheticQuery(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_id: str
    query: str
    response: str
    relevance_score: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyticsData(BaseModel):
    total_content: int
    total_queries: int
    avg_performance_score: float
    top_performing: List[Dict[str, Any]]
    recent_queries: List[Dict[str, Any]]

# Helper functions
async def crawl_url(url: str) -> Dict[str, str]:
    """Crawl a URL and extract title and content"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail="Failed to fetch URL")
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Extract title
                title = soup.find('title')
                title_text = title.get_text().strip() if title else "Untitled"
                
                # Extract main content
                content_tags = soup.find_all(['p', 'h1', 'h2', 'h3', 'article'])
                content = ' '.join([tag.get_text().strip() for tag in content_tags])
                
                # Clean content
                content = re.sub(r'\s+', ' ', content).strip()
                
                return {"title": title_text, "content": content[:5000]}  # Limit content length
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to crawl URL: {str(e)}")

def generate_optimized_metadata(title: str, content: str) -> Dict[str, Any]:
    """Generate LLM-optimized metadata using Groq"""
    try:
        prompt = f"""Analyze this content and generate SEO/LLM-optimized metadata:

Title: {title}
Content: {content[:2000]}

Provide:
1. An optimized title (max 60 chars)
2. An optimized meta description (max 160 chars)
3. 5-10 relevant keywords
4. A performance score (0-100) based on content quality

Respond in JSON format:
{{
  "optimized_title": "...",
  "optimized_description": "...",
  "keywords": ["..."],
  "performance_score": 85
}}"""
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an SEO expert. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        logging.error(f"Error generating metadata: {str(e)}")
        return {
            "optimized_title": title,
            "optimized_description": content[:160],
            "keywords": [],
            "performance_score": 50
        }

def generate_structured_data(title: str, content: str, url: Optional[str]) -> Dict[str, Any]:
    """Generate Schema.org structured data"""
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "articleBody": content[:500],
        "url": url or "",
        "datePublished": datetime.now(timezone.utc).isoformat(),
        "author": {
            "@type": "Person",
            "name": "Content Creator"
        }
    }

async def generate_synthetic_queries(content_id: str, title: str, content: str) -> List[str]:
    """Generate synthetic queries that might lead to this content"""
    try:
        prompt = f"""Generate 5 diverse search queries that users might ask an LLM that would make this content relevant:

Title: {title}
Content: {content[:1000]}

Provide queries as a JSON array:
["query1", "query2", "query3", "query4", "query5"]"""
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a search query expert. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=300
        )
        
        queries = json.loads(response.choices[0].message.content)
        return queries if isinstance(queries, list) else []
    except Exception as e:
        logging.error(f"Error generating queries: {str(e)}")
        return []

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Organic Traffic Generator API"}

@api_router.post("/content", response_model=Content)
async def create_content(input: ContentCreate):
    try:
        # Extract content based on input type
        if input.input_type == 'url' and input.url:
            crawled = await crawl_url(input.url)
            title = crawled['title']
            content = crawled['content']
            url = input.url
        else:
            title = input.title or "Untitled"
            content = input.content or ""
            url = None
        
        # Generate optimized metadata
        metadata = generate_optimized_metadata(title, content)
        
        # Generate structured data
        structured_data = generate_structured_data(title, content, url)
        
        # Create content object
        content_obj = Content(
            url=url,
            title=title,
            content=content,
            optimized_title=metadata.get('optimized_title', title),
            optimized_description=metadata.get('optimized_description', content[:160]),
            keywords=metadata.get('keywords', []),
            structured_data=structured_data,
            performance_score=metadata.get('performance_score', 50)
        )
        
        # Save to database
        doc = content_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.contents.insert_one(doc)
        
        # Generate synthetic queries in background
        queries = await generate_synthetic_queries(content_obj.id, title, content)
        for query in queries:
            query_obj = SyntheticQuery(
                content_id=content_obj.id,
                query=query,
                response=f"Based on our content: {content[:200]}...",
                relevance_score=85.0
            )
            query_doc = query_obj.model_dump()
            query_doc['created_at'] = query_doc['created_at'].isoformat()
            await db.queries.insert_one(query_doc)
        
        return content_obj
    except Exception as e:
        logging.error(f"Error creating content: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/content", response_model=List[Content])
async def get_all_content():
    contents = await db.contents.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for content in contents:
        if isinstance(content.get('created_at'), str):
            content['created_at'] = datetime.fromisoformat(content['created_at'])
        if isinstance(content.get('updated_at'), str):
            content['updated_at'] = datetime.fromisoformat(content['updated_at'])
    
    return contents

@api_router.get("/content/{content_id}", response_model=Content)
async def get_content(content_id: str):
    content = await db.contents.find_one({"id": content_id}, {"_id": 0})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if isinstance(content.get('created_at'), str):
        content['created_at'] = datetime.fromisoformat(content['created_at'])
    if isinstance(content.get('updated_at'), str):
        content['updated_at'] = datetime.fromisoformat(content['updated_at'])
    
    # Increment views
    await db.contents.update_one(
        {"id": content_id},
        {"$inc": {"views": 1}}
    )
    
    return content

@api_router.delete("/content/{content_id}")
async def delete_content(content_id: str):
    result = await db.contents.delete_one({"id": content_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Delete associated queries
    await db.queries.delete_many({"content_id": content_id})
    
    return {"message": "Content deleted successfully"}

@api_router.get("/queries/{content_id}", response_model=List[SyntheticQuery])
async def get_content_queries(content_id: str):
    queries = await db.queries.find({"content_id": content_id}, {"_id": 0}).to_list(100)
    
    for query in queries:
        if isinstance(query.get('created_at'), str):
            query['created_at'] = datetime.fromisoformat(query['created_at'])
    
    return queries

@api_router.get("/analytics", response_model=AnalyticsData)
async def get_analytics():
    # Get total content count
    total_content = await db.contents.count_documents({})
    
    # Get total queries count
    total_queries = await db.queries.count_documents({})
    
    # Calculate average performance score
    pipeline = [
        {"$group": {"_id": None, "avg_score": {"$avg": "$performance_score"}}}
    ]
    avg_result = await db.contents.aggregate(pipeline).to_list(1)
    avg_score = avg_result[0]['avg_score'] if avg_result else 0
    
    # Get top performing content
    top_content = await db.contents.find(
        {}, {"_id": 0, "id": 1, "title": 1, "performance_score": 1, "views": 1}
    ).sort("performance_score", -1).limit(5).to_list(5)
    
    # Get recent queries
    recent_queries = await db.queries.find(
        {}, {"_id": 0, "query": 1, "relevance_score": 1, "created_at": 1}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return AnalyticsData(
        total_content=total_content,
        total_queries=total_queries,
        avg_performance_score=round(avg_score, 2),
        top_performing=top_content,
        recent_queries=recent_queries
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()