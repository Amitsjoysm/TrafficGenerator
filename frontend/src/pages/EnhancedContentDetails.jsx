import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Copy, Download, Share2, RefreshCw, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

// Import new production components
import MetaPreview from '../components/MetaPreview';
import TrafficInsights from '../components/TrafficInsights';
import ExportModal from '../components/ExportModal';
import SEOScoreCard from '../components/SEOScoreCard';
import TopicClusters from '../components/TopicClusters';
import ContentFreshness from '../components/ContentFreshness';

// Import existing advanced components (reuse from original)
import { Badge } from '../components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const EnhancedContentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [contentRes, queriesRes] = await Promise.all([
        axios.get(`${API}/content/${id}`),
        axios.get(`${API}/queries/${id}`)
      ]);
      setContent(contentRes.data);
      setQueries(queriesRes.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshContent = async (contentId) => {
    try {
      setRefreshing(true);
      await axios.post(`${API}/content/${contentId}/refresh`);
      toast.success('Content refreshed successfully!');
      await fetchContent();
    } catch (error) {
      console.error('Error refreshing content:', error);
      toast.error('Failed to refresh content');
    } finally {
      setRefreshing(false);
    }
  };

  const copyToClipboard = (text, label = 'Content') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const copyShareLink = () => {
    if (content.share_id) {
      const shareUrl = `${window.location.origin}/share/${content.share_id}`;
      copyToClipboard(shareUrl, 'Share link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Content not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 fade-in">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>
        </div>

        {/* Title & Quick Actions */}
        <div className="glass-card p-6 mb-6 fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {content.optimized_title || content.title}
              </h1>
              <p className="text-gray-600">{content.optimized_description}</p>
              {content.url && (
                <a 
                  href={content.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
                >
                  <ExternalLink size={14} />
                  {content.url}
                </a>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setExportModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </Button>
              <Button
                onClick={copyShareLink}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 size={16} />
                Share
              </Button>
              <Button
                onClick={() => handleRefreshContent(content.id)}
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {content.performance_score}%
              </div>
              <div className="text-xs text-gray-600">SEO Score</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {content.quality_score?.overall_quality?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-gray-600">Quality</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {content.content_optimization?.readability_score?.toFixed(0) || 0}
              </div>
              <div className="text-xs text-gray-600">Readability</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {content.keywords?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Keywords</div>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">
                {queries.length}
              </div>
              <div className="text-xs text-gray-600">Queries</div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="fade-in">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* SEO Score */}
              {content.seo_score && (
                <SEOScoreCard seoScore={content.seo_score} />
              )}

              {/* Content Freshness */}
              {content.freshness && (
                <ContentFreshness 
                  freshness={content.freshness}
                  contentId={content.id}
                  onRefresh={handleRefreshContent}
                />
              )}
            </div>

            {/* Meta Preview */}
            {content.meta_preview && (
              <MetaPreview 
                metaPreview={content.meta_preview}
                title={content.optimized_title}
                description={content.optimized_description}
                url={content.url}
              />
            )}

            {/* Keywords */}
            {content.keywords && content.keywords.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Primary Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {content.keywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* LSI Keywords */}
            {content.lsi_keywords && content.lsi_keywords.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">LSI Keywords (Semantic)</h3>
                <div className="flex flex-wrap gap-2">
                  {content.lsi_keywords.map((kw, idx) => (
                    <Badge key={idx} variant="outline" className="px-3 py-1">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Traffic Tab */}
          <TabsContent value="traffic" className="space-y-6">
            <TrafficInsights 
              trafficPrediction={content.traffic_prediction}
              keywordGap={content.keyword_gap}
              serp={content.serp_optimization}
              freshness={content.freshness}
            />

            {/* Topic Clusters */}
            {content.topic_clusters && (
              <TopicClusters topicClusters={content.topic_clusters} />
            )}
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            {/* FAQs */}
            {content.faqs && content.faqs.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">FAQs (People Also Ask)</h3>
                <Accordion type="single" collapsible className="w-full">
                  {content.faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Structured Data */}
            {content.structured_data && (
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Schema.org Structured Data</h3>
                  <Button
                    onClick={() => copyToClipboard(JSON.stringify(content.structured_data, null, 2), 'Structured data')}
                    variant="outline"
                    size="sm"
                  >
                    <Copy size={14} className="mr-2" />
                    Copy JSON-LD
                  </Button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(content.structured_data, null, 2)}
                </pre>
              </div>
            )}

            {/* Canonical Tags */}
            {content.canonical_tags && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Canonical URL Tags</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Canonical URL:</div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm flex justify-between items-center">
                      <code>{content.canonical_tags.canonical_url}</code>
                      <Button
                        onClick={() => copyToClipboard(content.canonical_tags.canonical_url, 'Canonical URL')}
                        variant="ghost"
                        size="sm"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">HTML Tag:</div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm flex justify-between items-center">
                      <code className="text-xs">{content.canonical_tags.html_tag}</code>
                      <Button
                        onClick={() => copyToClipboard(content.canonical_tags.html_tag, 'HTML tag')}
                        variant="ghost"
                        size="sm"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            {/* Original Content */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Content Preview</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {content.content.substring(0, 1000)}
                  {content.content.length > 1000 && '...'}
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <strong>Word Count:</strong> {content.content_optimization?.word_count || 0} words
              </div>
            </div>

            {/* Social Media Posts */}
            {content.social_posts && content.social_posts.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Social Media Posts</h3>
                <div className="space-y-4">
                  {content.social_posts.map((post, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">{post.platform}</span>
                        <Button
                          onClick={() => copyToClipboard(post.post_text, `${post.platform} post`)}
                          variant="ghost"
                          size="sm"
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{post.post_text}</p>
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags?.map((tag, tidx) => (
                          <span key={tidx} className="text-xs text-blue-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Queries */}
            {content.voice_queries && content.voice_queries.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Voice Search Queries</h3>
                <ul className="space-y-2">
                  {content.voice_queries.map((query, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600">🎤</span>
                      {query}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            {/* Entity Extraction */}
            {content.entities && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Named Entities</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(content.entities).map(([type, items]) => (
                    items && items.length > 0 && (
                      <div key={type}>
                        <div className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                          {type}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {items.map((item, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Topic Authority */}
            {content.topic_authority && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Topic Authority Analysis</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {content.topic_authority.authority_score?.toFixed(0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Authority Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {content.topic_authority.depth_score?.toFixed(0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Depth Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {content.topic_authority.coverage_score?.toFixed(0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Coverage Score</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {content.topic_authority.expertise_level}
                  </Badge>
                </div>
              </div>
            )}

            {/* Search Intent */}
            {content.search_intent && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Search Intent Analysis</h3>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Primary Intent:</div>
                  <div className="text-2xl font-bold capitalize">
                    {content.search_intent.primary_intent}
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(content.search_intent.intents || {}).map(([intent, score]) => (
                    <div key={intent}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{intent}</span>
                        <span className="font-semibold">{score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        contentId={content.id}
      />
    </div>
  );
};

export default EnhancedContentDetails;
