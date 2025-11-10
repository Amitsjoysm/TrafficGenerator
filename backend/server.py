from fastapi import FastAPI, APIRouter, HTTPException, Response
from fastapi.responses import PlainTextResponse, JSONResponse
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
import textstat
from collections import Counter
from advanced_optimization import (
    extract_entities,
    extract_citation_snippets,
    calculate_topic_authority,
    generate_semantic_enrichment,
    analyze_search_intent,
    generate_people_also_ask,
    calculate_content_quality_score,
    generate_answer_box_content,
    generate_internal_linking_suggestions,
    generate_backlink_anchor_texts,
    calculate_content_freshness
)

# Import new services
from config import config
from services.seo_service import SEOService
from services.keyword_service import KeywordService
from services.export_service import ExportService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Groq client
groq_client = Groq(api_key=os.environ['GROQ_API_KEY'])

# Initialize services
seo_service = SEOService(groq_client)
keyword_service = KeywordService(groq_client)
export_service = ExportService()

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
    
    # Enhanced features
    social_posts: List[Dict[str, Any]] = Field(default_factory=list)
    faqs: List[Dict[str, str]] = Field(default_factory=list)
    voice_queries: List[str] = Field(default_factory=list)
    content_optimization: Optional[Dict[str, Any]] = None
    open_graph_tags: Optional[Dict[str, str]] = None
    twitter_card_tags: Optional[Dict[str, str]] = None
    
    # Advanced features
    entities: Optional[Dict[str, List[str]]] = None
    citation_snippets: List[Dict[str, str]] = Field(default_factory=list)
    topic_authority: Optional[Dict[str, Any]] = None
    semantic_enrichment: Optional[Dict[str, List[str]]] = None
    search_intent: Optional[Dict[str, Any]] = None
    people_also_ask: List[str] = Field(default_factory=list)
    quality_score: Optional[Dict[str, Any]] = None
    answer_box_content: Optional[Dict[str, Any]] = None
    internal_linking: List[Dict[str, str]] = Field(default_factory=list)
    backlink_anchors: List[Dict[str, str]] = Field(default_factory=list)
    freshness: Optional[Dict[str, Any]] = None
    
    # New production features
    lsi_keywords: List[str] = Field(default_factory=list)
    serp_optimization: Optional[Dict[str, Any]] = None
    keyword_gap: Optional[Dict[str, Any]] = None
    traffic_prediction: Optional[Dict[str, Any]] = None
    topic_clusters: Optional[Dict[str, Any]] = None
    meta_preview: Optional[Dict[str, Any]] = None
    seo_score: Optional[Dict[str, Any]] = None
    canonical_tags: Optional[Dict[str, str]] = None
    share_id: Optional[str] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SyntheticQuery(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_id: str
    query: str
    response: str
    relevance_score: float
    query_type: str = "standard"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalyticsData(BaseModel):
    total_content: int
    total_queries: int
    avg_performance_score: float
    avg_readability_score: float
    avg_quality_score: float
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
                
                for script in soup(["script", "style"]):
                    script.decompose()
                
                title = soup.find('title')
                title_text = title.get_text().strip() if title else "Untitled"
                
                content_tags = soup.find_all(['p', 'h1', 'h2', 'h3', 'article'])
                content = ' '.join([tag.get_text().strip() for tag in content_tags])
                content = re.sub(r'\s+', ' ', content).strip()
                
                return {"title": title_text, "content": content[:8000]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to crawl URL: {str(e)}")

def calculate_content_optimization(content: str) -> Dict[str, Any]:
    """Calculate readability and content optimization metrics"""
    try:
        flesch_score = textstat.flesch_reading_ease(content)
        flesch_grade = textstat.flesch_kincaid_grade(content)
        
        if flesch_score >= 90:
            reading_level = "Very Easy (5th grade)"
        elif flesch_score >= 80:
            reading_level = "Easy (6th grade)"
        elif flesch_score >= 70:
            reading_level = "Fairly Easy (7th grade)"
        elif flesch_score >= 60:
            reading_level = "Standard (8th-9th grade)"
        elif flesch_score >= 50:
            reading_level = "Fairly Difficult (10th-12th grade)"
        elif flesch_score >= 30:
            reading_level = "Difficult (College)"
        else:
            reading_level = "Very Difficult (College graduate)"
        
        words = content.split()
        word_count = len(words)
        
        words_lower = [w.lower() for w in words if len(w) > 4]
        word_freq = Counter(words_lower)
        top_words = dict(word_freq.most_common(10))
        keyword_density = {word: round((count / word_count) * 100, 2) for word, count in top_words.items()}
        
        recommendations = []
        if flesch_score < 60:
            recommendations.append("Consider simplifying sentences for better readability")
        if word_count < 300:
            recommendations.append("Content is too short. Aim for 500+ words for better SEO")
        elif word_count > 2000:
            recommendations.append("Content is very long. Consider breaking into multiple pages")
        if flesch_grade > 12:
            recommendations.append("Reading level is high. Simplify for broader audience")
        
        return {
            "readability_score": round(flesch_score, 2),
            "reading_level": reading_level,
            "flesch_kincaid_grade": round(flesch_grade, 2),
            "keyword_density": keyword_density,
            "word_count": word_count,
            "recommendations": recommendations
        }
    except Exception as e:
        logging.error(f"Error calculating optimization: {str(e)}")
        return {
            "readability_score": 50,
            "reading_level": "Standard",
            "keyword_density": {},
            "word_count": len(content.split()),
            "recommendations": []
        }

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

def generate_social_media_posts(title: str, content: str, keywords: List[str]) -> List[Dict[str, Any]]:
    """Generate social media posts for different platforms"""
    try:
        prompt = f"""Create engaging social media posts for this content:

Title: {title}
Content: {content[:1000]}
Keywords: {', '.join(keywords[:5])}

Generate posts for:
1. Twitter (max 280 chars, include 3 hashtags)
2. LinkedIn (professional tone, 150 chars, 2 hashtags)
3. Facebook (engaging, 200 chars, 3 hashtags)

Respond in JSON format:
{{
  "twitter": {{"post": "...", "hashtags": ["...", "...", "..."]}},
  "linkedin": {{"post": "...", "hashtags": ["...", "..."]}},
  "facebook": {{"post": "...", "hashtags": ["...", "...", "..."]}}
}}"""
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a social media expert. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=600
        )
        
        result = json.loads(response.choices[0].message.content)
        
        posts = []
        for platform, data in result.items():
            posts.append({
                "platform": platform.capitalize(),
                "post_text": data["post"],
                "hashtags": data["hashtags"]
            })
        
        return posts
    except Exception as e:
        logging.error(f"Error generating social posts: {str(e)}")
        return []

def generate_faqs(title: str, content: str) -> List[Dict[str, str]]:
    """Generate FAQ section for better LLM pickup"""
    try:
        prompt = f"""Generate 5 frequently asked questions and answers based on this content:

Title: {title}
Content: {content[:1500]}

Provide questions that users might ask about this topic, with clear, concise answers.

Respond in JSON format:
[
  {{"question": "...", "answer": "..."}},
  {{"question": "...", "answer": "..."}}
]"""
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a content expert. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        faqs = json.loads(response.choices[0].message.content)
        return faqs if isinstance(faqs, list) else []
    except Exception as e:
        logging.error(f"Error generating FAQs: {str(e)}")
        return []

def generate_voice_queries(title: str, content: str) -> List[str]:
    """Generate voice search and conversational queries"""
    try:
        prompt = f"""Generate 5 voice search queries (conversational, question-based) that users might ask:

Title: {title}
Content: {content[:1000]}

Examples:
- "Hey Siri, what is..."
- "Alexa, how do I..."
- "OK Google, tell me about..."

Provide natural, conversational queries as a JSON array:
["query1", "query2", "query3", "query4", "query5"]"""
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a voice search expert. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=400
        )
        
        queries = json.loads(response.choices[0].message.content)
        return queries if isinstance(queries, list) else []
    except Exception as e:
        logging.error(f"Error generating voice queries: {str(e)}")
        return []

