"""Advanced content optimization for maximum LLM visibility"""
import spacy
import re
from typing import List, Dict, Any, Tuple
from collections import Counter
from datetime import datetime, timezone
import logging

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    logging.warning("spaCy model not loaded")
    nlp = None

def extract_entities(content: str) -> Dict[str, List[str]]:
    """Extract named entities (people, organizations, locations, etc.)"""
    if not nlp:
        return {}
    
    try:
        doc = nlp(content[:5000])  # Limit for performance
        entities = {
            "people": [],
            "organizations": [],
            "locations": [],
            "dates": [],
            "products": [],
            "other": []
        }
        
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                entities["people"].append(ent.text)
            elif ent.label_ in ["ORG", "COMPANY"]:
                entities["organizations"].append(ent.text)
            elif ent.label_ in ["GPE", "LOC"]:
                entities["locations"].append(ent.text)
            elif ent.label_ == "DATE":
                entities["dates"].append(ent.text)
            elif ent.label_ == "PRODUCT":
                entities["products"].append(ent.text)
            else:
                entities["other"].append(ent.text)
        
        # Remove duplicates and limit
        for key in entities:
            entities[key] = list(set(entities[key]))[:10]
        
        return entities
    except Exception as e:
        logging.error(f"Error extracting entities: {str(e)}")
        return {}

def extract_citation_snippets(content: str, title: str) -> List[Dict[str, str]]:
    """Extract quotable, citation-worthy snippets from content"""
    snippets = []
    
    # Split into sentences
    sentences = re.split(r'[.!?]+', content)
    
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) < 50 or len(sentence) > 200:
            continue
        
        # Look for citation-worthy patterns
        citation_indicators = [
            r'\d+%',  # Statistics
            r'\d+\s+(percent|billion|million|thousand)',  # Numbers
            r'according to',
            r'research shows',
            r'studies indicate',
            r'experts say',
            r'data reveals',
            r'findings show',
            r'analysis indicates',
        ]
        
        for pattern in citation_indicators:
            if re.search(pattern, sentence, re.IGNORECASE):
                snippets.append({
                    "text": sentence,
                    "type": "statistic" if any(x in pattern for x in ['\\d', 'percent']) else "expert_quote",
                    "relevance": 0.9
                })
                break
    
    return snippets[:5]

def calculate_topic_authority(content: str, keywords: List[str]) -> Dict[str, Any]:
    """Calculate how authoritative content is on specific topics"""
    word_count = len(content.split())
    
    # Count keyword mentions
    keyword_mentions = {}
    content_lower = content.lower()
    for keyword in keywords:
        keyword_mentions[keyword] = content_lower.count(keyword.lower())
    
    # Calculate depth score
    depth_score = min(100, (word_count / 500) * 50)  # Longer = more depth
    
    # Calculate keyword coverage
    avg_mentions = sum(keyword_mentions.values()) / max(len(keywords), 1)
    coverage_score = min(100, avg_mentions * 20)
    
    # Overall authority score
    authority_score = (depth_score * 0.6) + (coverage_score * 0.4)
    
    return {
        "authority_score": round(authority_score, 2),
        "depth_score": round(depth_score, 2),
        "coverage_score": round(coverage_score, 2),
        "keyword_mentions": keyword_mentions,
        "word_count": word_count,
        "expertise_level": "Expert" if authority_score > 80 else "Intermediate" if authority_score > 60 else "Beginner"
    }

def generate_semantic_enrichment(content: str, keywords: List[str]) -> Dict[str, List[str]]:
    """Generate related concepts, synonyms, and semantic context"""
    if not nlp:
        return {"related_concepts": [], "semantic_keywords": []}
    
    try:
        doc = nlp(content[:3000])
        
        # Extract noun chunks as related concepts
        related_concepts = []
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) > 1 and len(chunk.text) > 5:
                related_concepts.append(chunk.text)
        
        # Get most common concepts
        concept_freq = Counter(related_concepts)
        top_concepts = [concept for concept, _ in concept_freq.most_common(10)]
        
        # Extract semantic keywords (nouns, proper nouns)
        semantic_keywords = []
        for token in doc:
            if token.pos_ in ['NOUN', 'PROPN'] and len(token.text) > 3:
                semantic_keywords.append(token.text)
        
        semantic_freq = Counter(semantic_keywords)
        top_semantic = [word for word, _ in semantic_freq.most_common(15)]
        
        return {
            "related_concepts": top_concepts,
            "semantic_keywords": top_semantic
        }
    except Exception as e:
        logging.error(f"Error in semantic enrichment: {str(e)}")
        return {"related_concepts": [], "semantic_keywords": []}

