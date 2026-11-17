import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  X,
  ArrowRight,
  Loader2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';

interface DatasetUploadSectionProps {
  scrollProgress: number; // 0 to 1
}

interface UploadedFile {
  name: string;
  size: string;
  type: 'CSV' | 'EXCEL' | 'SPREADSHEET';
  rawFile: File;
}

export const DatasetUploadSection: React.FC<DatasetUploadSectionProps> = ({
  scrollProgress,
}) => {
  const {
    performAnalysis,
    isAnalyzing,
    error,
    clearError,
    setCurrentView,
    analysisData,
    backendConnected,
  } = useAnalytics();

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fade in smoothly as the user scrolls past 22%
  const opacity = Math.min(1, Math.max(0, (scrollProgress - 0.22) / 0.26));
  const translateY = Math.max(0, (1 - opacity) * 40);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFile = (selectedFile: File) => {
    clearError();
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    const type = ext === 'csv' ? 'CSV' : ext === 'xlsx' || ext === 'xls' ? 'EXCEL' : 'SPREADSHEET';

    setFile({
      name: selectedFile.name,
      size: formatFileSize(selectedFile.size),
      type,
      rawFile: selectedFile,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!file) return;
    const success = await performAnalysis(file.rawFile);
    if (success) {
      setCurrentView('dashboard');
    }
  };

  if (opacity <= 0.01) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 sm:p-6 pointer-events-none transition-all duration-500"
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: opacity > 0.4 ? 'auto' : 'none',
      }}
    >
      {/* Fullscreen Backdrop Blur & Dimming Overlay behind upload card */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-[#101113]/55 backdrop-blur-[8px] transition-opacity duration-500"
        style={{
          opacity,
        }}
      />

      <div className="w-full max-w-xl mx-auto flex flex-col items-center relative z-10">
        {/* Section Heading & Tagline */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-[#92969E] uppercase mb-3">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{backendConnected ? 'FastAPI Connected' : 'Checking Backend'}</span>
          </div>

          <h2 className="font-space font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight drop-shadow-[0_4px_24px_rgba(255,255,255,0.1)]">
            Let's figure out the insights.
          </h2>
          <p className="font-sora text-sm sm:text-base text-[#D9DADD] mt-2.5 max-w-md mx-auto">
            Upload your dataset and let BYAnltiX reveal what your data contains.
          </p>
        </div>

        {/* Upload Card */}
        <div className="w-full bg-[#16181b]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] relative overflow-hidden transition-all duration-300">
          {/* Subtle Top Border Glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Error Notification if any */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={clearError}
                className="p-0.5 hover:bg-rose-500/20 rounded text-rose-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!file ? (
            /* Drag and Drop Zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-white bg-white/5 scale-[1.01]'
                  : 'border-white/15 hover:border-white/35 bg-[#202226]/40 hover:bg-[#202226]/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#D9DADD] shadow-[0_0_24px_rgba(255,255,255,0.05)]">
                <Upload className="w-6 h-6 stroke-[1.75]" />
              </div>

              <h3 className="font-space font-medium text-base sm:text-lg text-white text-center">
                Drag &amp; drop your dataset here
              </h3>

              <p className="font-mono text-xs text-[#92969E] mt-2 tracking-wide text-center">
                CSV, XLSX or XLS · Maximum 25 MB
              </p>

              <button
                type="button"
                className="mt-6 px-6 py-2.5 rounded-lg bg-white text-[#101113] hover:bg-[#D9DADD] font-medium text-xs sm:text-sm tracking-wide transition-all shadow-[0_2px_16px_rgba(255,255,255,0.12)] active:scale-95"
              >
                Choose your dataset
              </button>
            </div>
          ) : (
            /* Selected File State */
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#202226]/70 border border-white/10">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 text-white">
                    <FileSpreadsheet className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-space font-medium text-sm text-white truncate max-w-[200px] sm:max-w-[260px]">
                        {file.name}
                      </p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#D9DADD] border border-white/10">
                        {file.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#92969E] mt-0.5 font-mono">{file.size}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    clearError();
                  }}
                  className="p-1.5 rounded-lg text-[#92969E] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Analysis Status & Action */}
              {analysisData ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-mono">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Analysis complete. {analysisData.profile.total_rows.toLocaleString()} records processed.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('dashboard')}
                    className="w-full py-3 rounded-xl bg-white text-[#101113] hover:bg-[#D9DADD] font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,255,255,0.18)]"
                  >
                    <span>View Data Insights</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleStartAnalysis}
                  className="w-full py-3 rounded-xl bg-white text-[#101113] hover:bg-[#D9DADD] disabled:opacity-70 font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,255,255,0.18)] active:scale-[0.99]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#101113]" />
                      <span>Uploading &amp; Analyzing Dataset...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Dataset</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
