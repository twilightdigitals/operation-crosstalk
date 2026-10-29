import React, { useEffect, useRef } from 'react';
import type { FrequencyModuleState } from '../services/gameEngine';
import { Radio, CheckCircle2 } from 'lucide-react';

interface FrequencyModuleProps {
  state: FrequencyModuleState;
  onChangeFrequency: (freq: number) => void;
  onLockFrequency: () => void;
  disabled?: boolean;
}

export const FrequencyModule: React.FC<FrequencyModuleProps> = ({
  state,
  onChangeFrequency,
  onLockFrequency,
  disabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render animated oscilloscope sine wave
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint oscilloscope grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw sine wave
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = state.solved ? '#10b981' : '#06b6d4';
      ctx.shadowColor = state.solved ? 'rgba(16, 185, 129, 0.8)' : 'rgba(6, 182, 212, 0.8)';
      ctx.shadowBlur = 8;

      const midY = canvas.height / 2;
      const waveFreq = (state.currentFrequency / 100) * 0.05;
      const amplitude = 22;

      for (let x = 0; x < canvas.width; x++) {
        const y = midY + Math.sin(x * waveFreq + phase) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.08;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state.currentFrequency, state.solved]);

  return (
    <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">MOD 03: OSCILLOSCOPE</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${state.solved ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-950 border border-red-800'}`} />
      </div>

      {/* Oscilloscope Screen */}
      <div className="py-2 flex flex-col items-center">
        <div className="w-full bg-slate-950 border border-cyan-900/60 rounded-lg p-1.5 relative overflow-hidden shadow-inner">
          <canvas
            ref={canvasRef}
            width={280}
            height={70}
            className="w-full h-[70px] block"
          />
          <div className="absolute top-2 right-3 font-mono text-[11px] font-bold text-cyan-300 tracking-wider">
            {state.currentFrequency} <span className="text-[9px] text-cyan-600">MHz</span>
          </div>
        </div>

        {/* Slider & Lock Button */}
        <div className="w-full mt-3 flex flex-col gap-2">
          <input
            type="range"
            min={100}
            max={900}
            step={20}
            disabled={state.solved || disabled}
            value={state.currentFrequency}
            onChange={(e) => onChangeFrequency(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
          />

          <button
            disabled={state.solved || disabled}
            onClick={onLockFrequency}
            className={`w-full py-2 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all active:scale-95 border ${
              state.solved
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-400'
                : 'bg-cyan-950/80 border-cyan-500 text-cyan-200 hover:bg-cyan-900'
            }`}
          >
            {state.solved ? 'FREQUENCY LOCKED' : 'TRANSMIT SIGNAL'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>BAND STATUS:</span>
        {state.solved ? (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> RESONANCE REACHED
          </span>
        ) : (
          <span className="text-cyan-400">TUNING REQUIRED</span>
        )}
      </div>
    </div>
  );
};
