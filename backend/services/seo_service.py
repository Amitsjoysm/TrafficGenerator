"""SEO optimization service"""
import re
from typing import Dict, List, Any, Optional
import logging
from groq import Groq
import json
from config import config

logger = logging.getLogger(__name__)

class SEOService:
    """Handle all SEO-related operations"""
    
    def __init__(self, groq_client: Groq):
        self.groq_client = groq_client
    
    def generate_meta_preview(self, title: str, description: str, url: Optional[str] = None) -> Dict[str, Any]:
        """Generate preview data for how content appears in search results"""
        return {
            "google": {
                "title": title[:60] + "..." if len(title) > 60 else title,
                "description": description[:160] + "..." if len(description) > 160 else description,
                "url_display": url or "example.com",
                "preview_text": description[:160]
            },
            "social": {
                "og_title": title[:95] + "..." if len(title) > 95 else title,
                "og_description": description[:200] + "..." if len(description) > 200 else description,
                "twitter_title": title[:70] + "..." if len(title) > 70 else title,
                "twitter_description": description[:200] + "..." if len(description) > 200 else description
            },
            "character_counts": {
                "title_length": len(title),
                "title_optimal": 50 <= len(title) <= 60,
                "description_length": len(description),
                "description_optimal": 150 <= len(description) <= 160
            }
        }
    
    def generate_lsi_keywords(self, content: str, primary_keywords: List[str]) -> List[str]:
        """Generate Latent Semantic Indexing keywords for better context"""
        try:
            prompt = f"""Analyze this content and generate 10 LSI (Latent Semantic Indexing) keywords.
These should be semantically related terms that provide context, NOT just synonyms.

Primary Keywords: {', '.join(primary_keywords[:5])}
Content: {content[:1500]}

Provide keywords that:
1. Are semantically related to the topic
2. Help search engines understand context
3. Are natural variations users might search
4. Include related concepts and entities

Respond with a JSON array of strings:
["keyword1", "keyword2", ...]"""
            
            response = self.groq_client.chat.completions.create(
                model=config.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an SEO expert specializing in semantic search. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            lsi_keywords = json.loads(response.choices[0].message.content)
            return lsi_keywords if isinstance(lsi_keywords, list) else []
        except Exception as e:
            logger.error(f"Error generating LSI keywords: {str(e)}")
            return []
    
    def generate_serp_optimization(self, title: str, content: str, keywords: List[str]) -> Dict[str, Any]:
        """Generate optimization specifically for SERP features (featured snippets, PAA, etc.)"""
        try:
            # Extract definition (for featured snippets)
            sentences = re.split(r'[.!?]+', content)
            definition = None
            for sentence in sentences[:5]:
                sentence = sentence.strip()
                if len(sentence) > 30 and len(sentence) < 200:
                    if any(word in sentence.lower() for word in ['is', 'are', 'means', 'refers to', 'defined as']):
                        definition = sentence
                        break
            
            # Extract numbered lists (for list snippets)
            list_items = re.findall(r'(?:^|\n)(?:\d+\.|[-•*])\s*(.+?)(?=\n|$)', content, re.MULTILINE)
            
            # Extract table data patterns
            table_candidates = re.findall(r'(?:^|\n)([^\n]+):\s*([^\n]+)', content, re.MULTILINE)
            
            return {
                "featured_snippet": {
                    "definition": definition or (sentences[0].strip() if sentences else None),
                    "optimized": bool(definition),
                    "word_count": len(definition.split()) if definition else 0,
                    "optimal_range": "40-60 words"
                },
                "list_snippet": {
                    "items": list_items[:10],
                    "count": len(list_items),
                    "optimized": len(list_items) >= 3,
                    "recommendation": "Add numbered or bulleted lists for better snippet chances"
                },
                "table_snippet": {
                    "candidates": table_candidates[:5],
                    "has_structured_data": len(table_candidates) > 0,
                    "recommendation": "Structure comparison data in tables for table snippets"
                },
                "paragraph_snippet": {
                    "first_paragraph": sentences[0].strip() if sentences else None,
                    "length_optimized": 40 <= len(sentences[0].split()) <= 60 if sentences else False
                }
            }
        except Exception as e:
            logger.error(f"Error generating SERP optimization: {str(e)}")
            return {}
    
    def generate_canonical_tags(self, url: Optional[str], content_id: str) -> Dict[str, str]:
        """Generate canonical URL tags to prevent duplicate content"""
        canonical_url = url or f"https://yoursite.com/content/{content_id}"
        return {
            "canonical_url": canonical_url,
            "html_tag": f'<link rel="canonical" href="{canonical_url}" />',
            "http_header": f"Link: <{canonical_url}>; rel=\"canonical\""
        }
    
    def generate_robots_meta(self, index: bool = True, follow: bool = True) -> Dict[str, str]:
        """Generate robots meta tags"""
        index_val = "index" if index else "noindex"
        follow_val = "follow" if follow else "nofollow"
        
        return {
            "meta_tag": f'<meta name="robots" content="{index_val}, {follow_val}" />',
            "x_robots_tag": f"X-Robots-Tag: {index_val}, {follow_val}",
            "index": index,
            "follow": follow
        }
    
    def calculate_seo_score(self, content_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comprehensive SEO score"""
        scores = {
            "title": 0,
            "description": 0,
            "keywords": 0,
            "content_quality": 0,
            "technical": 0
        }
        
        # Title score (max 20)
        title_len = len(content_data.get('optimized_title', content_data.get('title', '')))
        if 50 <= title_len <= 60:
            scores['title'] = 20
        elif 40 <= title_len <= 70:
            scores['title'] = 15
        else:
            scores['title'] = 10
        
        # Description score (max 20)
        desc_len = len(content_data.get('optimized_description', ''))
        if 150 <= desc_len <= 160:
            scores['description'] = 20
        elif 130 <= desc_len <= 170:
            scores['description'] = 15
        else:
            scores['description'] = 10
        
        # Keywords score (max 20)
        keyword_count = len(content_data.get('keywords', []))
        if keyword_count >= 5:
            scores['keywords'] = 20
        elif keyword_count >= 3:
            scores['keywords'] = 15
        else:
            scores['keywords'] = 10
        
        # Content quality score (max 20)
        if content_data.get('quality_score'):
            quality = content_data['quality_score'].get('overall_quality', 50)
            scores['content_quality'] = min(20, int(quality / 5))
        else:
            scores['content_quality'] = 10
        
        # Technical score (max 20)
        technical_points = 0
        if content_data.get('structured_data'):
            technical_points += 5
        if content_data.get('open_graph_tags'):
            technical_points += 5
        if content_data.get('faqs'):
            technical_points += 5
        if content_data.get('entities'):
            technical_points += 5
        scores['technical'] = technical_points
        
        overall = sum(scores.values())
        
        return {
            "overall_score": overall,
            "breakdown": scores,
            "grade": self._get_grade(overall),
            "recommendations": self._get_recommendations(scores)
        }
    
    def _get_grade(self, score: int) -> str:
        """Get letter grade from score"""
        if score >= 90:
            return "A+"
        elif score >= 85:
            return "A"
        elif score >= 80:
            return "B+"
        elif score >= 75:
            return "B"
        elif score >= 70:
            return "C+"
        elif score >= 65:
            return "C"
        else:
            return "D"
    
    def _get_recommendations(self, scores: Dict[str, int]) -> List[str]:
        """Generate recommendations based on scores"""
        recommendations = []
        
        if scores['title'] < 15:
            recommendations.append("Optimize title length (50-60 characters)")
        if scores['description'] < 15:
            recommendations.append("Improve meta description (150-160 characters)")
        if scores['keywords'] < 15:
            recommendations.append("Add more relevant keywords (5+ recommended)")
        if scores['content_quality'] < 15:
            recommendations.append("Enhance content quality with more depth and examples")
        if scores['technical'] < 15:
            recommendations.append("Add structured data, Open Graph tags, and FAQs")
        
        return recommendations
