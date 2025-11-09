import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, ExternalLink, FileCode, MessageSquare, Zap, Share2, Mic, HelpCircle, BarChart3, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

const ContentDetails = () => {
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

  const copyToClipboard = (text, label = 'text') => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const getReadabilityColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-4 flex items-center gap-2"
            data-testid="back-btn"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>
        </div>

        {/* Content Header */}
        <div className="glass-card p-8 mb-6 fade-in">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2" data-testid="content-title">
                {content.optimized_title || content.title}
              </h1>
              <p className="text-base text-gray-600 mb-4" data-testid="content-description">
                {content.optimized_description}
              </p>
            </div>
            <span className="score-badge text-lg px-4 py-2" data-testid="performance-score">
              {content.performance_score}%
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {content.keywords && content.keywords.map((keyword, idx) => (
              <span key={idx} className="keyword-badge" data-testid={`keyword-${idx}`}>
                {keyword}
              </span>
            ))}
          </div>

          {content.url && (
            <a 
              href={content.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline flex items-center gap-2"
              data-testid="original-url"
            >
              <ExternalLink size={16} />
              View Original Article
            </a>
          )}
        </div>

        {/* Content Optimization Overview */}
        {content.content_optimization && (
          <div className="glass-card p-6 mb-6 fade-in" data-testid="optimization-overview">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={24} className="text-purple-600" />
              Content Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 mb-1">Readability Score</p>
                <p className={`text-2xl font-bold ${getReadabilityColor(content.content_optimization.readability_score)}`}>
                  {content.content_optimization.readability_score}
                </p>
                <p className="text-xs text-gray-500 mt-1">{content.content_optimization.reading_level}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-gray-600 mb-1">Word Count</p>
                <p className="text-2xl font-bold text-green-600">
                  {content.content_optimization.word_count}
                </p>
                <p className="text-xs text-gray-500 mt-1">Optimal: 500-2000 words</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">SEO Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {content.performance_score}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Based on optimization</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="social" className="fade-in">
          <TabsList className="glass-card p-2 mb-6 flex-wrap" data-testid="tabs-list">
            <TabsTrigger value="social" className="flex items-center gap-2" data-testid="social-tab">
              <Share2 size={18} />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-2" data-testid="faqs-tab">
              <HelpCircle size={18} />
              FAQs ({content.faqs?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2" data-testid="voice-tab">
              <Mic size={18} />
              Voice Search
            </TabsTrigger>
            <TabsTrigger value="queries" className="flex items-center gap-2" data-testid="queries-tab">
              <MessageSquare size={18} />
              Queries ({standardQueries.length})
            </TabsTrigger>
            <TabsTrigger value="structured" className="flex items-center gap-2" data-testid="structured-tab">
              <FileCode size={18} />
              Structured Data
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2" data-testid="optimization-tab">
              <Zap size={18} />
              Optimization
            </TabsTrigger>
          </TabsList>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" data-testid="social-title">
                <Share2 size={24} className="text-purple-600" />
                Social Media Posts
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Ready-to-use social media posts optimized for each platform
              </p>
              
              {content.social_posts && content.social_posts.length > 0 ? (
                <div className="space-y-4">
                  {content.social_posts.map((post, idx) => (
                    <div key={idx} className="content-card" data-testid={`social-post-${idx}`}>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-purple-600">{post.platform}</h3>
                        <Button
                          onClick={() => copyToClipboard(post.post_text + ' ' + post.hashtags.map(h => '#' + h).join(' '), post.platform + ' post')}
                          variant="outline"
                          size="sm"
                          data-testid={`copy-social-${idx}`}
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                      <p className="text-gray-700 mb-3" data-testid={`social-text-${idx}`}>{post.post_text}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.hashtags.map((tag, tagIdx) => (
                          <span key={tagIdx} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full" data-testid={`hashtag-${idx}-${tagIdx}`}>
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

              {/* Open Graph & Twitter Cards */}
              {content.open_graph_tags && (
                <div className="mt-8">
                  <h3 className="font-bold text-lg mb-4">Meta Tags for Social Sharing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <ExternalLink size={16} />
                        Open Graph Tags
                      </h4>
                      <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto" data-testid="open-graph-tags">
                        {Object.entries(content.open_graph_tags).map(([key, value]) => 
                          `<meta property="${key}" content="${value}" />`
                        ).join('\n')}
                      </pre>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Share2 size={16} />
                        Twitter Card Tags
                      </h4>
                      <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto" data-testid="twitter-card-tags">
                        {Object.entries(content.twitter_card_tags || {}).map(([key, value]) => 
                          `<meta name="${key}" content="${value}" />`
                        ).join('\n')}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" data-testid="faqs-title">
                <HelpCircle size={24} className="text-purple-600" />
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                FAQs optimized for LLM and voice assistants with Schema.org markup
              </p>
              
              {content.faqs && content.faqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {content.faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`} data-testid={`faq-item-${idx}`}>
                      <AccordionTrigger className="text-left" data-testid={`faq-question-${idx}`}>
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent data-testid={`faq-answer-${idx}`}>
                        <p className="text-gray-700">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-gray-500 text-center py-8">No FAQs generated</p>
              )}
            </div>
          </TabsContent>

          {/* Voice Search Tab */}
          <TabsContent value="voice">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" data-testid="voice-title">
                <Mic size={24} className="text-purple-600" />
                Voice Search Queries
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Conversational queries optimized for voice assistants (Siri, Alexa, Google)
              </p>
              
              {voiceQueries.length > 0 ? (
                <div className="space-y-3">
                  {voiceQueries.map((query, idx) => (
                    <div key={query.id} className="content-card" data-testid={`voice-query-${idx}`}>
                      <div className="flex items-start gap-3">
                        <Mic className="text-purple-500 mt-1" size={20} />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800" data-testid={`voice-query-text-${idx}`}>
                            {query.query}
                          </p>
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

          {/* Standard Queries Tab */}
          <TabsContent value="queries">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4" data-testid="queries-title">Generated Search Queries</h2>
              <p className="text-sm text-gray-600 mb-6">
                These queries help LLMs understand when to reference your content
              </p>
              
              {standardQueries.length === 0 ? (
                <p className="text-gray-500 text-center py-8" data-testid="no-queries">No queries generated yet</p>
              ) : (
                <div className="space-y-4">
                  {standardQueries.map((query, idx) => (
                    <div key={query.id} className="content-card" data-testid={`query-card-${idx}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 mb-2" data-testid={`query-text-${idx}`}>
                            {query.query}
                          </p>
                          <p className="text-sm text-gray-600" data-testid={`query-response-${idx}`}>
                            {query.response}
                          </p>
                          <div className="mt-2">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded" data-testid={`query-score-${idx}`}>
                              Relevance: {query.relevance_score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Structured Data Tab */}
          <TabsContent value="structured">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" data-testid="structured-title">Schema.org Structured Data</h2>
                <Button
                  onClick={() => copyToClipboard(JSON.stringify(content.structured_data, null, 2), 'Structured data')}
                  variant="outline"
                  className="flex items-center gap-2"
                  data-testid="copy-structured-btn"
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Add this to your page's HTML &lt;script type="application/ld+json"&gt; for better LLM understanding
              </p>
              
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm" data-testid="structured-data-json">
                {JSON.stringify(content.structured_data, null, 2)}
              </pre>
            </div>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6" data-testid="optimization-title">Content Optimization Report</h2>
              
              <div className="space-y-6">
                {/* Readability Analysis */}
                {content.content_optimization && (
                  <div className="content-card" data-testid="readability-analysis">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <BarChart3 className="text-blue-500" size={20} />
                      Readability Analysis
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Reading Ease Score</span>
                          <span className={`font-bold ${getReadabilityColor(content.content_optimization.readability_score)}`}>
                            {content.content_optimization.readability_score}/100
                          </span>
                        </div>
                        <Progress value={content.content_optimization.readability_score} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Reading Level</p>
                          <p className="font-semibold">{content.content_optimization.reading_level}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Grade Level</p>
                          <p className="font-semibold">{content.content_optimization.flesch_kincaid_grade}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Keyword Density */}
                {content.content_optimization?.keyword_density && Object.keys(content.content_optimization.keyword_density).length > 0 && (
                  <div className="content-card" data-testid="keyword-density">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="text-green-500" size={20} />
                      Top Keywords by Density
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(content.content_optimization.keyword_density).map(([word, density], idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{word}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{width: `${Math.min(density * 10, 100)}%`}}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">{density}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {content.content_optimization?.recommendations && content.content_optimization.recommendations.length > 0 && (
                  <div className="content-card" data-testid="recommendations">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Zap className="text-yellow-500" size={20} />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {content.content_optimization.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-yellow-500 mt-1">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                <div className="content-card" data-testid="next-steps">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Zap className="text-purple-500" size={20} />
                    Next Steps for Maximum Traffic
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>Copy and add structured data JSON to your page's &lt;head&gt; section</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>Update meta tags with Open Graph and Twitter Card data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>Add FAQ section to your page with generated questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>Share on social media using the generated posts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>Optimize content based on readability recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentDetails;