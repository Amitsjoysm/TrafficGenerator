import { useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const AddContent = () => {
  const navigate = useNavigate();
  const [inputType, setInputType] = useState('url');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputType === 'url' && !url) {
      toast.error('Please enter a URL');
      return;
    }
    
    if (inputType === 'manual' && (!title || !content)) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        input_type: inputType,
        ...(inputType === 'url' ? { url } : { title, content })
      };
      
      const response = await axios.post(`${API}/content`, payload);
      toast.success('Content added successfully! Generating traffic strategies...');
      setTimeout(() => {
        navigate(`/content/${response.data.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error adding content:', error);
      toast.error(error.response?.data?.detail || 'Failed to add content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
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
          
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2" data-testid="add-content-title">
            Add New Content
          </h1>
          <p className="text-base text-gray-600">Add your blog or article to start generating organic traffic</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 fade-in">
          <Tabs value={inputType} onValueChange={setInputType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6" data-testid="input-type-tabs">
              <TabsTrigger value="url" className="flex items-center gap-2" data-testid="url-tab">
                <LinkIcon size={18} />
                From URL
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2" data-testid="manual-tab">
                <FileText size={18} />
                Manual Entry
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="url" className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Blog/Article URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourblog.com/article"
                    className="input-field"
                    data-testid="url-input"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    We'll automatically crawl and extract your content
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your article title"
                    className="input-field"
                    data-testid="title-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your article content here..."
                    className="textarea-field"
                    rows={12}
                    data-testid="content-input"
                  />
                </div>
              </TabsContent>

              <div className="mt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  data-testid="submit-btn"
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{width: '20px', height: '20px', borderWidth: '2px'}}></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Traffic Strategy
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 fade-in">
          <div className="glass-card p-6">
            <div className="text-purple-600 mb-3">
              <Sparkles size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">AI Optimization</h3>
            <p className="text-sm text-gray-600">
              Automatically generate LLM-optimized metadata and keywords
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="text-purple-600 mb-3">
              <FileText size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">Structured Data</h3>
            <p className="text-sm text-gray-600">
              Generate Schema.org markup for better LLM understanding
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="text-purple-600 mb-3">
              <LinkIcon size={32} />
            </div>
            <h3 className="font-bold text-lg mb-2">Query Testing</h3>
            <p className="text-sm text-gray-600">
              Test how LLMs respond to queries related to your content
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContent;