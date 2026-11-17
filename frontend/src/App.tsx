import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { BrainCanvas } from './components/BrainCanvas';
import { HeroOverlay } from './components/HeroOverlay';
import { DatasetUploadSection } from './components/DatasetUploadSection';
import { AboutModal } from './components/AboutModal';
import { AnalyticsProvider, useAnalytics } from './context/AnalyticsContext';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

gsap.registerPlugin(ScrollTrigger);

const LandingScreen: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorPixel, setCursorPixel] = useState({ x: -100, y: -100 });
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [selectedPillarIndex, setSelectedPillarIndex] = useState<number | null>(null);

  const { analysisData, setCurrentView } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLidClick = (index: number) => {
    setSelectedPillarIndex(index);
    setIsAboutOpen(true);
  };

  // Setup GSAP ScrollTrigger with smooth scrub
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.15,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Natural mouse movement listener with smooth boundary return
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
      setCursorPixel({ x: e.clientX, y: e.clientY });
      setIsCursorVisible(true);
    };

    const handleMouseLeave = () => {
      setMousePos({ x: 0, y: 0 });
      setIsCursorVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[165vh] bg-[#101113] text-white selection:bg-[#202226] selection:text-white overflow-x-hidden cursor-default"
    >
      {/* Background Repeating Micro-Square Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none bg-square-pattern z-0 opacity-90" />

      {/* Background Lighting & Atmospheric Radial Gradients */}
      <div className="fixed inset-0 pointer-events-none center-illumination z-0" />
      <div className="fixed inset-0 pointer-events-none cinematic-vignette z-0" />

      {/* Interactive Custom Ring Cursor */}
      {isCursorVisible && (
        <div
          className="fixed pointer-events-none z-50 w-7 h-7 rounded-full border border-white/60 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out hidden sm:flex items-center justify-center mix-blend-difference"
          style={{
            left: `${cursorPixel.x}px`,
            top: `${cursorPixel.y}px`,
          }}
        >
          <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
        </div>
      )}

      {/* Persistent Return to Dashboard Pill when analysis data exists */}
      {analysisData && (
        <div className="fixed top-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#16181b]/90 border border-white/20 text-white hover:border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md text-xs font-mono transition-all group active:scale-95"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Dashboard ({analysisData.filename})</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#92969E] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      )}

      {/* Central 3D Canvas with smooth blur defocus as upload section occurs */}
      <div
        className="fixed inset-0 pointer-events-auto transition-all duration-300"
        style={{
          filter: `blur(${Math.min(8, Math.max(0, (scrollProgress - 0.18) / 0.26) * 8)}px)`,
        }}
      >
        <BrainCanvas
          scrollProgress={scrollProgress}
          mousePos={mousePos}
          onLidClick={handleLidClick}
        />
      </div>

      {/* Initial Landing Screen: Brand Heading & Tagline */}
      <HeroOverlay scrollProgress={scrollProgress} />

      {/* Post-Scroll Screen: ONLY Dataset Upload for CSV / Excel Analysis */}
      <DatasetUploadSection scrollProgress={scrollProgress} />

      {/* About Us Dialog / Theory of BYAnltiX Platform */}
      <AboutModal
        isOpen={isAboutOpen}
        selectedPillarIndex={selectedPillarIndex}
        onClose={() => {
          setIsAboutOpen(false);
          setSelectedPillarIndex(null);
        }}
        onNavigateToUpload={() => {
          window.scrollTo({
            top: window.innerHeight * 0.75,
            behavior: 'smooth',
          });
        }}
      />
    </div>
  );
};

const MainContent: React.FC = () => {
  const { currentView, analysisData, resetSession } = useAnalytics();

  if (currentView === 'dashboard' && analysisData) {
    return (
      <ErrorBoundary onReset={resetSession} fallbackTitle="Dashboard Display Error">
        <DashboardLayout />
      </ErrorBoundary>
    );
  }

  return <LandingScreen />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Application Error">
      <AnalyticsProvider>
        <MainContent />
      </AnalyticsProvider>
    </ErrorBoundary>
  );
};

export default App;
