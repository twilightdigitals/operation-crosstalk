import React, { useState } from 'react';
import { type MissionState, GLYPH_COLUMNS } from '../services/gameEngine';
import { BookOpen, Scissors, KeyRound, Radio, Cpu, FileText, Wifi, AlertTriangle } from 'lucide-react';

interface AnalystManualProps {
  state: MissionState;
  isConnected: boolean;
  onRoleSwap?: () => void;
  isSingleDeviceMode?: boolean;
}

export const AnalystManual: React.FC<AnalystManualProps> = ({
  state,
  isConnected,
  onRoleSwap,
  isSingleDeviceMode,
}) => {
  const [activeTab, setActiveTab] = useState<'wires' | 'glyphs' | 'frequency' | 'memory' | 'overview'>('overview');

  const minutes = Math.floor(state.remainingSeconds / 60);
  const seconds = state.remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-stone-900 text-stone-100 flex flex-col p-4 pb-12 select-none font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span className="font-bold tracking-widest text-amber-400">DEFUSAL FIELD MANUAL</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-stone-400">
          <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}`} />
          <span>{isConnected ? 'ONLINE' : 'STANDALONE'}</span>
        </div>
      </div>

      {/* Synchronized Mission Clock & Strikes */}
      <div className="my-3 bg-stone-950 border border-stone-800 rounded-xl p-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-500">OPERATIVE COUNTDOWN</span>
          <span className="text-2xl font-bold text-red-500 crt-glow-red">{formattedTime}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-stone-500 mb-1">STRIKES</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: state.maxStrikes }).map((_, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold border ${
                  i < state.strikes
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-stone-900 border-stone-800 text-stone-700'
                }`}
              >
                X
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Secret Dossier Warning */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-2.5 mb-3 flex items-center gap-2 text-[11px] text-amber-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>TOP SECRET: Ask your Operative questions. Never peek at their console!</span>
      </div>

      {/* Tab Selector */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-stone-950 border border-stone-800 rounded-xl mb-4 text-[10px]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeTab === 'overview' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>INTRO</span>
        </button>

        <button
          onClick={() => setActiveTab('wires')}
          className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeTab === 'wires' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>WIRES</span>
        </button>

        <button
          onClick={() => setActiveTab('glyphs')}
          className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeTab === 'glyphs' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>GLYPHS</span>
        </button>

        <button
          onClick={() => setActiveTab('frequency')}
          className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeTab === 'frequency' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>RADIO</span>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeTab === 'memory' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>MEMORY</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col gap-3 text-xs leading-relaxed text-stone-300">
          <h3 className="text-sm font-bold text-amber-400 uppercase border-b border-stone-800 pb-2">
            Section 0: Chassis Identification
          </h3>
          <p>
            Before issuing commands, verify the casing specifications with your Operative:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-stone-300">
            <li>
              <strong className="text-white">Serial Number:</strong> Formatted like <code className="text-amber-400 font-mono">AB-1234-C</code>. Note whether the last numerical digit is odd or even!
            </li>
            <li>
              <strong className="text-white">Battery Cells:</strong> 1, 2, or 3 cells on the device casing.
            </li>
            <li>
              <strong className="text-white">Indicator Label:</strong> Indicator tag (FRK, CAR, NSA, SIG) and whether its LED is LIT or OFF.
            </li>
          </ul>
          <div className="mt-2 p-2.5 bg-stone-900 border border-stone-800 rounded-lg text-[11px] text-amber-200/90">
            💡 <strong>Analyst Tip:</strong> Keep calm, listen carefully to your Operative, and read each rule in sequence from top to bottom!
          </div>
        </div>
      )}

      {/* Tab 2: Wires */}
      {activeTab === 'wires' && (
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col gap-3 text-xs text-stone-300">
          <h3 className="text-sm font-bold text-amber-400 uppercase border-b border-stone-800 pb-2 flex items-center justify-between">
            <span>Section 1: Wire Loom</span>
            <span className="text-[10px] text-stone-500">DOC #WL-402</span>
          </h3>
          <p className="text-[11px] text-stone-400">
            Wires are ordered top-to-bottom (1 to N). Apply the <em>first</em> matching rule:
          </p>

          <div className="space-y-4 text-[11px]">
            {/* 4 Wires */}
            <div className="p-3 bg-stone-900/90 border border-stone-800 rounded-lg">
              <span className="font-bold text-amber-300 block mb-1">IF THERE ARE 4 WIRES:</span>
              <ol className="list-decimal pl-4 space-y-1 text-stone-300">
                <li>If more than one red wire AND the serial number ends with an odd digit, cut the <strong className="text-white">last red wire</strong>.</li>
                <li>Otherwise, if the indicator LED is <strong className="text-amber-400">LIT</strong> AND there are no red wires, cut the <strong className="text-white">third wire</strong>.</li>
                <li>Otherwise, if the last wire is yellow AND there are no red wires, cut the <strong className="text-white">first wire</strong>.</li>
                <li>Otherwise, if there is exactly one blue wire, cut the <strong className="text-white">first wire</strong>.</li>
                <li>Otherwise, if there is more than one yellow wire, cut the <strong className="text-white">last wire</strong>.</li>
                <li>Otherwise, cut the <strong className="text-white">second wire</strong>.</li>
              </ol>
            </div>

            {/* 5 Wires */}
            <div className="p-3 bg-stone-900/90 border border-stone-800 rounded-lg">
              <span className="font-bold text-amber-300 block mb-1">IF THERE ARE 5 WIRES:</span>
              <ol className="list-decimal pl-4 space-y-1 text-stone-300">
                <li>If the last wire is black AND the serial ends with an odd digit, cut the <strong className="text-white">fourth wire</strong>.</li>
                <li>Otherwise, if the indicator LED is <strong className="text-amber-400">LIT</strong> AND exactly one red wire, cut the <strong className="text-white">second wire</strong>.</li>
                <li>Otherwise, if exactly one red wire AND more than one yellow wire, cut the <strong className="text-white">first wire</strong>.</li>
                <li>Otherwise, if there are no black wires, cut the <strong className="text-white">second wire</strong>.</li>
                <li>Otherwise, cut the <strong className="text-white">first wire</strong>.</li>
              </ol>
            </div>

            {/* 6 Wires */}
            <div className="p-3 bg-stone-900/90 border border-stone-800 rounded-lg">
              <span className="font-bold text-amber-300 block mb-1">IF THERE ARE 6 WIRES:</span>
              <ol className="list-decimal pl-4 space-y-1 text-stone-300">
                <li>If there are no yellow wires AND serial ends with odd digit, cut the <strong className="text-white">third wire</strong>.</li>
                <li>Otherwise, if the indicator LED is <strong className="text-amber-400">LIT</strong> AND more than two white wires, cut the <strong className="text-white">first wire</strong>.</li>
                <li>Otherwise, if exactly one yellow wire AND more than one white wire, cut the <strong className="text-white">fourth wire</strong>.</li>
                <li>Otherwise, if there are no red wires, cut the <strong className="text-white">last wire</strong>.</li>
                <li>Otherwise, cut the <strong className="text-white">fourth wire</strong>.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Glyphs */}
      {activeTab === 'glyphs' && (
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col gap-3 text-xs text-stone-300">
          <h3 className="text-sm font-bold text-amber-400 uppercase border-b border-stone-800 pb-2">
            Section 2: Glyph Columns
          </h3>
          <p className="text-[11px] text-stone-400">
            Only <strong className="text-white">one column below</strong> contains all four symbols present on the Operative's keypad. Have the Operative tap their four glyphs in the <strong className="text-amber-300">top-to-bottom order</strong> they appear in that column:
          </p>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {GLYPH_COLUMNS.map((col, colIdx) => (
              <div
                key={colIdx}
                className="bg-stone-900 border border-stone-800 rounded-lg p-2 flex flex-col items-center gap-2"
              >
                <span className="text-[9px] text-stone-500 font-bold">COL {colIdx + 1}</span>
                {col.map((glyph, gIdx) => (
                  <div
                    key={gIdx}
                    className="w-8 h-8 rounded bg-stone-950 border border-stone-800 flex items-center justify-center text-lg text-amber-200"
                  >
                    {glyph}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Frequency */}
      {activeTab === 'frequency' && (
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col gap-3 text-xs text-stone-300">
          <h3 className="text-sm font-bold text-cyan-400 uppercase border-b border-stone-800 pb-2">
            Section 3: Radio Resonance Matrix
          </h3>
          <p className="text-[11px] text-stone-400">
            Find the target broadcast frequency (in MHz) using the Operative's chassis <strong className="text-white">Indicator Tag</strong> and <strong className="text-white">Battery Count</strong>:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse border border-stone-800 text-[11px]">
              <thead>
                <tr className="bg-stone-900 text-stone-400">
                  <th className="border border-stone-800 p-2 text-left">TAG</th>
                  <th className="border border-stone-800 p-2">1 BATTERY</th>
                  <th className="border border-stone-800 p-2">2 BATTERIES</th>
                  <th className="border border-stone-800 p-2">3 BATTERIES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-stone-800 p-2 font-bold text-left text-amber-400">FRK</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">320 MHz</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">440 MHz</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">560 MHz</td>
                </tr>
                <tr className="bg-stone-900/40">
                  <td className="border border-stone-800 p-2 font-bold text-left text-amber-400">CAR</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">380 MHz</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">500 MHz</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">640 MHz</td>
                </tr>
                <tr>
                  <td className="border border-stone-800 p-2 font-bold text-left text-amber-400">NSA</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">420 MHz</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">580 MHz</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">720 MHz</td>
                </tr>
                <tr className="bg-stone-900/40">
                  <td className="border border-stone-800 p-2 font-bold text-left text-amber-400">SIG</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">480 MHz</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">620 MHz</td>
                  <td className="border border-stone-800 p-2 font-mono text-cyan-300">760 MHz</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-stone-400">
            *Tell the Operative to adjust their slider to within ±30 MHz and hit TRANSMIT.
          </p>
        </div>
      )}

      {/* Tab 5: Memory */}
      {activeTab === 'memory' && (
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col gap-3 text-xs text-stone-300">
          <h3 className="text-sm font-bold text-purple-400 uppercase border-b border-stone-800 pb-2">
            Section 4: Memory Core Sequencing
          </h3>
          <p className="text-[11px] text-stone-400">
            Buttons are indexed 1 to 4 from left to right. Positions and labels must be noted between stages:
          </p>

          <div className="space-y-3 text-[11px]">
            {/* Stage 1 */}
            <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-lg">
              <span className="font-bold text-purple-300 block mb-1">STAGE 1:</span>
              <ul className="list-disc pl-4 space-y-1 text-stone-300">
                <li>If the display is 1, press button in the <strong className="text-white">2nd position</strong>.</li>
                <li>If the display is 2, press button in the <strong className="text-white">2nd position</strong>.</li>
                <li>If the display is 3, press button in the <strong className="text-white">3rd position</strong>.</li>
                <li>If the display is 4, press button in the <strong className="text-white">4th position</strong>.</li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-lg">
              <span className="font-bold text-purple-300 block mb-1">STAGE 2:</span>
              <ul className="list-disc pl-4 space-y-1 text-stone-300">
                <li>If the display is 1, press button with the <strong className="text-white">label '4'</strong>.</li>
                <li>If the display is 2, press button in the <strong className="text-white">same position as Stage 1</strong>.</li>
                <li>If the display is 3, press button in the <strong className="text-white">1st position</strong>.</li>
                <li>If the display is 4, press button in the <strong className="text-white">same position as Stage 1</strong>.</li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-lg">
              <span className="font-bold text-purple-300 block mb-1">STAGE 3:</span>
              <ul className="list-disc pl-4 space-y-1 text-stone-300">
                <li>If the display is 1, press button with the <strong className="text-white">same label as Stage 2</strong>.</li>
                <li>If the display is 2, press button with the <strong className="text-white">same label as Stage 1</strong>.</li>
                <li>If the display is 3, press button in the <strong className="text-white">3rd position</strong>.</li>
                <li>If the display is 4, press button with the <strong className="text-white">label '4'</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Swap Role / Test Switcher */}
      {isSingleDeviceMode && onRoleSwap && (
        <div className="mt-8 pt-4 border-t border-stone-800">
          <button
            onClick={onRoleSwap}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-xs font-mono text-stone-300 font-bold"
          >
            SWITCH VIEW: SWITCH TO OPERATIVE CONSOLE 🕹️
          </button>
        </div>
      )}
    </div>
  );
};
