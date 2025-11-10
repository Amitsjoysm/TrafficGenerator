import React from 'react';
import { Globe, Share2, Twitter } from 'lucide-react';

const MetaPreview = ({ metaPreview, title, description, url }) => {
  if (!metaPreview) return null;

  const { google, social, character_counts } = metaPreview;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Globe size={20} className="text-blue-600" />
        Search Engine Preview
      </h3>

      {/* Google Preview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          <span className="text-sm font-semibold">Google Search</span>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-green-700">{google?.url_display}</div>
          <div className="text-xl text-blue-600 hover:underline cursor-pointer">
            {google?.title}
          </div>
          <div className="text-sm text-gray-600">{google?.description}</div>
        </div>
        <div className="mt-3 flex gap-4 text-xs">
          <span className={character_counts?.title_optimal ? 'text-green-600' : 'text-orange-600'}>
            Title: {character_counts?.title_length} chars {character_counts?.title_optimal ? '✓' : '⚠'}
          </span>
          <span className={character_counts?.description_optimal ? 'text-green-600' : 'text-orange-600'}>
            Description: {character_counts?.description_length} chars {character_counts?.description_optimal ? '✓' : '⚠'}
          </span>
        </div>
      </div>

      {/* Social Media Previews */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Facebook/Open Graph */}
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Share2 size={16} className="text-blue-600" />
            <span className="text-sm font-semibold">Facebook</span>
          </div>
          <div className="border border-gray-300 rounded">
            <div className="bg-gray-200 h-32 flex items-center justify-center text-gray-400 text-sm">
              [Image Preview]
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                {social?.og_title}
              </div>
              <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                {social?.og_description}
              </div>
              <div className="text-xs text-gray-500 mt-1">{google?.url_display}</div>
            </div>
          </div>
        </div>

        {/* Twitter */}
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Twitter size={16} className="text-blue-400" />
            <span className="text-sm font-semibold">Twitter</span>
          </div>
          <div className="border border-gray-300 rounded">
            <div className="bg-gray-200 h-32 flex items-center justify-center text-gray-400 text-sm">
              [Image Preview]
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                {social?.twitter_title}
              </div>
              <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                {social?.twitter_description}
              </div>
              <div className="text-xs text-gray-500 mt-1">{google?.url_display}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaPreview;
