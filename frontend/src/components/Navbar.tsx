import React from 'react';
import { Cpu, Terminal, Shield, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onTerminalClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onTerminalClick }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 px-6 sm:px-10 py-5 transition-all duration-300 backdrop-blur-md bg-[#101113]/40 border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-[#202226] border border-white/10 flex items-center justify-center text-white/90 group-hover:border-white/30 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Cpu className="w-4 h-4 text-silver-light" />
          </div>
          <div className="flex flex-col">
            <span className="font-space font-bold text-lg tracking-wider text-white flex items-center gap-1.5">
              BYAnltiX
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
            </span>
            <span className="text-[9px] tracking-widest text-[#92969E] uppercase font-mono">
              NEURAL ANALYTICS ENGINE
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-mono tracking-wider text-[#92969E]">
          <a
            href="#quadrants"
            className="hover:text-white transition-colors duration-200"
          >
            [ 01 // ARCHITECTURE ]
          </a>
          <a
            href="#telemetry"
            className="hover:text-white transition-colors duration-200"
          >
            [ 02 // TELEMETRY ]
          </a>
          <a
            href="#specifications"
            className="hover:text-white transition-colors duration-200"
          >
            [ 03 // DECOMPOSITION ]
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onTerminalClick}
            className="hidden sm:flex items-center space-x-2 text-xs font-mono text-[#D9DADD] hover:text-white px-3 py-1.5 rounded-md bg-[#202226]/60 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <Terminal className="w-3.5 h-3.5 text-[#92969E]" />
            <span>CONSOLE</span>
          </button>

          <a
            href="#explore"
            className="flex items-center space-x-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-gradient-to-b from-[#2a2d34] to-[#1c1e23] text-white border border-white/15 hover:border-white/35 transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_24px_rgba(255,255,255,0.08)]"
          >
            <span>Access Platform</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-silver-light" />
          </a>
        </div>
      </div>
    </header>
  );
};
