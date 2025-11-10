"""Centralized configuration management"""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Config:
    """Application configuration"""
    
    # MongoDB
    MONGO_URL = os.environ.get('MONGO_URL')
    DB_NAME = os.environ.get('DB_NAME', 'traffic_wizard')
    
    # Groq API
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    GROQ_MODEL = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # Application
    APP_NAME = "Traffic Wizard"
    APP_VERSION = "2.0.0"
    API_PREFIX = "/api"
    
    # Content Limits
    MAX_CONTENT_LENGTH = 10000
    MAX_CRAWL_TIMEOUT = 30
    
    # Traffic Prediction Defaults
    DEFAULT_TRAFFIC_MULTIPLIER = 0.85
    HIGH_VOLUME_THRESHOLD = 1000
    MEDIUM_VOLUME_THRESHOLD = 500
    
    # SEO Defaults
    DEFAULT_READABILITY_TARGET = 60
    MIN_WORD_COUNT = 300
    OPTIMAL_WORD_COUNT = 1500
    
    # Freshness Thresholds (days)
    FRESHNESS_VERY_FRESH = 7
    FRESHNESS_FRESH = 30
    FRESHNESS_RECENT = 90
    FRESHNESS_MODERATE = 180
    FRESHNESS_AGING = 365
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        required = ['MONGO_URL', 'DB_NAME', 'GROQ_API_KEY']
        missing = [key for key in required if not getattr(cls, key)]
        if missing:
            raise ValueError(f"Missing required config: {', '.join(missing)}")

config = Config()
