import React, { useState } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { ChartData } from '../../types/analytics';

const PALETTE = [
  '#E2E8F0', // silver-light
  '#94A3B8', // slate-400
  '#60A5FA', // blue-400
  '#A78BFA', // purple-400
  '#F59E0B', // amber-500
  '#34D399', // emerald-400
  '#F87171', // rose-400
  '#38BDF8', // sky-400
];

export const VisualizationsView: React.FC = () => {
  const { analysisData } = useAnalytics();
  const [activeType, setActiveType] = useState<'all' | 'bar' | 'pie' | 'hist' | 'line'>('all');

  if (!analysisData || !analysisData.visualizations) {
    return (
      <div className="p-8 text-center text-[#92969E] font-mono text-xs">
        No dynamic visualizations available.
      </div>
    );
  }

  const { visualizations } = analysisData;
  const bar_charts = visualizations.bar_charts || [];
  const pie_charts = visualizations.pie_charts || [];
  const histograms = visualizations.histograms || [];
  const line_charts = visualizations.line_charts || [];

  const totalCharts =
    bar_charts.length + pie_charts.length + histograms.length + line_charts.length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="font-space font-bold text-2xl text-white">Dynamic Visualizations</h3>
          <p className="text-xs text-[#92969E] font-mono mt-1">
            Visual graphs synthesized dynamically from actual dataset categorical frequencies, continuous distributions, and time trajectories.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#16181b] border border-white/10">
          <button
            type="button"
            onClick={() => setActiveType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeType === 'all'
                ? 'bg-white text-[#101113] font-medium shadow'
                : 'text-[#92969E] hover:text-white'
            }`}
          >
            All ({totalCharts})
          </button>
          <button
            type="button"
            onClick={() => setActiveType('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeType === 'bar'
                ? 'bg-white text-[#101113] font-medium shadow'
                : 'text-[#92969E] hover:text-white'
            }`}
          >
            Bars ({bar_charts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveType('pie')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeType === 'pie'
                ? 'bg-white text-[#101113] font-medium shadow'
                : 'text-[#92969E] hover:text-white'
            }`}
          >
            Proportions ({pie_charts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveType('hist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeType === 'hist'
                ? 'bg-white text-[#101113] font-medium shadow'
                : 'text-[#92969E] hover:text-white'
            }`}
          >
            Histograms ({histograms.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveType('line')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeType === 'line'
                ? 'bg-white text-[#101113] font-medium shadow'
                : 'text-[#92969E] hover:text-white'
            }`}
          >
            Trends ({line_charts.length})
          </button>
        </div>
      </div>

      {totalCharts === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#16181b]/80 border border-white/10 text-[#92969E] font-mono text-sm">
          No visualizations could be automatically generated for this dataset structure.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Charts */}
          {(activeType === 'all' || activeType === 'bar') &&
            bar_charts.map((chart, idx) => (
              <BarChartCard key={`bar-${idx}`} chart={chart} />
            ))}

          {/* Pie / Donut Charts */}
          {(activeType === 'all' || activeType === 'pie') &&
            pie_charts.map((chart, idx) => (
              <DonutChartCard key={`pie-${idx}`} chart={chart} />
            ))}

          {/* Histograms */}
          {(activeType === 'all' || activeType === 'hist') &&
            histograms.map((chart, idx) => (
              <HistogramCard key={`hist-${idx}`} chart={chart} />
            ))}

          {/* Line Trends */}
          {(activeType === 'all' || activeType === 'line') &&
            line_charts.map((chart, idx) => (
              <LineChartCard key={`line-${idx}`} chart={chart} />
            ))}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * BAR CHART COMPONENT
 * ------------------------------------------------------------- */
const BarChartCard: React.FC<{ chart: ChartData }> = ({ chart }) => {
  const vals = (chart.values || []).map((v) => Number(v) || 0);
  const labels = chart.labels || [];
  const maxVal = Math.max(...vals, 1);

  return (
    <div className="p-6 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-silver-light" />
            <h4 className="font-space font-semibold text-white text-base">{chart.title || 'Bar Chart'}</h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#D9DADD]">
            BAR CHART
          </span>
        </div>

        <div className="space-y-3 mt-6">
          {labels.map((label, i) => {
            const val = vals[i] ?? 0;
            const pct = (val / maxVal) * 100;
            return (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#D9DADD] truncate max-w-[240px]">{label || '(Blank)'}</span>
                  <span className="text-white font-medium">{val.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-silver-light to-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6 pt-3 border-t border-white/5 text-[10px] font-mono text-[#92969E] flex justify-between">
        <span>Category: {chart.category_column || 'Categorical'}</span>
        <span>Top {labels.length} distributions</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * DONUT / PROPORTION COMPONENT
 * ------------------------------------------------------------- */
const DonutChartCard: React.FC<{ chart: ChartData }> = ({ chart }) => {
  const vals = (chart.values || []).map((v) => Number(v) || 0);
  const labels = chart.labels || [];
  const total = vals.reduce((sum, v) => sum + v, 0);

  return (
    <div className="p-6 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" />
            <h4 className="font-space font-semibold text-white text-base">{chart.title || 'Proportion'}</h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
            PROPORTION
          </span>
        </div>

        {/* Segmented Stacked Bar */}
        <div className="my-6">
          <div className="w-full h-4 rounded-lg overflow-hidden flex bg-white/10 shadow-inner">
            {labels.map((label, i) => {
              const val = vals[i] ?? 0;
              const pct = total > 0 ? (val / total) * 100 : 0;
              const color = PALETTE[i % PALETTE.length];
              return (
                <div
                  key={i}
                  style={{ width: `${pct}%`, backgroundColor: color }}
                  className="h-full transition-all duration-500 hover:opacity-80"
                  title={`${label}: ${val.toLocaleString()} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {labels.map((label, i) => {
            const val = vals[i] ?? 0;
            const pct = total > 0 ? (val / total) * 100 : 0;
            const color = PALETTE[i % PALETTE.length];
            return (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#202226]/40 border border-white/5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[#D9DADD] truncate max-w-[110px]">{label || '(Blank)'}</span>
                </div>
                <span className="text-[#92969E] ml-1 flex-shrink-0">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6 pt-3 border-t border-white/5 text-[10px] font-mono text-[#92969E] flex justify-between">
        <span>Column: {chart.category_column || 'Feature'}</span>
        <span>Total count: {total.toLocaleString()}</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * HISTOGRAM COMPONENT
 * ------------------------------------------------------------- */
const HistogramCard: React.FC<{ chart: ChartData }> = ({ chart }) => {
  const vals = (chart.values || []).map((v) => Number(v) || 0);
  const labels = chart.labels || [];
  const maxVal = Math.max(...vals, 1);

  return (
    <div className="p-6 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h4 className="font-space font-semibold text-white text-base">{chart.title || 'Histogram'}</h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            FREQUENCY HISTOGRAM
          </span>
        </div>

        {/* Vertical Columns chart */}
        <div className="h-44 flex items-end gap-2 pt-6 pb-2 border-b border-white/10 px-2">
          {labels.map((label, i) => {
            const val = vals[i] ?? 0;
            const heightPct = Math.max(4, (val / maxVal) * 100);
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-white whitespace-nowrap z-20 pointer-events-none">
                  {val.toLocaleString()}
                </div>
                <div
                  className="w-full bg-blue-400/80 hover:bg-blue-300 rounded-t transition-all duration-300"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] font-mono text-[#92969E] mt-2 px-1">
          <span>{labels[0] || 'Min'}</span>
          <span>Bin Range Intervals</span>
          <span>{labels[labels.length - 1] || 'Max'}</span>
        </div>
      </div>
      <div className="mt-6 pt-3 border-t border-white/5 text-[10px] font-mono text-[#92969E] flex justify-between">
        <span>Feature: {chart.numeric_column || 'Numeric'}</span>
        <span>{labels.length} Bins</span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * LINE TREND COMPONENT
 * ------------------------------------------------------------- */
const LineChartCard: React.FC<{ chart: ChartData }> = ({ chart }) => {
  const vals = (chart.values || []).map((v) => Number(v) || 0);
  const labels = chart.labels || [];
  const minVal = vals.length > 0 ? Math.min(...vals, 0) : 0;
  const maxVal = vals.length > 0 ? Math.max(...vals, 1) : 1;
  const range = maxVal - minVal || 1;

  const width = 500;
  const height = 160;
  const padding = 20;

  const points = vals.map((v, i) => {
    const x = padding + (i / Math.max(vals.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((v - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polylineStr = points.join(' ');
  const areaPoints = points.length > 0
    ? `${padding},${height} ${polylineStr} ${width - padding},${height}`
    : '';

  return (
    <div className="p-6 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="font-space font-semibold text-white text-base">{chart.title || 'Trend'}</h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            TIME SERIES TREND
          </span>
        </div>

        {/* SVG Curve */}
        <div className="w-full overflow-hidden my-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id={`grad-${chart.title || 'chart'}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {areaPoints && <polygon points={areaPoints} fill={`url(#grad-${chart.title || 'chart'})`} />}

            {polylineStr && (
              <polyline
                fill="none"
                stroke="#34D399"
                strokeWidth="2.5"
                points={polylineStr}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {points.map((pt, i) => {
              const [cx, cy] = pt.split(',');
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  className="fill-emerald-400 stroke-[#101113] stroke-2 hover:r-5 transition-all"
                >
                  <title>{`${labels[i] || ''}: ${vals[i].toLocaleString()}`}</title>
                </circle>
              );
            })}
          </svg>
        </div>

        <div className="flex justify-between text-[10px] font-mono text-[#92969E]">
          <span>{labels[0] || 'Start'}</span>
          <span>Temporal Aggregation</span>
          <span>{labels[labels.length - 1] || 'End'}</span>
        </div>
      </div>
      <div className="mt-6 pt-3 border-t border-white/5 text-[10px] font-mono text-[#92969E] flex justify-between">
        <span>Timeline: {chart.date_column || 'Date'}</span>
        <span>Metric: {chart.numeric_column || 'Value'}</span>
      </div>
    </div>
  );
};