def analyze_search_intent(title: str, content: str) -> Dict[str, Any]:
    """Analyze what search intent the content satisfies"""
    title_lower = title.lower()
    content_lower = content[:500].lower()
    
    intents = {
        "informational": 0,
        "navigational": 0,
        "transactional": 0,
        "commercial": 0
    }
    
    # Informational indicators
    informational_words = ['what', 'why', 'how', 'guide', 'tutorial', 'learn', 'understand', 'explain', 'definition']
    for word in informational_words:
        if word in title_lower or word in content_lower:
            intents['informational'] += 10
    
    # Navigational indicators
    navigational_words = ['login', 'sign up', 'account', 'dashboard', 'portal', 'official']
    for word in navigational_words:
        if word in title_lower:
            intents['navigational'] += 15
    
    # Transactional indicators
    transactional_words = ['buy', 'purchase', 'order', 'download', 'subscribe', 'get', 'shop', 'deal']
    for word in transactional_words:
        if word in title_lower or word in content_lower:
            intents['transactional'] += 10
    
    # Commercial indicators
    commercial_words = ['best', 'top', 'review', 'comparison', 'vs', 'versus', 'alternative', 'pricing']
    for word in commercial_words:
        if word in title_lower:
            intents['commercial'] += 12
    
    # Normalize scores
    total = sum(intents.values())
    if total > 0:
        intents = {k: round((v / total) * 100, 2) for k, v in intents.items()}
    
    primary_intent = max(intents, key=intents.get)
    
    return {
        "intents": intents,
        "primary_intent": primary_intent,
        "confidence": intents[primary_intent]
    }

def generate_people_also_ask(title: str, content: str, keywords: List[str]) -> List[str]:
    """Generate 'People Also Ask' style questions"""
    questions = []
    
    # Question templates
    templates = [
        f"What is {keywords[0] if keywords else 'this topic'} used for?",
        f"How does {keywords[0] if keywords else 'this'} work?",
        f"Why is {keywords[0] if keywords else 'this'} important?",
        f"When should you use {keywords[0] if keywords else 'this'}?",
        f"Who benefits from {keywords[0] if keywords else 'this'}?",
        f"Where is {keywords[0] if keywords else 'this'} commonly used?",
        f"What are the benefits of {keywords[0] if keywords else 'this'}?",
        f"How can I get started with {keywords[0] if keywords else 'this'}?",
    ]
    
    return templates[:6]

def calculate_content_quality_score(content: str, entities: Dict, readability_score: float, keyword_count: int) -> Dict[str, Any]:
    """Calculate comprehensive content quality score (E-E-A-T)"""
    scores = {
        "experience": 0,
        "expertise": 0,
        "authoritativeness": 0,
        "trustworthiness": 0
    }
    
    word_count = len(content.split())
    
    # Experience score (based on detail and examples)
    if word_count > 500:
        scores['experience'] += 30
    if word_count > 1000:
        scores['experience'] += 20
    if 'example' in content.lower() or 'for instance' in content.lower():
        scores['experience'] += 25
    if any(word in content.lower() for word in ['our experience', 'we found', 'we tested']):
        scores['experience'] += 25
    
    # Expertise score (based on depth and entities)
    total_entities = sum(len(v) for v in entities.values())
    if total_entities > 5:
        scores['expertise'] += 30
    if keyword_count > 3:
        scores['expertise'] += 25
    if readability_score > 50:
        scores['expertise'] += 20
    else:
        scores['expertise'] += 10  # Too complex or too simple
    if word_count > 800:
        scores['expertise'] += 25
    
    # Authoritativeness score
    if entities.get('organizations'):
        scores['authoritativeness'] += 30
    if entities.get('people'):
        scores['authoritativeness'] += 20
    if any(word in content.lower() for word in ['research', 'study', 'data', 'according to']):
        scores['authoritativeness'] += 30
    if keyword_count > 5:
        scores['authoritativeness'] += 20
    
    # Trustworthiness score
    if entities.get('dates'):
        scores['trustworthiness'] += 25
    if any(word in content.lower() for word in ['source', 'reference', 'citation']):
        scores['trustworthiness'] += 25
    if readability_score >= 60 and readability_score <= 80:
        scores['trustworthiness'] += 25  # Good readability
    if word_count > 500:
        scores['trustworthiness'] += 25
    
    # Calculate overall quality score
    overall = sum(scores.values()) / 4
    
    return {
        "overall_quality": round(overall, 2),
        "experience_score": scores['experience'],
        "expertise_score": scores['expertise'],
        "authoritativeness_score": scores['authoritativeness'],
        "trustworthiness_score": scores['trustworthiness'],
        "grade": "Excellent" if overall >= 80 else "Good" if overall >= 60 else "Fair" if overall >= 40 else "Needs Improvement"
    }

