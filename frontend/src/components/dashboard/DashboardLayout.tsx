import React from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  RotateCcw,
  LayoutDashboard,
  ShieldCheck,
  BarChart2,
  PieChart,
  Lightbulb,
  Table,
  Loader2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { useAnalytics, DashboardTab } from '../../context/AnalyticsContext';
import { OverviewView } from './OverviewView';
import { QualityView } from './QualityView';
import { AnalyticsView } from './AnalyticsView';
import { VisualizationsView } from './VisualizationsView';
import { InsightsView } from './InsightsView';
import { PreviewView } from './PreviewView';

interface TabItem {
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'overview', label: 'Overview & Profiling', icon: LayoutDashboard },
  { id: 'quality', label: 'Data Quality', icon: ShieldCheck },
  { id: 'analytics', label: 'Statistics', icon: BarChart2 },
  { id: 'visualizations', label: 'Visualizations', icon: PieChart },
  { id: 'insights', label: 'Analytical Insights', icon: Lightbulb },
  { id: 'preview', label: 'Data Preview', icon: Table },
];

export const DashboardLayout: React.FC = () => {
  const {
    rawFile,
    analysisData,
    activeTab,
    setActiveTab,
    setCurrentView,
    resetSession,
    downloadPdf,
    downloadExcel,
    isDownloadingPdf,
    isDownloadingExcel,
    error,
    clearError,
    backendConnected,
  } = useAnalytics();

  if (!analysisData) return null;

  return (
    <div className="min-h-screen bg-[#101113] text-white selection:bg-[#202226] selection:text-white relative pb-20">
      {/* Background Repeating Micro-Square Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none bg-square-pattern z-0 opacity-70" />
      <div className="fixed inset-0 pointer-events-none center-illumination z-0" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#101113]/85 border-b border-white/10 px-6 sm:px-10 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Active Dataset File */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className="p-2 rounded-lg bg-[#202226] border border-white/10 hover:border-white/30 text-[#D9DADD] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="Return to 3D Landing Page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing</span>
            </button>

            <div className="h-6 w-px bg-white/10" />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-space font-bold text-lg text-white tracking-wide">
                  BYAnltiX
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {backendConnected ? 'API Online' : 'Connecting...'}
                </span>
              </div>
              <p className="text-xs font-mono text-[#92969E] truncate max-w-xs sm:max-w-md">
                Dataset: <span className="text-white font-medium">{analysisData.filename}</span> (
                {analysisData.profile.total_rows.toLocaleString()} rows, {analysisData.profile.total_columns} cols)
              </p>
            </div>
          </div>

          {/* Action Downloads & Upload New Dataset */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* PDF Report Download */}
            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={downloadPdf}
              className="px-3.5 py-2 rounded-lg bg-[#202226] hover:bg-[#2a2d34] disabled:opacity-50 text-white border border-white/10 hover:border-white/20 text-xs font-mono transition-all flex items-center gap-2 shadow-sm"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {/* Excel Report Download */}
            <button
              type="button"
              disabled={isDownloadingExcel}
              onClick={downloadExcel}
              className="px-3.5 py-2 rounded-lg bg-[#202226] hover:bg-[#2a2d34] disabled:opacity-50 text-white border border-white/10 hover:border-white/20 text-xs font-mono transition-all flex items-center gap-2 shadow-sm"
            >
              {isDownloadingExcel ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{isDownloadingExcel ? 'Generating Excel...' : 'Download Excel'}</span>
            </button>

            {/* Reset / Upload New */}
            <button
              type="button"
              onClick={resetSession}
              className="px-3.5 py-2 rounded-lg bg-white text-[#101113] hover:bg-[#D9DADD] text-xs font-medium transition-all flex items-center gap-1.5 shadow-[0_2px_12px_rgba(255,255,255,0.1)] active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-medium border border-white/20 shadow-sm'
                    : 'text-[#92969E] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#92969E]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 pt-8 relative z-10">
        {/* Error notification banner if any */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="p-1 hover:bg-rose-500/20 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab View Rendering */}
        {activeTab === 'overview' && <OverviewView />}
        {activeTab === 'quality' && <QualityView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'visualizations' && <VisualizationsView />}
        {activeTab === 'insights' && <InsightsView />}
        {activeTab === 'preview' && <PreviewView />}
      </main>
    </div>
  );
};
