import React, { useState } from 'react';
import { Download, FileJson, FileText, Code, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from 'sonner';
import { API } from '../App';

const ExportModal = ({ isOpen, onClose, contentId }) => {
  const [copied, setCopied] = useState(null);

  const handleExport = async (format) => {
    try {
      const response = await fetch(`${API}/content/${contentId}/export/${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content_${contentId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export');
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${contentId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied('link');
    toast.success('Share link copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  const copySitemapUrl = () => {
    const sitemapUrl = `${window.location.origin}/api/sitemap.xml`;
    navigator.clipboard.writeText(sitemapUrl);
    setCopied('sitemap');
    toast.success('Sitemap URL copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={20} />
            Export & Share Options
          </DialogTitle>
          <DialogDescription>
            Download optimized content or share publicly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Export Formats */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Export Formats</h4>
            <div className="space-y-2">
              <Button
                onClick={() => handleExport('json')}
                variant="outline"
                className="w-full justify-start"
              >
                <FileJson size={16} className="mr-2" />
                Export as JSON
              </Button>
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                className="w-full justify-start"
              >
                <FileText size={16} className="mr-2" />
                Export as CSV
              </Button>
              <Button
                onClick={() => handleExport('html')}
                variant="outline"
                className="w-full justify-start"
              >
                <Code size={16} className="mr-2" />
                Export as HTML (with meta tags)
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Public Sharing</h4>
            <div className="space-y-2">
              <Button
                onClick={copyShareLink}
                variant="outline"
                className="w-full justify-start"
              >
                {copied === 'link' ? (
                  <Check size={16} className="mr-2 text-green-600" />
                ) : (
                  <Copy size={16} className="mr-2" />
                )}
                Copy Share Link
              </Button>
              <Button
                onClick={copySitemapUrl}
                variant="outline"
                className="w-full justify-start"
              >
                {copied === 'sitemap' ? (
                  <Check size={16} className="mr-2 text-green-600" />
                ) : (
                  <Copy size={16} className="mr-2" />
                )}
                Copy Sitemap URL
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
            <p className="font-semibold mb-1">📌 Implementation Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>HTML export includes all SEO meta tags</li>
              <li>Add sitemap URL to Google Search Console</li>
              <li>Share links are public and SEO-optimized</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
