import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, FileText, Zap, Eye, Search, Trash2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, contentsRes] = await Promise.all([
        axios.get(`${API}/analytics`),
        axios.get(`${API}/content`)
      ]);
      setAnalytics(analyticsRes.data);
      setContents(contentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contentToDelete) return;
    
    try {
      await axios.delete(`${API}/content/${contentToDelete}`);
      toast.success('Content deleted successfully');
      setDeleteDialogOpen(false);
      setContentToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const openDeleteDialog = (contentId) => {
    setContentToDelete(contentId);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2" data-testid="dashboard-title">
                Traffic Wizard
              </h1>
              <p className="text-base text-gray-600">Generate organic LLM traffic with advanced optimization</p>
            </div>
            <Button
              onClick={() => navigate('/add')}
              className="btn-primary flex items-center gap-2"
              data-testid="add-content-btn"
            >
              <Plus size={20} />
              Add Content
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 fade-in">
          <div className="stat-card" data-testid="total-content-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Content</p>
                <h3 className="text-3xl font-bold">{analytics?.total_content || 0}</h3>
              </div>
              <FileText size={40} className="opacity-80" />
            </div>
          </div>

          <div className="stat-card" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}} data-testid="queries-generated-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Queries Generated</p>
                <h3 className="text-3xl font-bold">{analytics?.total_queries || 0}</h3>
              </div>
              <Search size={40} className="opacity-80" />
            </div>
          </div>

          <div className="stat-card" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}} data-testid="avg-performance-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Avg SEO Score</p>
                <h3 className="text-3xl font-bold">{analytics?.avg_performance_score || 0}%</h3>
              </div>
              <TrendingUp size={40} className="opacity-80" />
            </div>
          </div>

          <div className="stat-card" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}} data-testid="avg-readability-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Avg Readability</p>
                <h3 className="text-3xl font-bold">{analytics?.avg_readability_score?.toFixed(0) || 0}</h3>
              </div>
              <BarChart3 size={40} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Charts */}
        {analytics?.top_performing && analytics.top_performing.length > 0 && (
          <div className="glass-card p-6 mb-8 fade-in" data-testid="performance-chart">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-600" />
              Top Performing Content
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.top_performing}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="title" 
                  tick={{ fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="performance_score" fill="#667eea" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Content List */}
        <div className="glass-card p-6 fade-in" data-testid="content-list">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FileText size={24} className="text-purple-600" />
            Your Content Library
          </h2>
          
          {contents.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-state">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No content yet. Add your first blog or article!</p>
              <Button onClick={() => navigate('/add')} className="btn-primary" data-testid="add-first-content-btn">
                Add Content
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contents.map((content, index) => (
                <div 
                  key={content.id} 
                  className="content-card cursor-pointer relative group"
                  data-testid={`content-card-${index}`}
                >
                  <div onClick={() => navigate(`/content/${content.id}`)}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-4" data-testid={`content-title-${index}`}>
                        {content.optimized_title || content.title}
                      </h3>
                      <div className="flex gap-2">
                        <span className="score-badge" data-testid={`content-score-${index}`}>
                          SEO: {content.performance_score}%
                        </span>
                        {content.content_optimization?.readability_score && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-full font-semibold" data-testid={`readability-score-${index}`}>
                            Read: {content.content_optimization.readability_score}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`content-description-${index}`}>
                      {content.optimized_description || content.content.substring(0, 150) + '...'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {content.keywords && content.keywords.slice(0, 5).map((keyword, idx) => (
                        <span key={idx} className="keyword-badge" data-testid={`keyword-${index}-${idx}`}>
                          {keyword}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1" data-testid={`content-views-${index}`}>
                        <Eye size={16} />
                        {content.views || 0} views
                      </span>
                      {content.social_posts && content.social_posts.length > 0 && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Zap size={16} />
                          {content.social_posts.length} social posts
                        </span>
                      )}
                      {content.faqs && content.faqs.length > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          {content.faqs.length} FAQs
                        </span>
                      )}
                      {content.url && (
                        <a 
                          href={content.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`content-url-${index}`}
                        >
                          View Original
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(content.id);
                    }}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                    data-testid={`delete-btn-${index}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              data-testid="confirm-delete-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;