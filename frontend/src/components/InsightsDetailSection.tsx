import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Cpu,
  Binary,
  TrendingUp,
  Sparkles,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  Database,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface InsightsDetailSectionProps {
  scrollProgress: number; // 0 to 1
  selectedQuadrant: string | null;
  onSelectQuadrant: (id: string | null) => void;
}

const QUADRANT_DETAILS = [
  {
    id: 'upper-left',
    number: '01',
    name: 'Cognitive Synthesis',
    subname: 'Frontal-Parietal Cortex (L)',
    desc: 'High-throughput sensory and vector ingestion engine. Normalizes asynchronous telemetry streams and constructs foundational context graphs.',
    metrics: [
      { label: 'Ingestion Rate', value: '4.8 TB/s' },
      { label: 'Latency Overhead', value: '1.18 ms' },
      { label: 'Batch Coherence', value: '99.98%' },
    ],
    features: [
      'Multi-modal stream parsing',
      'Context attention window: 128k',
      'Dynamic schema inference',
      'Zero-loss ring buffer',
    ],
  },
  {
    id: 'upper-right',
    number: '02',
    name: 'Deep Pattern Recognition',
    subname: 'Frontal-Parietal Cortex (R)',
    desc: 'Latent space manifold projection. Identifies subtle non-linear topological signatures across millions of disparate data nodes.',
    metrics: [
      { label: 'Convergence Score', value: '99.84%' },
      { label: 'Tensor Precision', value: 'FP16 / INT8' },
      { label: 'Attention Heads', value: '512 Multi-Head' },
    ],
    features: [
      'High-dimensional PCA & UMAP',
      'Hypergraph cluster routing',
      'Spatial-temporal correlation',
      'Outlier isolation thresholding',
    ],
  },
  {
    id: 'lower-left',
    number: '03',
    name: 'Autonomous Inference',
    subname: 'Temporal-Occipital Lobe (L)',
    desc: 'Sub-millisecond decision engine executing probabilistic graph traversals and real-time deductive reasoning with continuous feedback loops.',
    metrics: [
      { label: 'Active Synapses', value: '1.4B Nodes' },
      { label: 'Traversal Speed', value: '48.2M edges/s' },
      { label: 'Entropy Bound', value: '0.0014' },
    ],
    features: [
      'Hebbian synaptic weighting',
      'Autonomous policy execution',
      'Dynamic memory retrieval',
      'Self-calibrating loss matrix',
    ],
  },
  {
    id: 'lower-right',
    number: '04',
    name: 'Probabilistic Insights',
    subname: 'Temporal-Occipital Lobe (R)',
    desc: 'Stochastic forecasting and counterfactual simulation. Translates complex tensor states into deterministic operational recommendations.',
    metrics: [
      { label: 'Monte Carlo Iterations', value: '100,000/s' },
      { label: 'Confidence Margin', value: '99.90%' },
      { label: 'Variance Floor', value: '< 0.003%' },
    ],
    features: [
      'Empirical risk quantification',
      'Counterfactual causal modeling',
      'Bayesian sensitivity sweep',
      'Explainable inference log',
    ],
  },
];

const SAMPLE_QUERIES = [
  'Detect multi-region enterprise supply-chain volatility anomaly',
  'Simulate high-frequency liquidity shocks and collateral drawdown',
  'Perform longitudinal genetic variant expression impact mapping',
];

