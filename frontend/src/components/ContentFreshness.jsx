import React from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';

const ContentFreshness = ({ freshness, contentId, onRefresh }) => {
  if (!freshness) return null;

  const { freshness_score, status, days_old, needs_update } = freshness;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Very Fresh':
      case 'Fresh':
        return 'text-green-600 bg-green-100';
      case 'Recent':
        return 'text-blue-600 bg-blue-100';
      case 'Moderate':
        return 'text-orange-600 bg-orange-100';
      case 'Aging':
      case 'Outdated':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 75) return 'from-blue-500 to-blue-600';
    if (score >= 60) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-blue-600" />
        Content Freshness
      </h3>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-3xl font-bold text-gray-800">{freshness_score}</div>
          <div className="text-sm text-gray-600">Freshness Score</div>
        </div>
        <div className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(status)}`}>
          {status}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full bg-gradient-to-r ${getScoreColor(freshness_score)} transition-all`}
            style={{ width: `${freshness_score}%` }}
          ></div>
        </div>
      </div>

      {/* Age Info */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <Clock size={20} className="text-gray-600" />
        <div>
          <div className="text-sm font-medium text-gray-900">Content Age</div>
          <div className="text-xs text-gray-600">
            {days_old === 0 ? 'Created today' : `${days_old} day${days_old > 1 ? 's' : ''} old`}
          </div>
        </div>
      </div>

      {/* Update Alert */}
      {needs_update ? (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-red-900 text-sm mb-1">Update Recommended</div>
            <div className="text-xs text-red-800 mb-3">
              This content may be outdated. Refresh with current information, statistics, and examples to maintain rankings.
            </div>
            {onRefresh && (
              <Button
                onClick={() => onRefresh(contentId)}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                Refresh Content
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle size={18} className="text-green-600" />
          <span className="text-sm text-green-800">Content is fresh and up-to-date</span>
        </div>
      )}

      {/* Freshness Tips */}
      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <p className="font-semibold text-gray-700 mb-2">Maintain Freshness:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Update statistics and data regularly</li>
          <li>Add new examples and case studies</li>
          <li>Refresh publication dates after updates</li>
          <li>Monitor competitor content for new insights</li>
        </ul>
      </div>
    </div>
  );
};

export default ContentFreshness;
