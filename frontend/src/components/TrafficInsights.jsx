import React from 'react';
import { TrendingUp, Users, Target, AlertCircle, Zap, CheckCircle } from 'lucide-react';

const TrafficInsights = ({ trafficPrediction, keywordGap, serp, freshness }) => {
  if (!trafficPrediction) return null;

  const { estimated_monthly_traffic, traffic_tier, factors, recommendations } = trafficPrediction;

  const getTierColor = (tier) => {
    switch(tier) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Traffic Prediction */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-purple-600" />
          Traffic Prediction
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Low Estimate</div>
            <div className="text-2xl font-bold text-gray-700">
              {estimated_monthly_traffic?.low?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500">visits/month</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Expected</div>
            <div className="text-3xl font-bold text-purple-600">
              {estimated_monthly_traffic?.mid?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500">visits/month</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">High Estimate</div>
            <div className="text-2xl font-bold text-gray-700">
              {estimated_monthly_traffic?.high?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500">visits/month</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Traffic Tier:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTierColor(traffic_tier)}`}>
            {traffic_tier} Volume
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Keywords:</span>
            <span className="font-semibold">{factors?.keyword_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Quality Score:</span>
            <span className="font-semibold">{factors?.quality_score?.toFixed(1) || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Readability:</span>
            <span className="font-semibold">{factors?.readability_score?.toFixed(0) || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Word Count:</span>
            <span className="font-semibold">{factors?.content_length || 0}</span>
          </div>
        </div>
      </div>

      {/* Keyword Gap Analysis */}
      {keywordGap && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Target size={20} className="text-orange-600" />
            Keyword Coverage
          </h3>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Coverage Score</span>
              <span className="text-lg font-bold">{keywordGap.coverage_score?.toFixed(0) || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all"
                style={{ width: `${keywordGap.coverage_score || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{keywordGap.covered || 0}</div>
              <div className="text-xs text-gray-600">Covered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{keywordGap.missing || 0}</div>
              <div className="text-xs text-gray-600">Missing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{keywordGap.total_expected || 0}</div>
              <div className="text-xs text-gray-600">Expected</div>
            </div>
          </div>

          {keywordGap.missing_keywords && keywordGap.missing_keywords.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Missing Keywords:</div>
              <div className="flex flex-wrap gap-2">
                {keywordGap.missing_keywords.slice(0, 8).map((kw, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SERP Optimization */}
      {serp && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Zap size={20} className="text-yellow-600" />
            SERP Features
          </h3>

          <div className="space-y-3">
            {serp.featured_snippet && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {serp.featured_snippet.optimized ? (
                  <CheckCircle size={20} className="text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="text-orange-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">Featured Snippet</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {serp.featured_snippet.optimized
                      ? 'Content is optimized for featured snippets'
                      : 'Add clear definitions in first paragraph'}
                  </div>
                </div>
              </div>
            )}

            {serp.list_snippet && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {serp.list_snippet.optimized ? (
                  <CheckCircle size={20} className="text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="text-orange-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">List Snippet ({serp.list_snippet.count || 0} items)</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {serp.list_snippet.optimized
                      ? 'Great! Lists are well structured'
                      : serp.list_snippet.recommendation}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Users size={20} className="text-blue-600" />
            Recommendations to Boost Traffic
          </h3>

          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-blue-600 mt-0.5">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TrafficInsights;
