import React from 'react';
import type { WireModuleState, WireColor } from '../services/gameEngine';
import { CheckCircle2, Scissors } from 'lucide-react';

interface WireModuleProps {
  state: WireModuleState;
  onCutWire: (index: number) => void;
  disabled?: boolean;
}

const WIRE_COLORS: Record<WireColor, { bg: string; border: string; glow: string }> = {
  red: { bg: 'bg-red-600', border: 'border-red-400', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.7)]' },
  blue: { bg: 'bg-blue-600', border: 'border-blue-400', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.7)]' },
  yellow: { bg: 'bg-amber-400', border: 'border-amber-200', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.7)]' },
  white: { bg: 'bg-slate-200', border: 'border-white', glow: 'shadow-[0_0_12px_rgba(255,255,255,0.7)]' },
  black: { bg: 'bg-zinc-800', border: 'border-zinc-600', glow: 'shadow-[0_0_12px_rgba(0,0,0,0.8)]' },
};

export const WireModule: React.FC<WireModuleProps> = ({ state, onCutWire, disabled }) => {
  return (
    <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
      {/* Module Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">MOD 01: WIRE LOOM</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${state.solved ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-950 border border-red-800'}`} />
      </div>

      {/* Wires display */}
      <div className="py-4 flex flex-col gap-3">
        {state.wires.map((color, index) => {
          const isCut = state.cutWires[index];
          const style = WIRE_COLORS[color];

          return (
            <div key={index} className="flex items-center justify-between group">
              <span className="text-[10px] text-zinc-500 font-mono w-4">{index + 1}</span>
              
              {/* Wire line */}
              <button
                disabled={isCut || state.solved || disabled}
                onClick={() => onCutWire(index)}
                className={`relative flex-1 h-6 mx-2 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center ${
                  isCut ? 'opacity-30 cursor-not-allowed' : 'hover:brightness-125'
                }`}
              >
                {/* Visual Wire Tube */}
                <div className={`w-full h-3 rounded-full border ${style.bg} ${style.border} ${style.glow} flex items-center justify-center relative`}>
                  {isCut ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-zinc-950 rounded-full border border-red-500/50 flex items-center justify-center">
                        <span className="text-[9px] text-red-500 font-bold">X</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold tracking-wider text-black/70 uppercase">
                      {color}
                    </span>
                  )}
                </div>
              </button>

              <span className="text-[10px] text-zinc-600 font-mono w-6 text-right">
                {isCut ? 'CUT' : 'LIVE'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Module Footer Status */}
      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>STATUS:</span>
        {state.solved ? (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> DISARMED
          </span>
        ) : (
          <span className="text-amber-500 font-bold animate-pulse">HOT CURRENT</span>
        )}
      </div>
    </div>
  );
};
