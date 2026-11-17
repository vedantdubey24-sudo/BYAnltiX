import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Layers,
  Lightbulb,
  Info,
  Check,
} from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';

export const QualityView: React.FC = () => {
  const { analysisData } = useAnalytics();

  if (!analysisData || !analysisData.data_quality) {
    return (
      <div className="p-8 text-center text-[#92969E] font-mono text-xs">
        No data quality diagnostics available.
      </div>
    );
  }

  const { data_quality, profile } = analysisData;
  const missingPct = Number(data_quality.missing_percentage) || 0;
  const duplicatePct = Number(data_quality.duplicate_percentage) || 0;
  const completenessRate = Math.max(0, 100 - missingPct);

  // Directly match backend's quality.py response schema
  const missingValuesCols = data_quality.columns_with_missing_values || [];
  const emptyCols = data_quality.empty_columns || [];
  const constantCols = data_quality.constant_columns || [];
  const totalCols = profile?.total_columns ?? data_quality.total_columns ?? 0;

  const hasIssues =
    (data_quality.missing_cells || 0) > 0 ||
    (data_quality.duplicate_rows || 0) > 0 ||
    emptyCols.length > 0 ||
    constantCols.length > 0;

  const recommendations = data_quality.recommendations || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Quality Summary */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-[#92969E] uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-silver-light" />
              <span>Data Quality Diagnostics</span>
            </div>
            <h3 className="font-space font-bold text-2xl text-white">Dataset Integrity &amp; Health</h3>
            <p className="text-sm text-[#92969E] max-w-2xl font-sora">
              Comprehensive inspection of cell nullity, duplicate observations, structural anomalies, and validation recommendations.
            </p>
          </div>

          {/* Completeness Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#202226]/60 border border-white/10 flex-shrink-0">
            <div className="text-right">
              <div className="text-xs font-mono text-[#92969E] uppercase">Data Completeness</div>
              <div className="text-3xl font-space font-bold text-white tracking-tight">
                {completenessRate.toFixed(2)}%
              </div>
              <div className="text-[10px] text-[#92969E] font-mono mt-0.5">
                Non-null cell population
              </div>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-white/10 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full border-4 border-emerald-400"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${completenessRate >= 50 ? '100% 0%, 100% 100%, 0% 100%, 0% 0%' : '100% 0%'})`,
                  transform: `rotate(${(completenessRate / 100) * 360}deg)`,
                }}
              />
              <span className="text-xs font-mono font-bold text-white z-10">
                {Math.round(completenessRate)}%
              </span>
            </div>
          </div>
        </div>

        {/* Calculation Documentation Notice (as per Instruction 8) */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-start gap-2.5 text-xs text-[#92969E] font-mono">
          <Info className="w-4 h-4 text-[#D9DADD] flex-shrink-0 mt-0.5" />
          <span>
            <strong>Documented Metric:</strong> Data Completeness is calculated strictly as{' '}
            <code className="text-white">((total_cells - missing_cells) / total_cells) × 100</code>. No arbitrary subjective score is synthesized.
          </span>
        </div>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-mono text-[#92969E] uppercase mb-1">Missing Cells</div>
          <div className="text-2xl font-space font-bold text-white">
            {(data_quality.missing_cells ?? 0).toLocaleString()}
          </div>
          <div className="text-xs text-amber-400 font-mono mt-1">
            {missingPct.toFixed(2)}% of total matrix cells
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-mono text-[#92969E] uppercase mb-1">Duplicate Rows</div>
          <div className="text-2xl font-space font-bold text-white">
            {(data_quality.duplicate_rows ?? 0).toLocaleString()}
          </div>
          <div className="text-xs text-purple-400 font-mono mt-1">
            {duplicatePct.toFixed(2)}% of dataset rows
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-mono text-[#92969E] uppercase mb-1">Columns with Missing</div>
          <div className="text-2xl font-space font-bold text-white">
            {missingValuesCols.length}
          </div>
          <div className="text-xs text-[#92969E] font-mono mt-1">
            of {totalCols} columns affected
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl">
          <div className="text-xs font-mono text-[#92969E] uppercase mb-1">Empty / Constant Cols</div>
          <div className="text-2xl font-space font-bold text-white">
            {emptyCols.length + constantCols.length}
          </div>
          <div className="text-xs text-[#92969E] font-mono mt-1">
            {emptyCols.length} empty · {constantCols.length} constant
          </div>
        </div>
      </div>

      {/* Backend Actionable Recommendations */}
      <div className="p-6 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl">
        <h3 className="font-space font-medium text-white text-base mb-4 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Quality Recommendations</span>
        </h3>

        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-[#202226]/50 border border-white/5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-mono text-[#D9DADD]">{rec}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Dataset passed all structural checks with zero defects detected.</span>
          </div>
        )}
      </div>

      {/* Problematic Columns Details */}
      {hasIssues && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl">
            <h4 className="font-space font-medium text-sm text-white mb-3 flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-amber-400" />
              <span>Columns with Nulls ({missingValuesCols.length})</span>
            </h4>
            {missingValuesCols.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {missingValuesCols.map((col) => (
                  <span
                    key={col}
                    className="px-2.5 py-1 rounded bg-[#202226] text-xs font-mono text-[#D9DADD] border border-white/10"
                  >
                    {col}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> None detected
              </p>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl">
            <h4 className="font-space font-medium text-sm text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>Empty Columns ({emptyCols.length})</span>
            </h4>
            {emptyCols.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {emptyCols.map((col) => (
                  <span
                    key={col}
                    className="px-2.5 py-1 rounded bg-rose-500/10 text-xs font-mono text-rose-300 border border-rose-500/20"
                  >
                    {col}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> None detected
              </p>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl">
            <h4 className="font-space font-medium text-sm text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Constant Columns ({constantCols.length})</span>
            </h4>
            {constantCols.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {constantCols.map((col) => (
                  <span
                    key={col}
                    className="px-2.5 py-1 rounded bg-purple-500/10 text-xs font-mono text-purple-300 border border-purple-500/20"
                  >
                    {col}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> None detected
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
