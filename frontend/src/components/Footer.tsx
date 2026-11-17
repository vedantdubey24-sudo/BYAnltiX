import React from 'react';
import { Cpu, Terminal, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-30 w-full border-t border-white/[0.06] bg-[#0d0e10]/80 backdrop-blur-md py-12 px-6 sm:px-12 lg:px-20 text-xs font-mono text-[#92969E]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tag */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center space-x-2 text-white font-space font-bold tracking-wider text-sm">
            <Cpu className="w-4 h-4 text-silver-light" />
            <span>BYAnltiX</span>
          </div>
          <p className="text-[11px] text-[#92969E]">
            Where Data Reveals Its Insights.
          </p>
        </div>

        {/* System telemetry indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/5 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#D9DADD]">SYSTEM OPERATIONAL</span>
          <span className="text-white/20">|</span>
          <span className="text-[#92969E]">ALL 4 QUADRANTS SYNCHRONIZED</span>
        </div>

        {/* Back to top & copyright */}
        <div className="flex items-center space-x-6">
          <span>&copy; {new Date().getFullYear()} BYAnltiX Inc.</span>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-[#D9DADD] hover:text-white transition-colors"
          >
            <span>TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
