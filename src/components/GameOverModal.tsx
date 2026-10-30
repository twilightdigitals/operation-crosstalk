import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { MissionState } from '../services/gameEngine';
import { Trophy, Skull, RefreshCw, Repeat, Clock, AlertOctagon } from 'lucide-react';
import { sound } from '../services/sound';

interface GameOverModalProps {
  state: MissionState;
  onPlayAgain: (swapRoles: boolean) => void;
  onReturnToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  state,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const isVictory = state.status === 'victory';

  useEffect(() => {
    if (isVictory) {
      sound.victory();
      // Burst confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#38bdf8'],
      });
    } else if (state.status === 'detonated') {
      sound.explode();
    }
  }, [isVictory, state.status]);

  const timeUsed = state.totalTimeSeconds - state.remainingSeconds;
  const minutesUsed = Math.floor(timeUsed / 60);
  const secondsUsed = timeUsed % 60;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none overflow-hidden">
      {/* Dramatic Explosion Shockwave Flash */}
      {!isVictory && (
        <div className="absolute inset-0 blast-flash pointer-events-none z-10" />
      )}

      <div className={`w-full max-w-sm rounded-2xl border-2 p-6 flex flex-col items-center text-center shadow-2xl relative z-20 ${
        isVictory
          ? 'bg-zinc-950 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
          : 'bg-zinc-950 border-red-600/80 shadow-[0_0_40px_rgba(239,68,68,0.7)] detonation-shake'
      }`}>
        {/* Big Icon */}
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 border-2 ${
          isVictory
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
            : 'bg-red-950/80 border-red-600 text-red-500 animate-pulse'
        }`}>
          {isVictory ? <Trophy className="w-10 h-10" /> : <Skull className="w-10 h-10" />}
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-black tracking-widest uppercase mb-1 ${
          isVictory ? 'text-emerald-400 crt-glow' : 'text-red-500 crt-glow-red'
        }`}>
          {isVictory ? 'MISSION DEFUSED!' : 'DEVICE DETONATED!'}
        </h2>
        <p className="text-xs text-zinc-400 mb-6 font-sans">
          {isVictory
            ? 'Incredible teamwork! You communicated like seasoned secret agents.'
            : state.strikes >= state.maxStrikes
            ? 'Too many strikes triggered catastrophic failsafe detonation!'
            : 'Time expired before all protocols were synchronized!'}
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 mb-6 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> TIME TAKEN
            </span>
            <span className="text-lg font-bold text-zinc-200 mt-1">
              {minutesUsed}m {secondsUsed}s
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <AlertOctagon className="w-3 h-3 text-red-400" /> STRIKES
            </span>
            <span className="text-lg font-bold text-zinc-200 mt-1">
              {state.strikes} / {state.maxStrikes}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => onPlayAgain(true)}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
          >
            <Repeat className="w-4 h-4" />
            <span>SWAP ROLES & PLAY AGAIN</span>
          </button>

          <button
            onClick={() => onPlayAgain(false)}
            className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>PLAY AGAIN (SAME ROLES)</span>
          </button>

          <button
            onClick={onReturnToLobby}
            className="w-full py-2.5 px-4 rounded-xl text-zinc-500 hover:text-zinc-300 text-[11px] font-bold transition-all"
          >
            RETURN TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