def generate_structured_data(title: str, content: str, url: Optional[str], faqs: List[Dict[str, str]]) -> Dict[str, Any]:
    """Generate Schema.org structured data with FAQs"""
    structured_data = {
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
    
    if faqs:
        structured_data["mainEntity"] = {
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": faq["question"],
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq["answer"]
                    }
                } for faq in faqs[:5]
            ]
        }
    
    return structured_data

def generate_open_graph_tags(title: str, description: str, url: Optional[str]) -> Dict[str, str]:
    """Generate Open Graph meta tags for social sharing"""
    return {
        "og:title": title,
        "og:description": description,
        "og:type": "article",
        "og:url": url or "",
        "og:site_name": "Traffic Wizard"
    }

def generate_twitter_card_tags(title: str, description: str) -> Dict[str, str]:
    """Generate Twitter Card meta tags"""
    return {
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description
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
    return {"message": "Organic Traffic Generator API with Advanced Optimization"}

@api_router.post("/content", response_model=Content)
async def create_content(input: ContentCreate):
    try:
        if input.input_type == 'url' and input.url:
            crawled = await crawl_url(input.url)
            title = crawled['title']
            content = crawled['content']
            url = input.url
        else:
            title = input.title or "Untitled"
            content = input.content or ""
            url = None
        
        # Basic optimizations
        metadata = generate_optimized_metadata(title, content)
        content_optimization = calculate_content_optimization(content)
        faqs = generate_faqs(title, content)
        social_posts = generate_social_media_posts(title, content, metadata.get('keywords', []))
        voice_queries = generate_voice_queries(title, content)
        
        # Advanced optimizations
        entities = extract_entities(content)
        citation_snippets = extract_citation_snippets(content, title)
        topic_authority = calculate_topic_authority(content, metadata.get('keywords', []))
        semantic_enrichment = generate_semantic_enrichment(content, metadata.get('keywords', []))
        search_intent = analyze_search_intent(title, content)
        people_also_ask = generate_people_also_ask(title, content, metadata.get('keywords', []))
        quality_score = calculate_content_quality_score(
            content, 
            entities, 
            content_optimization.get('readability_score', 50),
            len(metadata.get('keywords', []))
        )
        answer_box_content = generate_answer_box_content(content, metadata.get('keywords', []))
        internal_linking = generate_internal_linking_suggestions(title, metadata.get('keywords', []))
        backlink_anchors = generate_backlink_anchor_texts(title, metadata.get('keywords', []))
        
        structured_data = generate_structured_data(title, content, url, faqs)
        
        optimized_title = metadata.get('optimized_title', title)
        optimized_description = metadata.get('optimized_description', content[:160])
        open_graph_tags = generate_open_graph_tags(optimized_title, optimized_description, url)
        twitter_card_tags = generate_twitter_card_tags(optimized_title, optimized_description)
        
        # NEW: Production-ready features
        lsi_keywords = seo_service.generate_lsi_keywords(content, metadata.get('keywords', []))
        serp_optimization = seo_service.generate_serp_optimization(title, content, metadata.get('keywords', []))
        meta_preview = seo_service.generate_meta_preview(optimized_title, optimized_description, url)
        
        # Generate unique share ID
        share_id = str(uuid.uuid4())[:8]
        canonical_tags = seo_service.generate_canonical_tags(url, share_id)
        
        content_obj = Content(
            url=url,
            title=title,
            content=content,
            optimized_title=optimized_title,
            optimized_description=optimized_description,
            keywords=metadata.get('keywords', []),
            structured_data=structured_data,
            performance_score=metadata.get('performance_score', 50),
            social_posts=social_posts,
            faqs=faqs,
            voice_queries=voice_queries,
            content_optimization=content_optimization,
            open_graph_tags=open_graph_tags,
            twitter_card_tags=twitter_card_tags,
            entities=entities,
            citation_snippets=citation_snippets,
            topic_authority=topic_authority,
            semantic_enrichment=semantic_enrichment,
            search_intent=search_intent,
            people_also_ask=people_also_ask,
            quality_score=quality_score,
            answer_box_content=answer_box_content,
            internal_linking=internal_linking,
            backlink_anchors=backlink_anchors,
            lsi_keywords=lsi_keywords,
            serp_optimization=serp_optimization,
            meta_preview=meta_preview,
            canonical_tags=canonical_tags,
            share_id=share_id
        )
        
        # Calculate freshness
        content_obj.freshness = calculate_content_freshness(content_obj.created_at)
        
        # Calculate keyword gap analysis
        content_obj.keyword_gap = keyword_service.analyze_keyword_gap(content, metadata.get('keywords', []))
        
        # Predict traffic potential
        content_obj.traffic_prediction = keyword_service.predict_traffic(
            metadata.get('keywords', []),
            quality_score.get('overall_quality', 50),
            content_optimization.get('readability_score', 50),
            content_optimization.get('word_count', 0),
            bool(serp_optimization.get('featured_snippet', {}).get('optimized'))
        )
        
        # Generate topic clusters
        content_obj.topic_clusters = keyword_service.generate_topic_clusters(
            metadata.get('keywords', []),
            content
        )
        
        # Calculate comprehensive SEO score
        content_obj.seo_score = seo_service.calculate_seo_score(content_obj.model_dump())
        
        doc = content_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.contents.insert_one(doc)
        
        queries = await generate_synthetic_queries(content_obj.id, title, content)
        for query in queries:
            query_obj = SyntheticQuery(
                content_id=content_obj.id,
                query=query,
                response=f"Based on our content: {content[:200]}...",
                relevance_score=85.0,
                query_type="standard"
            )
            query_doc = query_obj.model_dump()
            query_doc['created_at'] = query_doc['created_at'].isoformat()
            await db.queries.insert_one(query_doc)
        
        for voice_query in voice_queries:
            query_obj = SyntheticQuery(
                content_id=content_obj.id,
                query=voice_query,
                response=f"Voice search result: {content[:200]}...",
                relevance_score=90.0,
                query_type="voice"
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
    total_content = await db.contents.count_documents({})
    total_queries = await db.queries.count_documents({})
    
    pipeline = [
        {"$group": {"_id": None, "avg_score": {"$avg": "$performance_score"}}}
    ]
    avg_result = await db.contents.aggregate(pipeline).to_list(1)
    avg_score = avg_result[0]['avg_score'] if avg_result else 0
    
    readability_pipeline = [
        {"$match": {"content_optimization.readability_score": {"$exists": True}}},
        {"$group": {"_id": None, "avg_readability": {"$avg": "$content_optimization.readability_score"}}}
    ]
    readability_result = await db.contents.aggregate(readability_pipeline).to_list(1)
    avg_readability = readability_result[0]['avg_readability'] if readability_result else 0
    
    quality_pipeline = [
        {"$match": {"quality_score.overall_quality": {"$exists": True}}},
        {"$group": {"_id": None, "avg_quality": {"$avg": "$quality_score.overall_quality"}}}
    ]
    quality_result = await db.contents.aggregate(quality_pipeline).to_list(1)
    avg_quality = quality_result[0]['avg_quality'] if quality_result else 0
    
    top_content = await db.contents.find(
        {}, {"_id": 0, "id": 1, "title": 1, "performance_score": 1, "views": 1}
    ).sort("performance_score", -1).limit(5).to_list(5)
    
    recent_queries = await db.queries.find(
        {}, {"_id": 0, "query": 1, "relevance_score": 1, "query_type": 1, "created_at": 1}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return AnalyticsData(
        total_content=total_content,
        total_queries=total_queries,
        avg_performance_score=round(avg_score, 2),
        avg_readability_score=round(avg_readability, 2),
        avg_quality_score=round(avg_quality, 2),
        top_performing=top_content,
        recent_queries=recent_queries
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()