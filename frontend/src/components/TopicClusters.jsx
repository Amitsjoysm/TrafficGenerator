import React from 'react';
import { Network, ArrowRight, Lightbulb } from 'lucide-react';

const TopicClusters = ({ topicClusters }) => {
  if (!topicClusters || !topicClusters.pillar_topic) return null;

  const { pillar_topic, pillar_keywords, cluster_topics } = topicClusters;

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
        <Network size={20} className="text-indigo-600" />
        Topic Cluster Strategy
      </h3>

      {/* Pillar Topic */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4 text-center">
          <div className="text-xs uppercase tracking-wide mb-1 opacity-90">Pillar Content</div>
          <div className="text-xl font-bold mb-2">{pillar_topic}</div>
          {pillar_keywords && pillar_keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {pillar_keywords.map((kw, idx) => (
                <span key={idx} className="px-2 py-1 bg-white/20 rounded text-xs">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cluster Topics */}
      {cluster_topics && cluster_topics.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-yellow-600" />
            <span className="text-sm font-semibold">Suggested Cluster Topics</span>
          </div>
          <div className="space-y-3">
            {cluster_topics.map((cluster, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{cluster.topic}</div>
                    <div className="text-xs text-gray-600 mb-2">{cluster.relationship}</div>
                    {cluster.keywords && cluster.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cluster.keywords.map((kw, kidx) => (
                          <span key={kidx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-gray-400 mt-1 flex-shrink-0 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategy Tips */}
      <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-indigo-900 mb-2">💡 Content Strategy Tips</h4>
        <ul className="text-xs text-indigo-800 space-y-1">
          <li>• Create comprehensive pillar content covering the main topic</li>
          <li>• Write detailed cluster articles for each subtopic</li>
          <li>• Link all cluster content back to the pillar page</li>
          <li>• Use suggested keywords naturally in each piece</li>
          <li>• This structure improves topical authority and rankings</li>
        </ul>
      </div>
    </div>
  );
};

export default TopicClusters;