def generate_answer_box_content(content: str, keywords: List[str]) -> Dict[str, Any]:
    """Generate content optimized for Google's featured snippets/answer boxes"""
    sentences = re.split(r'[.!?]+', content)
    
    # Find definition-style sentences
    definition = None
    for sentence in sentences[:5]:  # Check first 5 sentences
        sentence = sentence.strip()
        if len(sentence) > 30 and len(sentence) < 200:
            if any(word in sentence.lower() for word in ['is', 'are', 'means', 'refers to']):
                definition = sentence
                break
    
    # Extract list items
    list_items = re.findall(r'(?:^|\n)(?:\d+\.|[-•*])\s*(.+?)(?=\n|$)', content)
    
    # Extract steps (how-to)
    steps = []
    step_pattern = r'(?:step|Stage)\s*\d+:?\s*(.+?)(?=(?:step|stage)|$)'
    steps = re.findall(step_pattern, content, re.IGNORECASE)
    
    return {
        "definition": definition or (sentences[0].strip() if sentences else None),
        "list_items": list_items[:8],
        "steps": steps[:6],
        "quick_answer": definition or (content[:160] if content else None)
    }

def generate_internal_linking_suggestions(title: str, keywords: List[str]) -> List[Dict[str, str]]:
    """Generate internal linking suggestions based on keywords"""
    suggestions = []
    
    for keyword in keywords[:5]:
        suggestions.append({
            "anchor_text": keyword,
            "suggested_page": f"Related article about {keyword}",
            "context": f"Link to comprehensive guide on {keyword}"
        })
    
    # Add topic-based suggestions
    if keywords:
        main_topic = keywords[0]
        suggestions.append({
            "anchor_text": f"Learn more about {main_topic}",
            "suggested_page": f"{main_topic} hub page",
            "context": "Hub page linking"
        })
    
    return suggestions

def generate_backlink_anchor_texts(title: str, keywords: List[str]) -> List[Dict[str, str]]:
    """Generate natural backlink anchor text suggestions"""
    anchor_texts = []
    
    # Exact match
    if keywords:
        anchor_texts.append({
            "type": "exact_match",
            "text": keywords[0],
            "usage": "Use sparingly for main keyword"
        })
    
    # Partial match
    anchor_texts.append({
        "type": "partial_match",
        "text": title[:50],
        "usage": "Natural, descriptive anchor"
    })
    
    # Branded
    anchor_texts.append({
        "type": "branded",
        "text": "Read more on Traffic Wizard",
        "usage": "Brand mention anchor"
    })
    
    # Generic
    anchor_texts.append({
        "type": "generic",
        "text": "click here" if not keywords else f"learn about {keywords[0]}",
        "usage": "Natural flow anchor"
    })
    
    # Long-tail
    if len(keywords) > 1:
        anchor_texts.append({
            "type": "long_tail",
            "text": f"{keywords[0]} and {keywords[1]}",
            "usage": "Long-tail keyword anchor"
        })
    
    return anchor_texts

def calculate_content_freshness(created_at: datetime) -> Dict[str, Any]:
    """Calculate content freshness score"""
    now = datetime.now(timezone.utc)
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    
    days_old = (now - created_at).days
    
    if days_old < 7:
        freshness_score = 100
        status = "Very Fresh"
    elif days_old < 30:
        freshness_score = 90
        status = "Fresh"
    elif days_old < 90:
        freshness_score = 75
        status = "Recent"
    elif days_old < 180:
        freshness_score = 60
        status = "Moderate"
    elif days_old < 365:
        freshness_score = 40
        status = "Aging"
    else:
        freshness_score = 20
        status = "Outdated"
    
    return {
        "freshness_score": freshness_score,
        "status": status,
        "days_old": days_old,
        "needs_update": freshness_score < 60
    }
