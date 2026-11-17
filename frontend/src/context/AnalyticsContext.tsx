import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatasetUploadResponse } from '../types/analytics';
import {
  uploadDataset,
  downloadPdfReport,
  downloadExcelReport,
  checkHealth,
  ApiError,
} from '../services/api';

export type DashboardTab =
  | 'overview'
  | 'quality'
  | 'analytics'
  | 'visualizations'
  | 'insights'
  | 'preview';

interface AnalyticsContextType {
  rawFile: File | null;
  analysisData: DatasetUploadResponse | null;
  isAnalyzing: boolean;
  isDownloadingPdf: boolean;
  isDownloadingExcel: boolean;
  error: string | null;
  backendConnected: boolean;
  activeTab: DashboardTab;
  currentView: 'landing' | 'dashboard';
  setRawFile: (file: File | null) => void;
  setActiveTab: (tab: DashboardTab) => void;
  setCurrentView: (view: 'landing' | 'dashboard') => void;
  clearError: () => void;
  performAnalysis: (file: File) => Promise<boolean>;
  downloadPdf: () => Promise<void>;
  downloadExcel: () => Promise<void>;
  resetSession: () => void;
  checkBackendConnection: () => Promise<boolean>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<DatasetUploadResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [currentView, setCurrentViewState] = useState<'landing' | 'dashboard'>('landing');

  const setCurrentView = (view: 'landing' | 'dashboard') => {
    setCurrentViewState(view);
    if (view === 'dashboard') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      const res = await checkHealth();
      const isHealthy = res.status === 'healthy';
      setBackendConnected(isHealthy);
      return isHealthy;
    } catch {
      setBackendConnected(false);
      return false;
    }
  };

  useEffect(() => {
    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  const performAnalysis = async (file: File): Promise<boolean> => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await uploadDataset(file);
      setRawFile(file);
      setAnalysisData(response);
      setBackendConnected(true);
      setCurrentView('dashboard');
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while analyzing the dataset.');
      }
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPdf = async () => {
    if (!rawFile) {
      setError('Original dataset file is not available in memory for report generation.');
      return;
    }
    setIsDownloadingPdf(true);
    setError(null);
    try {
      const baseName = rawFile.name.replace(/\.[^/.]+$/, '');
      await downloadPdfReport(rawFile, `${baseName}_BYAnltiX_Report.pdf`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to download PDF report.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const downloadExcel = async () => {
    if (!rawFile) {
      setError('Original dataset file is not available in memory for report generation.');
      return;
    }
    setIsDownloadingExcel(true);
    setError(null);
    try {
      const baseName = rawFile.name.replace(/\.[^/.]+$/, '');
      await downloadExcelReport(rawFile, `${baseName}_BYAnltiX_Analysis.xlsx`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to download Excel report.');
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const resetSession = () => {
    setRawFile(null);
    setAnalysisData(null);
    setError(null);
    setActiveTab('overview');
    setCurrentView('landing');
  };

  const clearError = () => setError(null);

  return (
    <AnalyticsContext.Provider
      value={{
        rawFile,
        analysisData,
        isAnalyzing,
        isDownloadingPdf,
        isDownloadingExcel,
        error,
        backendConnected,
        activeTab,
        currentView,
        setRawFile,
        setActiveTab,
        setCurrentView,
        clearError,
        performAnalysis,
        downloadPdf,
        downloadExcel,
        resetSession,
        checkBackendConnection,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
