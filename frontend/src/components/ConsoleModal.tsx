import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Minimize2, Check, CornerDownLeft } from 'lucide-react';

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scrollProgress: number;
}

export const ConsoleModal: React.FC<ConsoleModalProps> = ({
  isOpen,
  onClose,
  scrollProgress,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [logs, setLogs] = useState<string[]>([
    'BYAnltiX Neural Architecture Subsystem v4.2.1 [RELEASE]',
    'Type "help" for a list of available diagnostic commands.',
    'System status: ALL 4 QUADRANTS NORMAL. Synaptic mesh coherent.',
  ]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    const newLogs = [...logs, `> ${inputVal}`];

    if (cmd === 'help') {
      newLogs.push(
        'Available commands:',
        '  status       - Inspect state of 4 anatomical quadrants',
        '  telemetry    - Print real-time throughput and latency metrics',
        '  separation   - Check current 3D scroll explosion percentage',
        '  clear        - Clear console history',
        '  exit         - Close diagnostic console'
      );
    } else if (cmd === 'status') {
      newLogs.push(
        '[QUADRANT 01 // UPPER-LEFT]  : Frontal-Parietal Cortex (L) - NORMAL (4.8 TB/s)',
        '[QUADRANT 02 // UPPER-RIGHT] : Frontal-Parietal Cortex (R) - CONVERGED (99.84%)',
        '[QUADRANT 03 // LOWER-LEFT]  : Temporal-Occipital (L)    - ACTIVE (1.4B Synapses)',
        '[QUADRANT 04 // LOWER-RIGHT] : Temporal-Occipital (R)    - CALIBRATED (Variance < 0.003%)'
      );
    } else if (cmd === 'telemetry') {
      newLogs.push(
        `Real-time Ingestion: 4.8 TB/s | Mean Latency: 1.18ms | Precision: FP16`,
        `Memory Allocation: 192 GB HBM3e | Bus: NVLink 900 GB/s`
      );
    } else if (cmd === 'separation') {
      newLogs.push(
        `Current Scroll Separation Progress: ${(scrollProgress * 100).toFixed(1)}%`,
        scrollProgress < 0.2
          ? 'State: ASSEMBLED (Unified anatomical core)'
          : scrollProgress < 0.8
          ? 'State: DECONSTRUCTING (Quadrants separating in 3D coordinate space)'
          : 'State: FULLY SEPARATED (Exploded anatomical visualization locked)'
      );
    } else if (cmd === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (cmd === 'exit' || cmd === 'quit') {
      onClose();
      return;
    } else {
      newLogs.push(`Command not recognized: "${cmd}". Type "help" for syntax.`);
    }

    setLogs(newLogs);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#14161a] border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-mono flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1c1e24] border-b border-white/10 text-xs">
          <div className="flex items-center space-x-2 text-white">
            <Terminal className="w-4 h-4 text-silver-light" />
            <span className="font-semibold tracking-wider">
              BYAnltiX DIAGNOSTIC TERMINAL
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-[#92969E] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terminal Output */}
        <div className="p-4 h-72 overflow-y-auto text-xs text-[#D9DADD] space-y-1.5 bg-[#0f1013]/90">
          {logs.map((line, idx) => (
            <div
              key={idx}
              className={line.startsWith('>') ? 'text-white font-bold' : 'text-[#A6AAB3]'}
            >
              {line}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Terminal Input */}
        <form
          onSubmit={handleCommand}
          className="flex items-center px-4 py-3 bg-[#181a20] border-t border-white/10"
        >
          <span className="text-silver-light mr-2 text-xs">&gt;</span>
          <input
            type="text"
            autoFocus
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type command ('help', 'status', 'separation')..."
            className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder-[#92969E]/50 font-mono"
          />
          <button
            type="submit"
            className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
