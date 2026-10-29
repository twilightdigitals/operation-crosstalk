import React, { useState } from 'react';
import type { GameRole } from '../services/p2p';
import { Shield, Users, Radio, Play, Smartphone, HelpCircle } from 'lucide-react';

interface LobbyProps {
  onCreateRoom: (role: GameRole, difficulty: 'rookie' | 'veteran' | 'impossible') => void;
  onJoinRoom: (roomCode: string, role: GameRole) => void;
  onStartSoloTest: () => void;
  isConnecting: boolean;
  connectionError: string | null;
}

export const Lobby: React.FC<LobbyProps> = ({
  onCreateRoom,
  onJoinRoom,
  onStartSoloTest,
  isConnecting,
  connectionError,
}) => {
  const [mode, setMode] = useState<'menu' | 'host' | 'join'>('menu');
  const [selectedRole, setSelectedRole] = useState<GameRole>('operative');
  const [difficulty, setDifficulty] = useState<'rookie' | 'veteran' | 'impossible'>('veteran');
  const [joinCode, setJoinCode] = useState('');
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 select-none font-mono">
      {/* Title & Badge */}
      <div className="flex flex-col items-center text-center mt-6">
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 border-2 border-red-600/70 flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(239,68,68,0.5)]">
          <Shield className="w-9 h-9 text-red-500 animate-pulse" />
        </div>
        <h1 className="text-3xl font-black tracking-widest text-zinc-100 uppercase crt-glow">
          OPERATION<br />
          <span className="text-red-500 crt-glow-red">CROSSTALK</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-2 tracking-wide font-sans max-w-xs">
          Two Phones. Asymmetric Mystery. Never show each other your screens.
        </p>
      </div>

      {/* Main Container */}
      <div className="my-auto py-6">
        {mode === 'menu' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode('host')}
              className="py-4 px-5 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold flex items-center justify-between shadow-lg shadow-red-950/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5" />
                <span className="tracking-wider">HOST MISSION (PHONE 1)</span>
              </div>
              <span className="text-xs bg-red-700/80 px-2.5 py-1 rounded-full">CREATE</span>
            </button>

            <button
              onClick={() => setMode('join')}
              className="py-4 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-100 font-bold border border-zinc-700 flex items-center justify-between shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-amber-400" />
                <span className="tracking-wider">JOIN MISSION (PHONE 2)</span>
              </div>
              <span className="text-xs bg-zinc-700 px-2.5 py-1 rounded-full text-zinc-300">CODE</span>
            </button>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={onStartSoloTest}
                className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs border border-zinc-800 flex items-center gap-2 transition-all flex-1 mr-2"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>SOLO PRACTICE / TEST</span>
              </button>

              <button
                onClick={() => setShowHowToPlay(!showHowToPlay)}
                className="py-3 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs border border-zinc-800 flex items-center justify-center transition-all"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Quick Rules Modal/Drawer */}
            {showHowToPlay && (
              <div className="mt-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-2 text-zinc-300">
                <span className="font-bold text-amber-400 block mb-1">HOW TO PLAY TOGETHER:</span>
                <p>1. <strong>Player 1:</strong> Tap &ldquo;HOST MISSION&rdquo;, pick your role, and tell your partner the 4-letter room code.</p>
                <p>2. <strong>Player 2:</strong> Tap &ldquo;JOIN MISSION&rdquo;, enter the room code, and pick the opposite role.</p>
                <p>3. <strong>Golden Rule:</strong> Sit on the couch together, but <span className="text-red-400 font-bold">NEVER look at each other&apos;s phone!</span> Only communicate by talking out loud.</p>
              </div>
            )}
          </div>
        )}

        {/* Host Form */}
        {mode === 'host' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <h2 className="text-sm font-bold tracking-widest text-zinc-200 uppercase flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" /> MISSION CONFIGURATION
            </h2>

            {/* Role Pick */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-zinc-400">YOUR INITIAL ROLE:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRole('operative')}
                  className={`py-3 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    selectedRole === 'operative'
                      ? 'bg-red-950/80 border-red-500 text-white font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span>OPERATIVE 🕹️</span>
                  <span className="text-[9px] text-zinc-400 font-normal">Controls the Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('analyst')}
                  className={`py-3 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    selectedRole === 'analyst'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span>ANALYST 📖</span>
                  <span className="text-[9px] text-zinc-400 font-normal">Reads the Manual</span>
                </button>
              </div>
            </div>

            {/* Difficulty Pick */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-zinc-400">MISSION TIMER:</span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                {(['rookie', 'veteran', 'impossible'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 rounded-lg border uppercase font-bold transition-all ${
                      difficulty === diff
                        ? 'bg-zinc-800 border-zinc-400 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {diff === 'rookie' ? '5m 00s' : diff === 'veteran' ? '4m 00s' : '3m 00s'}
                  </button>
                ))}
              </div>
            </div>

            {connectionError && (
              <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs">
                {connectionError}
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="py-3 px-4 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
              >
                BACK
              </button>
              <button
                type="button"
                disabled={isConnecting}
                onClick={() => onCreateRoom(selectedRole, difficulty)}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                {isConnecting ? (
                  <span>INITIALIZING LINK...</span>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>LAUNCH OPERATION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Join Form */}
        {mode === 'join' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <h2 className="text-sm font-bold tracking-widest text-zinc-200 uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" /> JOIN PARTNER&apos;S ROOM
            </h2>

            {/* Room Code Input */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-zinc-400">ENTER 4-LETTER ROOM CODE:</span>
              <input
                type="text"
                maxLength={4}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="E.G. HAWK"
                className="w-full bg-zinc-950 border-2 border-zinc-700 focus:border-amber-400 rounded-xl py-3 px-4 text-center font-mono text-2xl font-black text-amber-300 tracking-widest uppercase outline-none"
              />
            </div>

            {/* Role Pick */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-zinc-400">YOUR ROLE:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRole('analyst')}
                  className={`py-3 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    selectedRole === 'analyst'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span>ANALYST 📖</span>
                  <span className="text-[9px] text-zinc-400 font-normal">Reads the Manual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('operative')}
                  className={`py-3 px-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    selectedRole === 'operative'
                      ? 'bg-red-950/80 border-red-500 text-white font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span>OPERATIVE 🕹️</span>
                  <span className="text-[9px] text-zinc-400 font-normal">Controls the Device</span>
                </button>
              </div>
            </div>

            {connectionError && (
              <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs">
                {connectionError}
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="py-3 px-4 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
              >
                BACK
              </button>
              <button
                type="button"
                disabled={isConnecting || joinCode.length < 4}
                onClick={() => onJoinRoom(joinCode, selectedRole)}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg ${
                  joinCode.length === 4
                    ? 'bg-amber-600 hover:bg-amber-500 active:scale-95 text-white'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isConnecting ? <span>CONNECTING...</span> : <span>LINK UP</span>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-zinc-600 tracking-wider">
        OPERATION CROSSTALK • V1.0 PROTOCOL • TWO-PLAYER PASSION PROJECT
      </div>
    </div>
  );
};
