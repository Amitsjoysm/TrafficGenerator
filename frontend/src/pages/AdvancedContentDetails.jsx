import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Copy, CheckCircle, ExternalLink, FileCode, MessageSquare, Zap, 
  Share2, Mic, HelpCircle, BarChart3, TrendingUp, Target, Link2, Award,
  Brain, Search, Quote, Clock, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";

const AdvancedContentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try:
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

  const copyToClipboard = (text, label = 'text') => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
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

  const standardQueries = queries.filter(q => q.query_type === 'standard');
  const voiceQueries = queries.filter(q => q.query_type === 'voice');

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>
        </div>

        {/* Content Header with Advanced Metrics */}
        <div className="glass-card p-8 mb-6 fade-in">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {content.optimized_title || content.title}
              </h1>
              <p className="text-base text-gray-600 mb-4">
                {content.optimized_description}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-sm">
                SEO: {content.performance_score}%
              </Badge>
              {content.quality_score && (
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 text-sm">
                  Quality: {content.quality_score.overall_quality}%
                </Badge>
              )}
            </div>
          </div>

          {/* Keywords */}
          <div className="flex flex-wrap gap-2 mb-4">
            {content.keywords && content.keywords.map((keyword, idx) => (
              <span key={idx} className="keyword-badge">
                {keyword}
              </span>
            ))}
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {content.topic_authority && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Authority</p>
                <p className="text-xl font-bold text-blue-600">{content.topic_authority.authority_score}%</p>
              </div>
            )}
            {content.search_intent && (
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Intent</p>
                <p className="text-sm font-bold text-purple-600">{content.search_intent.primary_intent}</p>
              </div>
            )}
            {content.freshness && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Freshness</p>
                <p className="text-sm font-bold text-green-600">{content.freshness.status}</p>
              </div>
            )}
            {content.entities && (
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Entities</p>
                <p className="text-xl font-bold text-yellow-600">
                  {Object.values(content.entities).flat().length}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="advanced" className="fade-in">
          <TabsList className="glass-card p-2 mb-6 flex-wrap gap-2">
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Brain size={18} />
              LLM Optimization
            </TabsTrigger>
            <TabsTrigger value="entities" className="flex items-center gap-2">
              <Target size={18} />
              Entities & Citations
            </TabsTrigger>
            <TabsTrigger value="linking" className="flex items-center gap-2">
              <Link2 size={18} />
              Linking Strategy
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 size={18} />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic size={18} />
              Voice ({voiceQueries.length})
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-2">
              <Award size={18} />
              Quality Score
            </TabsTrigger>
          </TabsList>

          {/* LLM Optimization Tab */}
          <TabsContent value="advanced">
            <div className="space-y-6">
              {/* Topic Authority */}
              {content.topic_authority && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target size={24} className="text-purple-600" />
                    Topic Authority Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Authority Score</p>
                      <Progress value={content.topic_authority.authority_score} className="h-2 mb-1" />
                      <p className="text-2xl font-bold text-purple-600">
                        {content.topic_authority.authority_score}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Content Depth</p>
                      <Progress value={content.topic_authority.depth_score} className="h-2 mb-1" />
                      <p className="text-2xl font-bold text-blue-600">
                        {content.topic_authority.depth_score}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Keyword Coverage</p>
                      <Progress value={content.topic_authority.coverage_score} className="h-2 mb-1" />
                      <p className="text-2xl font-bold text-green-600">
                        {content.topic_authority.coverage_score}%
                      </p>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Expertise Level:</strong> {content.topic_authority.expertise_level}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      {content.topic_authority.word_count} words | Strong topical authority signals detected
                    </p>
                  </div>
                </div>
              )}

              {/* Search Intent */}
              {content.search_intent && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Search size={24} className="text-blue-600" />
                    Search Intent Matching
                  </h2>
                  <div className="space-y-3">
                    {Object.entries(content.search_intent.intents).map(([intent, score]) => (
                      <div key={intent}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{intent}</span>
                          <span className="text-sm text-gray-600">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Primary Intent:</strong> {content.search_intent.primary_intent}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Confidence: {content.search_intent.confidence}%
                    </p>
                  </div>
                </div>
              )}

              {/* Answer Box Content */}
              {content.answer_box_content && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle size={24} className="text-green-600" />
                    Featured Snippet Optimization
                  </h2>
                  {content.answer_box_content.definition && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Quick Answer:</h3>
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <p className="text-gray-800">{content.answer_box_content.definition}</p>
                      </div>
                    </div>
                  )}
                  {content.answer_box_content.list_items && content.answer_box_content.list_items.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">List Items (for snippet):</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {content.answer_box_content.list_items.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Semantic Enrichment */}
              {content.semantic_enrichment && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Brain size={24} className="text-indigo-600" />
                    Semantic Context & Related Concepts
                  </h2>
                  {content.semantic_enrichment.related_concepts && content.semantic_enrichment.related_concepts.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2 text-sm">Related Concepts:</h3>
                      <div className="flex flex-wrap gap-2">
                        {content.semantic_enrichment.related_concepts.map((concept, idx) => (
                          <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {content.semantic_enrichment.semantic_keywords && content.semantic_enrichment.semantic_keywords.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-sm">Semantic Keywords:</h3>
                      <div className="flex flex-wrap gap-2">
                        {content.semantic_enrichment.semantic_keywords.map((keyword, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* People Also Ask */}
              {content.people_also_ask && content.people_also_ask.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <HelpCircle size={24} className="text-orange-600" />
                    People Also Ask
                  </h2>
                  <div className="space-y-2">
                    {content.people_also_ask.map((question, idx) => (
                      <div key={idx} className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500">
                        <p className="text-sm font-medium text-gray-800">{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Entities & Citations Tab */}
          <TabsContent value="entities">
            <div className="space-y-6">
              {/* Entities */}
              {content.entities && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target size={24} className="text-purple-600" />
                    Named Entity Recognition
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(content.entities).map(([type, items]) => (
                      items.length > 0 && (
                        <div key={type} className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold mb-2 text-sm capitalize">{type}:</h3>
                          <div className="flex flex-wrap gap-2">
                            {items.map((item, idx) => (
                              <Badge key={idx} variant="outline">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Citation Snippets */}
              {content.citation_snippets && content.citation_snippets.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Quote size={24} className="text-blue-600" />
                    Citation-Worthy Snippets
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    These snippets are optimized for LLMs to cite and reference
                  </p>
                  <div className="space-y-3">
                    {content.citation_snippets.map((snippet, idx) => (
                      <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-blue-600">{snippet.type}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(snippet.text, 'Citation snippet')}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-800">\"{snippet.text}\"</p>
                        <p className="text-xs text-gray-500 mt-2">Relevance: {snippet.relevance * 100}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Linking Strategy Tab */}
          <TabsContent value="linking">
            <div className="space-y-6">
              {/* Internal Linking */}
              {content.internal_linking && content.internal_linking.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Link2 size={24} className="text-green-600" />
                    Internal Linking Suggestions
                  </h2>
                  <div className="space-y-3">
                    {content.internal_linking.map((link, idx) => (
                      <div key={idx} className="bg-green-50 p-4 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Anchor Text: \"{link.anchor_text}\"</p>
                        <p className="text-xs text-gray-600 mb-1">→ {link.suggested_page}</p>
                        <p className="text-xs text-gray-500">{link.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Backlink Anchor Texts */}
              {content.backlink_anchors && content.backlink_anchors.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ExternalLink size={24} className="text-blue-600" />
                    Backlink Anchor Text Suggestions
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Natural anchor text variations for link building campaigns
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {content.backlink_anchors.map((anchor, idx) => (
                      <div key={idx} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                        <Badge className="mb-2">{anchor.type}</Badge>
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
                          {anchor.text}
                        </p>
                        <p className="text-xs text-gray-600">{anchor.usage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Social Media Tab (keeping existing) */}
          <TabsContent value="social">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Share2 size={24} className="text-purple-600" />
                Social Media Amplification
              </h2>
              {content.social_posts && content.social_posts.length > 0 ? (
                <div className="space-y-4">
                  {content.social_posts.map((post, idx) => (
                    <div key={idx} className="content-card">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-purple-600">{post.platform}</h3>
                        <Button
                          onClick={() => copyToClipboard(post.post_text + ' ' + post.hashtags.map(h => '#' + h).join(' '), post.platform + ' post')}
                          variant="outline"
                          size="sm"
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                      <p className="text-gray-700 mb-3">{post.post_text}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.hashtags.map((tag, tagIdx) => (
                          <span key={tagIdx} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No social posts generated</p>
              )}
            </div>
          </TabsContent>

          {/* Voice Search Tab (keeping existing) */}
          <TabsContent value="voice">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mic size={24} className="text-purple-600" />
                Voice Search Optimization
              </h2>
              {voiceQueries.length > 0 ? (
                <div className="space-y-3">
                  {voiceQueries.map((query, idx) => (
                    <div key={query.id} className="content-card">
                      <div className="flex items-start gap-3">
                        <Mic className="text-purple-500 mt-1" size={20} />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{query.query}</p>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mt-2 inline-block">
                            Relevance: {query.relevance_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No voice queries generated</p>
              )}
            </div>
          </TabsContent>

          {/* Quality Score Tab */}
          <TabsContent value="quality">
            <div className="space-y-6">
              {content.quality_score && (
                <>
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Award size={24} className="text-yellow-600" />
                      E-E-A-T Quality Score
                    </h2>
                    <div className="text-center mb-6">
                      <p className="text-5xl font-bold text-yellow-600 mb-2">
                        {content.quality_score.overall_quality}%
                      </p>
                      <p className="text-lg text-gray-600">{content.quality_score.grade}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Experience</p>
                        <Progress value={content.quality_score.experience_score} className="h-2 mb-2" />
                        <p className="text-xl font-bold text-blue-600">{content.quality_score.experience_score}%</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Expertise</p>
                        <Progress value={content.quality_score.expertise_score} className="h-2 mb-2" />
                        <p className="text-xl font-bold text-green-600">{content.quality_score.expertise_score}%</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Authoritativeness</p>
                        <Progress value={content.quality_score.authoritativeness_score} className="h-2 mb-2" />
                        <p className="text-xl font-bold text-purple-600">{content.quality_score.authoritativeness_score}%</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Trustworthiness</p>
                        <Progress value={content.quality_score.trustworthiness_score} className="h-2 mb-2" />
                        <p className="text-xl font-bold text-yellow-600">{content.quality_score.trustworthiness_score}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Freshness Score */}
                  {content.freshness && (
                    <div className="glass-card p-6">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Clock size={24} className="text-green-600" />
                        Content Freshness
                      </h2>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-3xl font-bold text-green-600 mb-2">
                            {content.freshness.freshness_score}%
                          </p>
                          <p className="text-gray-600">{content.freshness.status}</p>
                          <p className="text-sm text-gray-500 mt-1">{content.freshness.days_old} days old</p>
                        </div>
                        {content.freshness.needs_update && (
                          <Badge className="bg-orange-500">Update Recommended</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedContentDetails;
