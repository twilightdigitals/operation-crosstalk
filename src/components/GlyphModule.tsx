import React from 'react';
import type { GlyphModuleState } from '../services/gameEngine';
import { KeyRound, CheckCircle2 } from 'lucide-react';

interface GlyphModuleProps {
  state: GlyphModuleState;
  onPressGlyph: (glyph: string) => void;
  disabled?: boolean;
}

export const GlyphModule: React.FC<GlyphModuleProps> = ({ state, onPressGlyph, disabled }) => {
  return (
    <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">MOD 02: GLYPH MATRIX</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${state.solved ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-950 border border-red-800'}`} />
      </div>

      {/* 2x2 Keypad */}
      <div className="py-4 grid grid-cols-2 gap-3">
        {state.displayedGlyphs.map((glyph, index) => {
          const isPressed = state.pressedGlyphs.includes(glyph);
          return (
            <button
              key={index}
              disabled={isPressed || state.solved || disabled}
              onClick={() => onPressGlyph(glyph)}
              className={`h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-serif transition-all active:scale-95 shadow-lg select-none ${
                isPressed
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-800/90 border-zinc-600 text-amber-200 hover:border-amber-400 hover:bg-zinc-700/80'
              }`}
            >
              <span>{glyph}</span>
            </button>
          );
        })}
      </div>

      {/* Progress indicators */}
      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <div className="flex items-center gap-1.5">
          <span>SEQUENCE:</span>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < state.pressedGlyphs.length
                  ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>
        {state.solved && (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> UNLOCKED
          </span>
        )}
      </div>
    </div>
  );
};
