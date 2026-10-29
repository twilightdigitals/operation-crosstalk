import React from 'react';
import type { MissionState } from '../services/gameEngine';
import { WireModule } from './WireModule';
import { GlyphModule } from './GlyphModule';
import { FrequencyModule } from './FrequencyModule';
import { MemoryModule } from './MemoryModule';
import { Volume2, VolumeX, ShieldAlert, Wifi, BatteryMedium, Tag } from 'lucide-react';
import { sound } from '../services/sound';

interface OperativeConsoleProps {
  state: MissionState;
  onCutWire: (index: number) => void;
  onPressGlyph: (glyph: string) => void;
  onChangeFrequency: (freq: number) => void;
  onLockFrequency: () => void;
  onPressMemoryButton: (pos: number, label: number) => void;
  isConnected: boolean;
  onRoleSwap?: () => void;
  isSingleDeviceMode?: boolean;
}

export const OperativeConsole: React.FC<OperativeConsoleProps> = ({
  state,
  onCutWire,
  onPressGlyph,
  onChangeFrequency,
  onLockFrequency,
  onPressMemoryButton,
  isConnected,
  onRoleSwap,
  isSingleDeviceMode,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const minutes = Math.floor(state.remainingSeconds / 60);
  const seconds = state.remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-zinc-950 text-zinc-100 flex flex-col p-4 pb-12 select-none">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <span className="font-bold tracking-widest text-zinc-300">OPERATIVE CONSOLE</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}`} />
            <span>{isConnected ? 'SYNCED' : 'OFFLINE'}</span>
          </div>
          <button
            onClick={handleToggleMute}
            className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main HUD: Countdown Timer & Strikes */}
      <div className="my-4 bg-zinc-900 border-2 border-zinc-700 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
        {/* Digital Countdown Timer */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">DETONATION TIMER</span>
          <div className="text-4xl font-mono font-black text-red-500 tracking-wider crt-glow-red">
            {formattedTime}
          </div>
        </div>

        {/* Strikes (X X X) */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase mb-1">STRIKES</span>
          <div className="flex items-center gap-2">
            {Array.from({ length: state.maxStrikes }).map((_, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all ${
                  i < state.strikes
                    ? 'bg-red-600/90 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-bounce'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-700'
                }`}
              >
                X
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chassis Hardware Badges */}
      <div className="grid grid-cols-3 gap-2 mb-4 font-mono text-[11px]">
        {/* Serial Number */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500">SERIAL NO.</span>
            <span className="font-bold text-zinc-200">{state.serialNumber}</span>
          </div>
        </div>

        {/* Battery Count */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center gap-1.5">
          <BatteryMedium className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500">BATTERY</span>
            <span className="font-bold text-zinc-200">{state.batteryCount} CELLS</span>
          </div>
        </div>

        {/* Indicator */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center gap-1.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              state.indicator.lit ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-zinc-700'
            }`}
          />
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500">INDICATOR</span>
            <span className="font-bold text-zinc-200">
              {state.indicator.label} {state.indicator.lit ? '(LIT)' : '(OFF)'}
            </span>
          </div>
        </div>
      </div>

      {/* Secret Warning Notice */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-2 mb-4 flex items-center gap-2 text-[11px] text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>DO NOT SHOW YOUR SCREEN! Describe what you see verbally to the Analyst.</span>
      </div>

      {/* 4 Interactive Puzzle Modules Grid */}
      <div className="flex flex-col gap-4">
        <WireModule
          state={state.modules.wires}
          onCutWire={onCutWire}
          disabled={state.status !== 'active'}
        />

        <GlyphModule
          state={state.modules.glyphs}
          onPressGlyph={onPressGlyph}
          disabled={state.status !== 'active'}
        />

        <FrequencyModule
          state={state.modules.frequency}
          onChangeFrequency={onChangeFrequency}
          onLockFrequency={onLockFrequency}
          disabled={state.status !== 'active'}
        />

        <MemoryModule
          state={state.modules.memory}
          onPressButton={onPressMemoryButton}
          disabled={state.status !== 'active'}
        />
      </div>

      {/* Quick Swap Role / Test Switcher */}
      {isSingleDeviceMode && onRoleSwap && (
        <div className="mt-8 pt-4 border-t border-zinc-800">
          <button
            onClick={onRoleSwap}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-xs font-mono text-zinc-300 font-bold"
          >
            SWITCH VIEW: SWITCH TO ANALYST MANUAL 📖
          </button>
        </div>
      )}
    </div>
  );
};
