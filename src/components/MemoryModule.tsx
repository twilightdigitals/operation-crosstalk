import React from 'react';
import type { MemoryModuleState } from '../services/gameEngine';
import { Cpu, CheckCircle2 } from 'lucide-react';

interface MemoryModuleProps {
  state: MemoryModuleState;
  onPressButton: (position: number, label: number) => void;
  disabled?: boolean;
}

export const MemoryModule: React.FC<MemoryModuleProps> = ({ state, onPressButton, disabled }) => {
  const currentStageData = state.stages[state.currentStage] || state.stages[0];

  return (
    <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">MOD 04: MEMORY CORE</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${state.solved ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-950 border border-red-800'}`} />
      </div>

      {/* Main Display & Stages */}
      <div className="py-3 flex flex-col items-center gap-3">
        {/* Stage LEDs */}
        <div className="flex items-center gap-3">
          {state.stages.map((_, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-[9px] text-zinc-500 font-mono">S{idx + 1}</span>
              <div
                className={`w-2.5 h-2.5 rounded-full border ${
                  idx < state.currentStage || state.solved
                    ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_6px_#34d399]'
                    : idx === state.currentStage
                    ? 'bg-amber-400 border-amber-200 animate-pulse'
                    : 'bg-zinc-800 border-zinc-700'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Big Phosphor CRT Display */}
        <div className="w-24 h-16 bg-slate-950 border-2 border-purple-900/60 rounded-lg flex items-center justify-center shadow-inner relative">
          <span className="font-mono text-4xl font-bold text-purple-300 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]">
            {state.solved ? '-' : currentStageData.displayDigit}
          </span>
          <div className="absolute top-1 left-2 text-[8px] text-purple-600 font-mono">DISP</div>
        </div>

        {/* 4 Numbered Buttons (position 1 to 4) */}
        <div className="grid grid-cols-4 gap-2 w-full pt-1">
          {currentStageData.buttonLabels.map((label, index) => {
            const position = index + 1; // 1-indexed
            return (
              <button
                key={index}
                disabled={state.solved || disabled}
                onClick={() => onPressButton(position, label)}
                className="h-12 bg-zinc-800/90 border border-zinc-600 hover:border-purple-400 active:scale-95 rounded-lg flex flex-col items-center justify-center font-mono transition-all shadow-md group"
              >
                <span className="text-xl font-bold text-zinc-100 group-hover:text-purple-300">{label}</span>
                <span className="text-[8px] text-zinc-500 font-mono">P{position}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>BUFFER:</span>
        {state.solved ? (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> SEQUENCE STORED
          </span>
        ) : (
          <span className="text-purple-400">STAGE {state.currentStage + 1} OF {state.stages.length}</span>
        )}
      </div>
    </div>
  );
};
