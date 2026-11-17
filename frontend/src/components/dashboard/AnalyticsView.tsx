import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  Tag,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';

export const AnalyticsView: React.FC = () => {
  const { analysisData } = useAnalytics();
  const [activeSubTab, setActiveSubTab] = useState<'numeric' | 'categorical' | 'date'>('numeric');
  const [expandedCol, setExpandedCol] = useState<string | null>(null);

  if (!analysisData || !analysisData.analytics) {
    return (
      <div className="p-8 text-center text-[#92969E] font-mono text-xs">
        No statistical analytics available.
      </div>
    );
  }

  const { analytics } = analysisData;
  const numericCols = Object.entries(analytics.numeric_analysis || {});
  const categoricalCols = Object.entries(analytics.categorical_analysis || {});
  const dateCols = Object.entries(analytics.date_analysis || {});

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sub-navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="font-space font-bold text-2xl text-white">Statistical Analytics</h3>
          <p className="text-xs text-[#92969E] font-mono mt-1">
            Parametric statistics, central tendency, dispersion, frequency distributions, and temporal ranges.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#16181b] border border-white/10">
          <button
            type="button"
            onClick={() => setActiveSubTab('numeric')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeSubTab === 'numeric'
                ? 'bg-white text-[#101113] font-medium shadow'
                : 'text-[#92969E] hover:text-white'
            }`}
          >
            Numeric ({numericCols.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('categorical')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeSubTab === 'categorical'
                ? 'bg-white text-[#101113] font-medium shadow'
                : 'text-[#92969E] hover:text-white'
            }`}
          >
            Categorical ({categoricalCols.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('date')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeSubTab === 'date'
                ? 'bg-white text-[#101113] font-medium shadow'
                : 'text-[#92969E] hover:text-white'
            }`}
          >
            Date / Temporal ({dateCols.length})
          </button>
        </div>
      </div>

      {/* Numeric Analysis Tab */}
      {activeSubTab === 'numeric' && (
        <div className="space-y-4">
          {numericCols.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#16181b]/80 border border-white/10 text-[#92969E] font-mono text-xs">
              No numerical columns identified in this dataset.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {numericCols.map(([colName, stats]) => {
                const min = typeof stats?.minimum === 'number' ? stats.minimum : null;
                const max = typeof stats?.maximum === 'number' ? stats.maximum : null;
                const avg = typeof stats?.average === 'number' ? stats.average : null;
                const median = typeof stats?.median === 'number' ? stats.median : null;
                const std = typeof stats?.standard_deviation === 'number' ? stats.standard_deviation : null;
                const sum = typeof stats?.sum === 'number' ? stats.sum : 0;
                const count = typeof stats?.count === 'number' ? stats.count : 0;

                const range = (max !== null && min !== null) ? max - min : 0;
                const avgPercent = (range > 0 && avg !== null && min !== null)
                  ? Math.min(100, Math.max(0, ((avg - min) / range) * 100))
                  : 50;

                return (
                  <div
                    key={colName}
                    className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-space font-semibold text-white text-base truncate max-w-[180px]">
                          {colName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          N = {count.toLocaleString()}
                        </span>
                      </div>

                      {/* Primary Mean & Median */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-[#202226]/60 border border-white/5">
                          <div className="text-[10px] font-mono text-[#92969E] uppercase">Mean (Avg)</div>
                          <div className="text-lg font-space font-bold text-white mt-0.5">
                            {avg !== null ? avg.toLocaleString() : 'N/A'}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#202226]/60 border border-white/5">
                          <div className="text-[10px] font-mono text-[#92969E] uppercase">Median</div>
                          <div className="text-lg font-space font-bold text-white mt-0.5">
                            {median !== null ? median.toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Range Visualizer */}
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-mono text-[#92969E] mb-1">
                          <span>Min: {min !== null ? min.toLocaleString() : 'N/A'}</span>
                          <span>Max: {max !== null ? max.toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 relative overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 bg-blue-400 rounded-full"
                            style={{
                              left: '0%',
                              width: `${avgPercent}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Secondary metrics */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#92969E] border-t border-white/5 pt-3">
                        <div>
                          <span>Std Dev:</span>{' '}
                          <span className="text-white">
                            {std !== null ? std.toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span>Sum:</span>{' '}
                          <span className="text-white">
                            {sum.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Categorical Analysis Tab */}
      {activeSubTab === 'categorical' && (
        <div className="space-y-4">
          {categoricalCols.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#16181b]/80 border border-white/10 text-[#92969E] font-mono text-xs">
              No categorical columns identified in this dataset.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoricalCols.map(([colName, stats]) => {
                const dist = stats?.value_distribution || {};
                const totalValues = Object.values(dist).reduce((a, b) => a + (Number(b) || 0), 0);
                const isExpanded = expandedCol === colName;
                const entries = Object.entries(dist);
                const displayedEntries = isExpanded ? entries : entries.slice(0, 6);

                return (
                  <div
                    key={colName}
                    className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-space font-semibold text-white text-base">{colName}</h4>
                        <p className="text-xs font-mono text-[#92969E] mt-0.5">
                          {stats?.unique_values ?? entries.length} unique categories
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        CATEGORICAL
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {displayedEntries.map(([label, countVal]) => {
                        const count = Number(countVal) || 0;
                        const percent = totalValues > 0 ? (count / totalValues) * 100 : 0;
                        return (
                          <div key={label} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-[#D9DADD] truncate max-w-[200px]">{label || '(Empty)'}</span>
                              <span className="text-[#92969E]">
                                {count.toLocaleString()} ({percent.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-purple-400 rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {entries.length > 6 && (
                      <button
                        type="button"
                        onClick={() => setExpandedCol(isExpanded ? null : colName)}
                        className="mt-4 text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" /> Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" /> Show {entries.length - 6} more categories
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Date Analysis Tab */}
      {activeSubTab === 'date' && (
        <div className="space-y-4">
          {dateCols.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#16181b]/80 border border-white/10 text-[#92969E] font-mono text-xs">
              No date or time-series columns identified in this dataset.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dateCols.map(([colName, stats]) => (
                <div
                  key={colName}
                  className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-space font-semibold text-white text-base">{colName}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      TEMPORAL
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-[#202226]/50 border border-white/5 flex justify-between items-center">
                      <span className="text-[#92969E]">Earliest Timestamp:</span>
                      <span className="text-white font-medium">{stats?.earliest_date || 'N/A'}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#202226]/50 border border-white/5 flex justify-between items-center">
                      <span className="text-[#92969E]">Latest Timestamp:</span>
                      <span className="text-white font-medium">{stats?.latest_date || 'N/A'}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center text-amber-300">
                      <span>Total Time Span:</span>
                      <span className="font-bold">
                        {typeof stats?.date_range_days === 'number'
                          ? `${stats.date_range_days.toLocaleString()} Days`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
