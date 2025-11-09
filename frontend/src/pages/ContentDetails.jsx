import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, ExternalLink, FileCode, MessageSquare, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
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

        {/* Tabs */}
        <Tabs defaultValue="queries" className="fade-in">
          <TabsList className="glass-card p-2 mb-6" data-testid="tabs-list">
            <TabsTrigger value="queries" className="flex items-center gap-2" data-testid="queries-tab">
              <MessageSquare size={18} />
              Synthetic Queries ({queries.length})
            </TabsTrigger>
            <TabsTrigger value="structured" className="flex items-center gap-2" data-testid="structured-tab">
              <FileCode size={18} />
              Structured Data
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2" data-testid="optimization-tab">
              <Zap size={18} />
              Optimization Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queries">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4" data-testid="queries-title">Generated Search Queries</h2>
              <p className="text-sm text-gray-600 mb-6">
                These queries help LLMs understand when to reference your content
              </p>
              
              {queries.length === 0 ? (
                <p className="text-gray-500 text-center py-8" data-testid="no-queries">No queries generated yet</p>
              ) : (
                <div className="space-y-4">
                  {queries.map((query, idx) => (
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

          <TabsContent value="structured">
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" data-testid="structured-title">Schema.org Structured Data</h2>
                <Button
                  onClick={() => copyToClipboard(JSON.stringify(content.structured_data, null, 2))}
                  variant="outline"
                  className="flex items-center gap-2"
                  data-testid="copy-structured-btn"
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Add this to your page's HTML to improve LLM understanding
              </p>
              
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm" data-testid="structured-data-json">
                {JSON.stringify(content.structured_data, null, 2)}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="optimization">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6" data-testid="optimization-title">Optimization Recommendations</h2>
              
              <div className="space-y-6">
                <div className="content-card" data-testid="optimization-metadata">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Zap className="text-yellow-500" size={20} />
                    Metadata Optimization
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Your title is optimized for LLM context at {content.optimized_title?.length || 0} characters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Meta description is within optimal length ({content.optimized_description?.length || 0} chars)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{content.keywords?.length || 0} targeted keywords identified</span>
                    </li>
                  </ul>
                </div>

                <div className="content-card" data-testid="optimization-tips">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Zap className="text-purple-500" size={20} />
                    Next Steps
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">→</span>
                      <span>Add the structured data JSON to your page's &lt;head&gt; section</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">→</span>
                      <span>Update your page's meta title and description with the optimized versions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">→</span>
                      <span>Incorporate the suggested keywords naturally throughout your content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">→</span>
                      <span>Submit your sitemap to search engines for faster indexing</span>
                    </li>
                  </ul>
                </div>

                <div className="content-card" data-testid="optimization-performance">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Zap className="text-blue-500" size={20} />
                    Performance Analysis
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Your content scored <strong>{content.performance_score}%</strong> in our LLM optimization analysis.
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full" 
                      style={{
                        width: `${content.performance_score}%`,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                      data-testid="performance-bar"
                    ></div>
                  </div>
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