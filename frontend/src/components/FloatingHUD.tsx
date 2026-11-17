import React from 'react';
import {
  Layers,
  Activity,
  Binary,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface FloatingHUDProps {
  scrollProgress: number; // 0 to 1
  onSelectQuadrant?: (quadrantId: string) => void;
}

export const FloatingHUD: React.FC<FloatingHUDProps> = ({
  scrollProgress,
  onSelectQuadrant,
}) => {
  // Fade in starts around scrollProgress 0.22, reaches full opacity at 0.55
  // and stays visible until 0.95
  let opacity = 0;
  if (scrollProgress >= 0.22 && scrollProgress <= 0.88) {
    if (scrollProgress < 0.45) {
      opacity = (scrollProgress - 0.22) / 0.23;
    } else if (scrollProgress > 0.8) {
      opacity = Math.max(0, 1 - (scrollProgress - 0.8) / 0.08);
    } else {
      opacity = 1;
    }
  } else if (scrollProgress > 0.88) {
    opacity = 0;
  }

  // Expansion offset for floating HUD elements
  const expansionFactor = Math.min(1, Math.max(0, (scrollProgress - 0.25) / 0.45));
  const translateX = expansionFactor * 24;
  const translateY = expansionFactor * 16;

  if (opacity <= 0.01) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-300"
      style={{ opacity }}
    >
      {/* SVG Connecting Hairline Callouts */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="silverLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
          </linearGradient>
        </defs>

        {/* Top-Left Callout Line */}
        <polyline
          points="280,180 360,240 440,290"
          stroke="url(#silverLineGrad)"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
          className="hidden lg:block opacity-60"
        />

        {/* Top-Right Callout Line */}
        <polyline
          points="calc(100% - 280),180 calc(100% - 360),240 calc(100% - 440),290"
          stroke="url(#silverLineGrad)"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
          className="hidden lg:block opacity-60"
        />

        {/* Bottom-Left Callout Line */}
        <polyline
          points="280,calc(100% - 180) 360,calc(100% - 240) 440,calc(100% - 290)"
          stroke="url(#silverLineGrad)"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
          className="hidden lg:block opacity-60"
        />

        {/* Bottom-Right Callout Line */}
        <polyline
          points="calc(100% - 280),calc(100% - 180) calc(100% - 360),calc(100% - 240) calc(100% - 440),calc(100% - 290)"
          stroke="url(#silverLineGrad)"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
          className="hidden lg:block opacity-60"
        />
      </svg>

      {/* 1. UPPER-LEFT HUD CARD: Cognitive Synthesis */}
      <div
        className="absolute top-24 sm:top-28 left-6 sm:left-12 lg:left-20 max-w-[290px] sm:max-w-xs pointer-events-auto transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${-translateX}px, ${-translateY}px)`,
        }}
        onClick={() => onSelectQuadrant?.('upper-left')}
      >
        <div className="hud-panel rounded-xl p-4 sm:p-5 border border-white/10 text-white cursor-pointer group">
          <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
            <span className="text-[10px] font-mono tracking-widest text-[#92969E] uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              01 // UPPER-LEFT
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-silver-light">
              OPTIMIZED
            </span>
          </div>

          <h3 className="font-space font-semibold text-sm sm:text-base text-white tracking-wide flex items-center gap-2 group-hover:text-silver-light transition-colors">
            <Layers className="w-4 h-4 text-silver-metallic" />
            Cognitive Synthesis
          </h3>

          <p className="text-xs text-[#92969E] mt-1 font-inter">
            Frontal-Parietal cortex orchestrating continuous multi-modal data streams.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06] font-mono">
            <div>
              <div className="text-[10px] text-[#92969E]">THROUGHPUT</div>
              <div className="text-xs sm:text-sm text-white font-semibold flex items-center gap-1">
                4.8 TB/s
                <Zap className="w-3 h-3 text-silver-light" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#92969E]">INFERENCE</div>
              <div className="text-xs sm:text-sm text-white font-semibold">1.2ms</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. UPPER-RIGHT HUD CARD: Deep Pattern Recognition */}
      <div
        className="absolute top-24 sm:top-28 right-6 sm:right-12 lg:right-20 max-w-[290px] sm:max-w-xs pointer-events-auto transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${translateX}px, ${-translateY}px)`,
        }}
        onClick={() => onSelectQuadrant?.('upper-right')}
      >
        <div className="hud-panel rounded-xl p-4 sm:p-5 border border-white/10 text-white cursor-pointer group">
          <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
            <span className="text-[10px] font-mono tracking-widest text-[#92969E] uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              02 // UPPER-RIGHT
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-silver-light">
              CONVERGED
            </span>
          </div>

          <h3 className="font-space font-semibold text-sm sm:text-base text-white tracking-wide flex items-center gap-2 group-hover:text-silver-light transition-colors">
            <Binary className="w-4 h-4 text-silver-metallic" />
            Pattern Recognition
          </h3>

          <p className="text-xs text-[#92969E] mt-1 font-inter">
            High-dimensional manifold projection detecting latent correlation matrices.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06] font-mono">
            <div>
              <div className="text-[10px] text-[#92969E]">CONVERGENCE</div>
              <div className="text-xs sm:text-sm text-white font-semibold">99.84%</div>
            </div>
            <div>
              <div className="text-[10px] text-[#92969E]">ATTENTION</div>
              <div className="text-xs sm:text-sm text-white font-semibold">512 Heads</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER-LEFT HUD CARD: Autonomous Inference */}
      <div
        className="absolute bottom-16 sm:bottom-20 left-6 sm:left-12 lg:left-20 max-w-[290px] sm:max-w-xs pointer-events-auto transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${-translateX}px, ${translateY}px)`,
        }}
        onClick={() => onSelectQuadrant?.('lower-left')}
      >
        <div className="hud-panel rounded-xl p-4 sm:p-5 border border-white/10 text-white cursor-pointer group">
          <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
            <span className="text-[10px] font-mono tracking-widest text-[#92969E] uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              03 // LOWER-LEFT
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-silver-light">
              ACTIVE
            </span>
          </div>

          <h3 className="font-space font-semibold text-sm sm:text-base text-white tracking-wide flex items-center gap-2 group-hover:text-silver-light transition-colors">
            <Cpu className="w-4 h-4 text-silver-metallic" />
            Autonomous Inference
          </h3>

          <p className="text-xs text-[#92969E] mt-1 font-inter">
            Temporal lobe semantic memory executing sub-millisecond adaptive heuristics.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06] font-mono">
            <div>
              <div className="text-[10px] text-[#92969E]">SYNAPSES</div>
              <div className="text-xs sm:text-sm text-white font-semibold">1.4B Active</div>
            </div>
            <div>
              <div className="text-[10px] text-[#92969E]">GRAPH TRAVERSAL</div>
              <div className="text-xs sm:text-sm text-white font-semibold">48M/sec</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LOWER-RIGHT HUD CARD: Probabilistic Insights */}
      <div
        className="absolute bottom-16 sm:bottom-20 right-6 sm:right-12 lg:right-20 max-w-[290px] sm:max-w-xs pointer-events-auto transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${translateX}px, ${translateY}px)`,
        }}
        onClick={() => onSelectQuadrant?.('lower-right')}
      >
        <div className="hud-panel rounded-xl p-4 sm:p-5 border border-white/10 text-white cursor-pointer group">
          <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
            <span className="text-[10px] font-mono tracking-widest text-[#92969E] uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              04 // LOWER-RIGHT
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-silver-light">
              CALIBRATED
            </span>
          </div>

          <h3 className="font-space font-semibold text-sm sm:text-base text-white tracking-wide flex items-center gap-2 group-hover:text-silver-light transition-colors">
            <TrendingUp className="w-4 h-4 text-silver-metallic" />
            Probabilistic Insights
          </h3>

          <p className="text-xs text-[#92969E] mt-1 font-inter">
            Occipital-cerebellar stochastic modeling establishing confidence intervals.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06] font-mono">
            <div>
              <div className="text-[10px] text-[#92969E]">CONFIDENCE</div>
              <div className="text-xs sm:text-sm text-white font-semibold">99.9%</div>
            </div>
            <div>
              <div className="text-[10px] text-[#92969E]">VARIANCE FLOOR</div>
              <div className="text-xs sm:text-sm text-white font-semibold">&lt; 0.003%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
