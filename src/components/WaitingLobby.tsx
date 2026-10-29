import React from 'react';
import type { GameRole } from '../services/p2p';
import { Radio, Users, Copy, Check, ArrowLeft } from 'lucide-react';

interface WaitingLobbyProps {
  roomCode: string;
  role: GameRole;
  timerMinutes: number;
  onCancel: () => void;
}

export const WaitingLobby: React.FC<WaitingLobbyProps> = ({
  roomCode,
  role,
  timerMinutes,
  onCancel,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 select-none font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>CANCEL</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-amber-400">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span>BROADCASTING</span>
        </div>
      </div>

      {/* Main Waiting Card */}
      <div className="my-auto bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-amber-950/60 border-2 border-amber-500/50 flex items-center justify-center mb-4 relative">
          <Radio className="w-10 h-10 text-amber-400 animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping" />
        </div>

        <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-1">
          ROOM CODE
        </span>
        <div
          onClick={handleCopy}
          className="cursor-pointer group flex items-center gap-3 bg-zinc-950 border-2 border-amber-500/80 rounded-2xl px-6 py-3 my-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 transition-all"
        >
          <span className="text-4xl font-black text-amber-300 tracking-widest crt-glow-amber">
            {roomCode}
          </span>
          {copied ? (
            <Check className="w-5 h-5 text-emerald-400" />
          ) : (
            <Copy className="w-5 h-5 text-zinc-500 group-hover:text-amber-300 transition-colors" />
          )}
        </div>
        <span className="text-[10px] text-zinc-500 mb-6">
          Tell your partner to enter this code on their phone
        </span>

        {/* Sync Status Banner */}
        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> YOUR ASSIGNED ROLE:
            </span>
            <span className="font-bold text-zinc-100 uppercase">
              {role === 'operative' ? '🕹️ Operative (Device)' : '📖 Analyst (Manual)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/80">
            <span className="text-zinc-400">MISSION TIMER:</span>
            <span className="font-bold text-amber-400">{timerMinutes} MINUTES</span>
          </div>

          <div className="mt-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/60 text-[11px] text-amber-200/90 leading-tight">
            ⏱️ <strong>Timer is paused.</strong> The countdown starts automatically the second Phone 2 joins!
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-zinc-600">
        Waiting for Phone 2 to establish peer-to-peer data link...
      </div>
    </div>
  );
};
