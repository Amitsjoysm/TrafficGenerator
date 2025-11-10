"""Keyword analysis and traffic prediction service"""
import logging
from typing import Dict, List, Any, Optional
from groq import Groq
import json
import re
from collections import Counter
from config import config

logger = logging.getLogger(__name__)

class KeywordService:
    """Handle keyword analysis and traffic predictions"""
    
    def __init__(self, groq_client: Groq):
        self.groq_client = groq_client
    
    def analyze_keyword_gap(self, content: str, keywords: List[str], competitor_keywords: Optional[List[str]] = None) -> Dict[str, Any]:
        """Analyze keyword gaps - what's missing vs competitors"""
        try:
            # Extract actual keywords from content
            words = re.findall(r'\b[a-z]{3,}\b', content.lower())
            word_freq = Counter(words)
            content_keywords = [word for word, count in word_freq.most_common(20)]
            
            # If no competitor keywords provided, generate expected keywords
            if not competitor_keywords:
                competitor_keywords = self._generate_expected_keywords(content, keywords)
            
            # Find gaps
            missing_keywords = [kw for kw in competitor_keywords if kw.lower() not in content.lower()]
            covered_keywords = [kw for kw in competitor_keywords if kw.lower() in content.lower()]
            
            # Calculate coverage score
            coverage_score = (len(covered_keywords) / max(len(competitor_keywords), 1)) * 100
            
            return {
                "coverage_score": round(coverage_score, 2),
                "total_expected": len(competitor_keywords),
                "covered": len(covered_keywords),
                "missing": len(missing_keywords),
                "missing_keywords": missing_keywords[:10],
                "covered_keywords": covered_keywords,
                "recommendations": self._generate_gap_recommendations(missing_keywords)
            }
        except Exception as e:
            logger.error(f"Error analyzing keyword gap: {str(e)}")
            return {}
    
    def _generate_expected_keywords(self, content: str, primary_keywords: List[str]) -> List[str]:
        """Generate expected keywords for the topic"""
        try:
            prompt = f"""Based on this content topic, list 15 keywords that comprehensive content should include.

Primary Keywords: {', '.join(primary_keywords[:3])}
Content Preview: {content[:800]}

Provide keywords that:
1. Related concepts and terms
2. Industry terminology
3. Related questions users ask
4. Supporting topics

Respond with a JSON array:
["keyword1", "keyword2", ...]"""
            
            response = self.groq_client.chat.completions.create(
                model=config.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an SEO analyst. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=400
            )
            
            keywords = json.loads(response.choices[0].message.content)
            return keywords if isinstance(keywords, list) else []
        except Exception as e:
            logger.error(f"Error generating expected keywords: {str(e)}")
            return []
    
    def _generate_gap_recommendations(self, missing_keywords: List[str]) -> List[str]:
        """Generate recommendations for missing keywords"""
        recommendations = []
        
        if len(missing_keywords) > 10:
            recommendations.append("Content lacks comprehensive topic coverage - add sections for missing keywords")
        elif len(missing_keywords) > 5:
            recommendations.append("Expand content to cover more related topics and keywords")
        
        if missing_keywords:
            top_missing = missing_keywords[:3]
            recommendations.append(f"Priority keywords to add: {', '.join(top_missing)}")
        
        return recommendations
    
    def predict_traffic(self, keywords: List[str], quality_score: float, readability_score: float, 
                       content_length: int, has_featured_snippet: bool = False) -> Dict[str, Any]:
        """Predict potential organic traffic based on content metrics"""
        try:
            # Base traffic estimation
            base_traffic = 0
            
            # Keyword volume estimation (simplified)
            keyword_score = len(keywords) * 10
            
            # Quality multiplier
            quality_multiplier = quality_score / 100
            
            # Readability multiplier (optimal around 60-70)
            if 60 <= readability_score <= 80:
                readability_multiplier = 1.2
            elif 50 <= readability_score <= 90:
                readability_multiplier = 1.0
            else:
                readability_multiplier = 0.8
            
            # Content length multiplier
            if content_length >= config.OPTIMAL_WORD_COUNT:
                length_multiplier = 1.3
            elif content_length >= config.MIN_WORD_COUNT:
                length_multiplier = 1.0
            else:
                length_multiplier = 0.7
            
            # Featured snippet bonus
            snippet_bonus = 1.5 if has_featured_snippet else 1.0
            
            # Calculate estimated traffic
            base_traffic = keyword_score * 5  # Starting point
            
            monthly_traffic_low = int(base_traffic * quality_multiplier * readability_multiplier * length_multiplier * snippet_bonus * 0.5)
            monthly_traffic_mid = int(base_traffic * quality_multiplier * readability_multiplier * length_multiplier * snippet_bonus)
            monthly_traffic_high = int(base_traffic * quality_multiplier * readability_multiplier * length_multiplier * snippet_bonus * 1.8)
            
            # Determine traffic tier
            if monthly_traffic_mid > config.HIGH_VOLUME_THRESHOLD:
                tier = "High"
            elif monthly_traffic_mid > config.MEDIUM_VOLUME_THRESHOLD:
                tier = "Medium"
            else:
                tier = "Low"
            
            return {
                "estimated_monthly_traffic": {
                    "low": monthly_traffic_low,
                    "mid": monthly_traffic_mid,
                    "high": monthly_traffic_high
                },
                "traffic_tier": tier,
                "confidence": "Medium",
                "factors": {
                    "keyword_count": len(keywords),
                    "quality_score": quality_score,
                    "readability_score": readability_score,
                    "content_length": content_length,
                    "has_featured_snippet": has_featured_snippet
                },
                "multipliers": {
                    "quality": round(quality_multiplier, 2),
                    "readability": readability_multiplier,
                    "length": length_multiplier,
                    "snippet_bonus": snippet_bonus
                },
                "recommendations": self._generate_traffic_recommendations(
                    quality_score, readability_score, content_length, has_featured_snippet
                )
            }
        except Exception as e:
            logger.error(f"Error predicting traffic: {str(e)}")
            return {}
    
    def _generate_traffic_recommendations(self, quality_score: float, readability_score: float, 
                                         content_length: int, has_featured_snippet: bool) -> List[str]:
        """Generate recommendations to increase traffic potential"""
        recommendations = []
        
        if quality_score < 70:
            recommendations.append("Improve content quality with more research, examples, and expert insights")
        
        if readability_score < 60 or readability_score > 80:
            recommendations.append("Adjust readability to 60-80 range for optimal engagement")
        
        if content_length < config.OPTIMAL_WORD_COUNT:
            recommendations.append(f"Expand content to {config.OPTIMAL_WORD_COUNT}+ words for better rankings")
        
        if not has_featured_snippet:
            recommendations.append("Add clear definitions and structured lists to target featured snippets")
        
        recommendations.append("Build quality backlinks to increase domain authority")
        recommendations.append("Promote on social media to generate initial traffic signals")
        
        return recommendations
    
    def generate_topic_clusters(self, keywords: List[str], content: str) -> Dict[str, Any]:
        """Generate topic cluster suggestions for pillar content strategy"""
        try:
            prompt = f"""Analyze these keywords and content, then suggest a topic cluster strategy.

Keywords: {', '.join(keywords[:10])}
Content: {content[:1000]}

Provide:
1. A main pillar topic
2. 5-7 cluster topics (subtopics to create separate content for)
3. How they should link together

Respond in JSON format:
{{
  "pillar_topic": "Main comprehensive topic",
  "pillar_keywords": ["keyword1", "keyword2"],
  "cluster_topics": [
    {{
      "topic": "Subtopic 1",
      "keywords": ["kw1", "kw2"],
      "relationship": "How it relates to pillar"
    }}
  ]
}}"""
            
            response = self.groq_client.chat.completions.create(
                model=config.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are a content strategist. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            clusters = json.loads(response.choices[0].message.content)
            return clusters
        except Exception as e:
            logger.error(f"Error generating topic clusters: {str(e)}")
            return {}