export const InsightsDetailSection: React.FC<InsightsDetailSectionProps> = ({
  scrollProgress,
  selectedQuadrant,
  onSelectQuadrant,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'specs'>(
    'overview'
  );
  const [simQuery, setSimQuery] = useState(SAMPLE_QUERIES[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimStep(1);

    setTimeout(() => setSimStep(2), 600);
    setTimeout(() => setSimStep(3), 1300);
    setTimeout(() => {
      setSimStep(4);
      setIsSimulating(false);
    }, 2000);
  };

  // Only render when scrollProgress is substantial (e.g. > 0.70)
  const opacity = Math.min(1, Math.max(0, (scrollProgress - 0.72) / 0.18));
  if (opacity <= 0.01) return null;

  return (
    <section
      id="explore"
      className="relative z-30 min-h-screen w-full px-6 sm:px-12 lg:px-20 py-24 transition-opacity duration-500"
      style={{ opacity }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono tracking-widest text-[#92969E] uppercase mb-3">
              <Activity className="w-3.5 h-3.5 text-white/80" />
              <span>EXPLODED QUADRANT TELEMETRY</span>
            </div>
            <h2 className="font-space font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
              Cognitive Architecture
            </h2>
            <p className="font-sora text-sm sm:text-base text-[#92969E] mt-2 max-w-xl">
              Four specialized neural lobes working in parallel synchronization.
              Inspect live metrics or simulate high-dimensional queries.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-[#202226]/80 p-1 rounded-lg border border-white/10 font-mono text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === 'overview'
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-[#92969E] hover:text-white'
              }`}
            >
              [ 01 // OVERVIEW ]
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === 'simulator'
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-[#92969E] hover:text-white'
              }`}
            >
              [ 02 // SIMULATOR ]
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === 'specs'
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-[#92969E] hover:text-white'
              }`}
            >
              [ 03 // SPECS ]
            </button>
          </div>
        </div>

        {/* Tab 1: Quadrant Overview Grid */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {QUADRANT_DETAILS.map((quad) => {
              const isSelected = selectedQuadrant === quad.id;
              return (
                <div
                  key={quad.id}
                  onClick={() =>
                    onSelectQuadrant(isSelected ? null : quad.id)
                  }
                  className={`hud-panel rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-white/40 ring-1 ring-white/20 bg-[#252830]/80'
                      : 'hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#92969E] mb-3">
                      <span className="text-white/60 font-semibold tracking-wider">
                        {quad.number} // QUADRANT
                      </span>
                      <span className="w-2 h-2 rounded-full bg-white/40" />
                    </div>

                    <h3 className="font-space font-bold text-lg text-white">
                      {quad.name}
                    </h3>
                    <p className="text-xs font-mono text-silver-metallic mt-0.5">
                      {quad.subname}
                    </p>

                    <p className="text-xs text-[#92969E] mt-3 font-inter leading-relaxed">
                      {quad.desc}
                    </p>

                    <div className="mt-5 space-y-2.5 pt-4 border-t border-white/[0.08]">
                      {quad.metrics.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs font-mono"
                        >
                          <span className="text-[#92969E]">{m.label}</span>
                          <span className="text-white font-semibold">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.08]">
                    <div className="text-[10px] font-mono uppercase text-[#92969E] mb-2 tracking-wider">
                      CAPABILITIES
                    </div>
                    <ul className="space-y-1 text-xs text-[#D9DADD] font-inter">
                      {quad.features.slice(0, 2).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-silver-light shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Interactive Query Simulation */}
        {activeTab === 'simulator' && (
          <div className="mt-10 hud-panel rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-silver-light" />
                <span className="font-mono text-xs text-[#D9DADD] tracking-wider uppercase">
                  QUAD-LOBE SYNAPTIC INFERENCE SIMULATOR
                </span>
              </div>
              <span className="text-xs font-mono text-[#92969E]">
                STATUS: {isSimulating ? 'PROCESSING...' : 'READY'}
              </span>
            </div>

            {/* Prompt Selector */}
            <div className="space-y-3">
              <label className="text-xs font-mono text-[#92969E] uppercase tracking-wider block">
                Select or Enter Ingestion Stream:
              </label>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUERIES.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setSimQuery(query)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${
                      simQuery === query
                        ? 'bg-white/15 border-white/30 text-white'
                        : 'bg-[#202226]/60 border-white/5 text-[#92969E] hover:text-white'
                    }`}
                  >
                    Preset {index + 1}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <input
                  type="text"
                  value={simQuery}
                  onChange={(e) => setSimQuery(e.target.value)}
                  className="flex-1 bg-[#101113] border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="Enter complex multi-dimensional prompt..."
                />
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-white to-silver-light text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Execute Trace</span>
                </button>
              </div>
            </div>

            {/* Live Pipeline Flow Visualizer */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {QUADRANT_DETAILS.map((quad, idx) => {
                const isStepActive = simStep >= idx + 1;
                return (
                  <div
                    key={quad.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      isStepActive
                        ? 'bg-white/[0.08] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.06)]'
                        : 'bg-[#181a1f]/40 border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#92969E] mb-2">
                      <span>STEP 0{idx + 1}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isStepActive ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'
                        }`}
                      />
                    </div>
                    <div className="font-space font-semibold text-sm text-white">
                      {quad.name}
                    </div>
                    <div className="text-[11px] text-[#92969E] font-mono mt-1">
                      {isStepActive ? 'Synthesis Completed' : 'Awaiting Flow'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: System Specifications */}
        {activeTab === 'specs' && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="hud-panel rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
                <Database className="w-4 h-4 text-silver-light" />
                <span>Memory & Bandwidth</span>
              </div>
              <ul className="space-y-3 text-[#92969E]">
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>HBM3e Memory Pool</span>
                  <span className="text-white">192 GB</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Memory Bandwidth</span>
                  <span className="text-white">8.0 TB/s</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Interconnect Mesh</span>
                  <span className="text-white">NVLink 900 GB/s</span>
                </li>
                <li className="flex justify-between">
                  <span>Zero-Copy Transfer</span>
                  <span className="text-white">Enabled</span>
                </li>
              </ul>
            </div>

            <div className="hud-panel rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
                <Cpu className="w-4 h-4 text-silver-light" />
                <span>Compute Precision</span>
              </div>
              <ul className="space-y-3 text-[#92969E]">
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Tensor Precision</span>
                  <span className="text-white">FP8 / FP16 / BF16</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Sparse Acceleration</span>
                  <span className="text-white">2:4 Structured</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Attention Latency</span>
                  <span className="text-white">Sub-0.4ms</span>
                </li>
                <li className="flex justify-between">
                  <span>Quantization Error</span>
                  <span className="text-white">&lt; 0.002%</span>
                </li>
              </ul>
            </div>

            <div className="hud-panel rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
                <Lock className="w-4 h-4 text-silver-light" />
                <span>Security & Verification</span>
              </div>
              <ul className="space-y-3 text-[#92969E]">
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Zero-Knowledge Proofs</span>
                  <span className="text-white">zk-SNARKs v2</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Cryptographic Attestation</span>
                  <span className="text-white">Hardware Enclave</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Model Weight Provenance</span>
                  <span className="text-white">SHA-256 Merkle</span>
                </li>
                <li className="flex justify-between">
                  <span>Audit Trail</span>
                  <span className="text-white">Immutable Ledger</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
