import React, { useEffect } from 'react';
import {
  X,
  Database,
  Cpu,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUpload?: () => void;
  selectedPillarIndex?: number | null;
}

const CAPABILITIES = [
  {
    step: '01',
    title: 'Universal Dataset Analysis',
    desc: 'Supports any structured tabular data through automatic detection of columns, data types, and dataset characteristics without relying on predefined column schemas.',
    icon: Database,
  },
  {
    step: '02',
    title: 'Automated Data Profiling',
    desc: 'Examines datasets comprehensively to determine dimensions, data types, distinct values, null records, distributions, and essential statistical summaries.',
    icon: Cpu,
  },
  {
    step: '03',
    title: 'Data Quality Assessment',
    desc: 'Pinpoints missing values, duplicate entries, constant zero-variance columns, and outliers to provide an accurate health score for data reliability.',
    icon: ShieldCheck,
  },
  {
    step: '04',
    title: 'Dynamic Data Analytics',
    desc: 'Executes mathematical, categorical, and temporal statistical operations to uncover underlying patterns, correlations, and emerging trajectories.',
    icon: TrendingUp,
  },
  {
    step: '05',
    title: 'Interactive Data Visualization',
    desc: 'Translates raw computational metrics into intuitive high-definition visual charts including frequency histograms, comparative bar charts, and distribution plots.',
    icon: BarChart3,
  },
  {
    step: '06',
    title: 'Intelligent Insights',
    desc: 'Synthesizes observations and key anomalies into natural-language analytical takeaways that guide decision-making without manual formula crafting.',
    icon: Sparkles,
  },
];

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onNavigateToUpload,
  selectedPillarIndex,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-300">
      {/* Fullscreen Backdrop Blur & Dim */}
      <div
        className="fixed inset-0 bg-[#0c0d0f]/80 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Window */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#14161a]/95 border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col z-10 transition-all">
        {/* Subtle Top Specular Ambient Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-white/5 flex-shrink-0">
          <div className="flex flex-col items-start gap-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-widest uppercase text-[#92969E]">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
              Platform Overview
            </div>
            <h2 className="font-space font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
              About BYAnltiX
            </h2>
            <p className="font-sora text-xs sm:text-sm text-[#92969E] tracking-wide">
              Where Data Reveals Its Insights.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer group active:scale-95"
          >
            <X className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 sm:pt-6 space-y-8 flex-1 text-left custom-scrollbar">
          {/* Main Introduction */}
          <div className="space-y-4 font-sora font-light text-sm sm:text-base leading-relaxed text-[#D9DADD]">
            <p>
              <strong className="text-white font-medium">BYAnltiX</strong> is a
              Universal Data Analytics and Report Generation Platform developed
              to simplify the process of understanding, analysing and
              interpreting datasets. It provides users with a unified
              environment where raw data can be transformed into meaningful
              information through automated data processing, statistical
              analysis, data visualization and intelligent insights.
            </p>
            <p className="text-[#92969E]">
              The platform is designed to make data analytics accessible,
              efficient and understandable, even for users who do not have
              advanced technical or programming knowledge. Users can upload
              datasets in CSV, XLSX and XLS formats, after which BYAnltiX
              automatically examines the dataset, identifies its structure,
              evaluates data quality and performs relevant analytical operations.
            </p>
          </div>

          {/* Our Purpose Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#1a1d22]/70 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-white/80 to-white/20" />
            <h3 className="font-space font-bold text-lg sm:text-xl text-white tracking-tight mb-2.5">
              Our Purpose
            </h3>
            <p className="font-sora font-light text-sm sm:text-base text-[#D9DADD] leading-relaxed">
              The primary purpose of BYAnltiX is to reduce the complexity of
              traditional data analysis by automating repetitive analytical tasks
              and presenting results in a clear and understandable format.
            </p>
            <p className="font-sora font-light text-xs sm:text-sm text-[#92969E] mt-3">
              Instead of manually examining records, calculating statistics and
              creating visualizations, users can upload their datasets and allow
              the platform to generate analytical summaries, graphical
              representations, observations and downloadable reports.
            </p>
          </div>

          {/* 6 Capabilities Grid */}
          <div>
            <h3 className="font-space font-bold text-lg sm:text-xl text-white tracking-tight mb-5 flex items-center gap-2.5">
              <span>What BYAnltiX Offers</span>
              <span className="text-xs font-mono text-[#92969E] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                6 Core Pillars
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CAPABILITIES.map((cap, idx) => {
                const IconComponent = cap.icon;
                const isSelected = selectedPillarIndex === idx;

                return (
                  <div
                    key={cap.step}
                    className={`p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-[#1e222a] border-white/50 ring-1 ring-white/30 shadow-[0_0_24px_rgba(255,255,255,0.08)]'
                        : 'bg-[#181a1f]/80 border-white/10 hover:border-white/25 hover:bg-[#1c1f26]/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105 ${
                            isSelected
                              ? 'bg-white text-[#101113] border-white'
                              : 'bg-white/5 border-white/10 text-white'
                          }`}
                        >
                          <IconComponent className="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="font-mono text-[10px] text-white px-2 py-0.5 rounded-full bg-white/15 border border-white/25 tracking-widest uppercase animate-pulse">
                              Active Pillar
                            </span>
                          )}
                          <span className="font-mono text-xs text-[#92969E]">
                            {cap.step}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-space font-semibold text-base text-white mb-1.5">
                        {cap.title}
                      </h4>
                      <p className="font-sora text-xs sm:text-[13px] text-[#92969E] leading-relaxed">
                        {cap.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supported Formats Banner */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <FileSpreadsheet className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <p className="font-space font-medium text-sm text-white">
                  Universal File Ingestion
                </p>
                <p className="font-mono text-xs text-[#92969E]">
                  Supports .csv, .xlsx, and .xls structured data files up to 25 MB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-white">
                CSV
              </span>
              <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-white">
                XLSX
              </span>
              <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-white">
                XLS
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer with Action Buttons */}
        <div className="p-5 sm:p-6 sm:py-5 border-t border-white/5 bg-[#101113]/90 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-white/15 hover:border-white/30 text-xs sm:text-sm font-space text-[#D9DADD] hover:text-white transition-all cursor-pointer"
          >
            Close Overview
          </button>

          {onNavigateToUpload && (
            <button
              onClick={() => {
                onClose();
                onNavigateToUpload();
              }}
              className="px-6 py-2.5 rounded-lg bg-white hover:bg-[#D9DADD] text-[#101113] font-space font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Analyze Your Dataset</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
