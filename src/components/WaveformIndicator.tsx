import React from 'react';

interface WaveformIndicatorProps {
  isListening: boolean;
  color?: string;
  barCount?: number;
}

export const WaveformIndicator: React.FC<WaveformIndicatorProps> = ({
  isListening,
  barCount = 14,
}) => {
  if (!isListening) {
    return (
      <div className="flex items-center justify-center space-x-1.5 h-10 px-4 py-2 bg-slate-100/70 rounded-full border border-slate-200/60">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
          Microphone standby
        </span>
      </div>
    );
  }

  // Pre-configured dynamic heights for a lively voice spectrum
  const delays = [
    '0.1s', '0.25s', '0.05s', '0.35s', '0.15s', '0.3s', '0.45s',
    '0.2s', '0.4s', '0.1s', '0.3s', '0.15s', '0.25s', '0.05s',
  ];

  return (
    <div
      className="flex items-center justify-center space-x-1 h-10 px-4 py-1.5 bg-indigo-950/80 backdrop-blur-md rounded-full border border-indigo-400/30 shadow-lg shadow-indigo-500/20"
      aria-label="Active voice recording waveform"
    >
      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-2 shrink-0" />
      <span className="text-[11px] font-bold text-indigo-200 mr-2 uppercase tracking-wider hidden sm:inline">
        Live Voice
      </span>
      <div className="flex items-center space-x-1">
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-indigo-400 via-violet-300 to-cyan-300 shadow-xs"
            style={{
              animation: `wave-bar ${0.6 + (i % 5) * 0.2}s ease-in-out infinite alternate ${delays[i % delays.length]}`,
              minHeight: '6px',
            }}
          />
        ))}
      </div>
    </div>
  );
};
