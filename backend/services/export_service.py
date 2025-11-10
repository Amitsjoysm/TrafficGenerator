"""Export service for various output formats"""
import csv
import json
import io
from typing import Dict, Any, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ExportService:
    """Handle content export in various formats"""
    
    @staticmethod
    def export_to_json(content_data: Dict[str, Any]) -> str:
        """Export content data to JSON format"""
        try:
            # Clean data for export
            export_data = ExportService._prepare_export_data(content_data)
            return json.dumps(export_data, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error exporting to JSON: {str(e)}")
            return json.dumps({"error": str(e)})
    
    @staticmethod
    def export_to_csv(content_data: Dict[str, Any]) -> str:
        """Export content data to CSV format"""
        try:
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write headers
            writer.writerow(['Field', 'Value'])
            
            # Flatten data
            flat_data = ExportService._flatten_dict(content_data)
            
            # Write rows
            for key, value in flat_data.items():
                writer.writerow([key, value])
            
            return output.getvalue()
        except Exception as e:
            logger.error(f"Error exporting to CSV: {str(e)}")
            return f"Error: {str(e)}"
    
    @staticmethod
    def export_to_html(content_data: Dict[str, Any]) -> str:
        """Export content data to HTML format with meta tags"""
        try:
            html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>{content_data.get('optimized_title', content_data.get('title', ''))}</title>
    <meta name="title" content="{content_data.get('optimized_title', '')}">
    <meta name="description" content="{content_data.get('optimized_description', '')}">
    <meta name="keywords" content="{', '.join(content_data.get('keywords', []))}">
    <meta name="author" content="Traffic Wizard">
    
    <!-- Robots Meta Tags -->
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{content_data.get('url', '')}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="{content_data.get('url', '')}">
    <meta property="og:title" content="{content_data.get('optimized_title', '')}">
    <meta property="og:description" content="{content_data.get('optimized_description', '')}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{content_data.get('url', '')}">
    <meta property="twitter:title" content="{content_data.get('optimized_title', '')}">
    <meta property="twitter:description" content="{content_data.get('optimized_description', '')}">
    
    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">
    {json.dumps(content_data.get('structured_data', {}), indent=2)}
    </script>
    
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }}
        h1 {{ color: #2563eb; }}
        .meta-info {{
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .keyword {{
            display: inline-block;
            background: #dbeafe;
            padding: 4px 12px;
            border-radius: 16px;
            margin: 4px;
            font-size: 14px;
        }}
        .faq {{
            margin: 20px 0;
            padding: 15px;
            border-left: 4px solid #2563eb;
            background: #f9fafb;
        }}
        .faq-question {{
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }}
        .faq-answer {{
            color: #4b5563;
        }}
    </style>
</head>
<body>
    <article>
        <h1>{content_data.get('optimized_title', content_data.get('title', ''))}</h1>
        
        <div class="meta-info">
            <p><strong>URL:</strong> {content_data.get('url', 'N/A')}</p>
            <p><strong>Performance Score:</strong> {content_data.get('performance_score', 0)}%</p>
            <p><strong>Quality Score:</strong> {content_data.get('quality_score', {}).get('overall_quality', 'N/A')}</p>
        </div>
        
        <div>
            <h2>Keywords</h2>
            <div>
                {''.join([f'<span class="keyword">{kw}</span>' for kw in content_data.get('keywords', [])])}
            </div>
        </div>
        
        <div>
            <h2>Content</h2>
            <p>{content_data.get('content', '')}</p>
        </div>
        
        {''.join([f'''<div class="faq">
            <div class="faq-question">{faq.get('question', '')}</div>
            <div class="faq-answer">{faq.get('answer', '')}</div>
        </div>''' for faq in content_data.get('faqs', [])])}
        
    </article>
</body>
</html>"""
            return html
        except Exception as e:
            logger.error(f"Error exporting to HTML: {str(e)}")
            return f"<html><body>Error: {str(e)}</body></html>"
    
    @staticmethod
    def export_sitemap_xml(contents: List[Dict[str, Any]], base_url: str = "https://yoursite.com") -> str:
        """Generate XML sitemap for all content"""
        try:
            xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            
            for content in contents:
                content_id = content.get('id', '')
                url = content.get('url') or f"{base_url}/content/{content_id}"
                modified = content.get('updated_at', content.get('created_at', datetime.now()))
                
                if isinstance(modified, str):
                    modified_str = modified
                else:
                    modified_str = modified.isoformat()
                
                # Priority based on performance score
                score = content.get('performance_score', 50)
                priority = min(1.0, max(0.3, score / 100))
                
                xml += f'  <url>\n'
                xml += f'    <loc>{url}</loc>\n'
                xml += f'    <lastmod>{modified_str}</lastmod>\n'
                xml += f'    <changefreq>weekly</changefreq>\n'
                xml += f'    <priority>{priority:.1f}</priority>\n'
                xml += f'  </url>\n'
            
            xml += '</urlset>'
            return xml
        except Exception as e:
            logger.error(f"Error generating sitemap: {str(e)}")
            return f'<?xml version="1.0" encoding="UTF-8"?><error>{str(e)}</error>'
    
    @staticmethod
    def generate_robots_txt(allow_all: bool = True, sitemap_url: str = None) -> str:
        """Generate robots.txt file"""
        robots = "# Traffic Wizard - Robots.txt\n\n"
        robots += "User-agent: *\n"
        
        if allow_all:
            robots += "Allow: /\n"
        else:
            robots += "Disallow: /api/\n"
            robots += "Disallow: /private/\n"
            robots += "Allow: /content/\n"
        
        robots += "\n# Crawl delay (optional)\n"
        robots += "Crawl-delay: 10\n"
        
        if sitemap_url:
            robots += f"\n# Sitemap\n"
            robots += f"Sitemap: {sitemap_url}\n"
        
        return robots
    
    @staticmethod
    def _prepare_export_data(content_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare data for export by removing internal fields"""
        export_data = content_data.copy()
        
        # Remove internal MongoDB fields
        export_data.pop('_id', None)
        
        # Convert datetime objects to strings
        for key in ['created_at', 'updated_at']:
            if key in export_data and not isinstance(export_data[key], str):
                export_data[key] = export_data[key].isoformat()
        
        return export_data
    
    @staticmethod
    def _flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
        """Flatten nested dictionary for CSV export"""
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            
            if isinstance(v, dict):
                items.extend(ExportService._flatten_dict(v, new_key, sep=sep).items())
            elif isinstance(v, list):
                items.append((new_key, ', '.join(map(str, v))))
            else:
                items.append((new_key, v))
        
        return dict(items)
