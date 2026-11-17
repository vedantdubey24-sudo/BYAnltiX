import React from 'react';
import {
  Compass,
  FileText,
  Lightbulb,
  CheckCircle2,
  Info,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';

export const InsightsView: React.FC = () => {
  const { analysisData } = useAnalytics();

  if (!analysisData) {
    return (
      <div className="p-8 text-center text-[#92969E] font-mono text-xs">
        No analytical insights available.
      </div>
    );
  }

  const insights = analysisData.insights || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-[#92969E] uppercase">
              <Cpu className="w-3.5 h-3.5 text-silver-light" />
              <span>Rule-based Insights Engine</span>
            </div>
            <h3 className="font-space font-bold text-2xl text-white">Synthesized Analytical Insights</h3>
            <p className="text-sm text-[#92969E] max-w-2xl font-sora">
              Systematic structural inferences and pattern diagnostics derived deterministically from dataset characteristics.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#202226]/60 border border-white/10 text-right font-mono flex-shrink-0">
            <div className="text-xs text-[#92969E] uppercase">Generated Observations</div>
            <div className="text-3xl font-space font-bold text-white mt-0.5">
              {insights.length}
            </div>
          </div>
        </div>

        {/* Transparent Methodology Notice (Instruction 7) */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-start gap-2.5 text-xs text-[#92969E] font-mono">
          <Info className="w-4 h-4 text-[#D9DADD] flex-shrink-0 mt-0.5" />
          <span>
            <strong>Engine Methodology:</strong> Insights are generated using deterministic, rule-based algorithms evaluating dataset distributions, missingness ratios, cardinality, and column extrema. No black-box generative AI or probabilistic machine learning models are applied.
          </span>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#16181b]/80 border border-white/10 text-[#92969E] font-mono text-xs">
            No rule-based insights triggered for this dataset structure.
          </div>
        ) : (
          insights.map((insightText, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl flex items-start gap-4 hover:border-white/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white font-mono text-xs font-bold">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="space-y-1">
                <p className="font-mono text-sm text-[#D9DADD] leading-relaxed">
                  {insightText}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#92969E]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified from dataset calculations</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
