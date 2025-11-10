import React from 'react';
import { Award, TrendingUp, AlertTriangle } from 'lucide-react';

const SEOScoreCard = ({ seoScore }) => {
  if (!seoScore) return null;

  const { overall_score, breakdown, grade, recommendations } = seoScore;

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const categories = [
    { key: 'title', label: 'Title Optimization', max: 20 },
    { key: 'description', label: 'Meta Description', max: 20 },
    { key: 'keywords', label: 'Keywords', max: 20 },
    { key: 'content_quality', label: 'Content Quality', max: 20 },
    { key: 'technical', label: 'Technical SEO', max: 20 },
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award size={20} className="text-purple-600" />
          Comprehensive SEO Score
        </h3>
        <div className={`px-4 py-2 rounded-full text-2xl font-bold ${getGradeColor(grade)}`}>
          {grade}
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-6 text-center">
        <div className={`text-5xl font-bold ${getScoreColor(overall_score)}`}>
          {overall_score}
        </div>
        <div className="text-sm text-gray-600 mt-1">out of 100</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div
            className={`h-2 rounded-full transition-all ${overall_score >= 85 ? 'bg-green-600' : overall_score >= 70 ? 'bg-blue-600' : overall_score >= 50 ? 'bg-orange-600' : 'bg-red-600'}`}
            style={{ width: `${overall_score}%` }}
          ></div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3 mb-6">
        {categories.map(({ key, label, max }) => {
          const score = breakdown?.[key] || 0;
          const percentage = (score / max) * 100;
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm font-semibold">{score}/{max}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    percentage >= 75 ? 'bg-green-500' :
                    percentage >= 50 ? 'bg-blue-500' :
                    percentage >= 30 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-blue-600" />
            Improvement Opportunities
          </h4>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <AlertTriangle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SEOScoreCard;
