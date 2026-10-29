import { useState, useEffect, useRef } from 'react';
import {
  type MissionState,
  generateMission,
  getCorrectMemoryButton,
} from './services/gameEngine';
import { network, type GameRole, type PeerMessage } from './services/p2p';
import { sound } from './services/sound';
import { Lobby } from './components/Lobby';
import { OperativeConsole } from './components/OperativeConsole';
import { AnalystManual } from './components/AnalystManual';
import { GameOverModal } from './components/GameOverModal';

export function App() {
  const [gameState, setGameState] = useState<MissionState | null>(null);
  const [role, setRole] = useState<GameRole>('operative');
  const [isSoloMode, setIsSoloMode] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Setup Network Listeners
  useEffect(() => {
    network.initialize(
      (syncedState) => {
        setGameState(syncedState);
      },
      (msg: PeerMessage) => {
        if (msg.type === 'STRIKE_EVENT') {
          sound.strike();
        } else if (msg.type === 'SOLVED_EVENT') {
          sound.moduleSolved();
        } else if (msg.type === 'ROLE_SWAP') {
          setRole((prev) => (prev === 'operative' ? 'analyst' : 'operative'));
        }
      },
      (connectedStatus) => {
        setIsConnected(connectedStatus);
      }
    );

    return () => {
      network.disconnect();
    };
  }, []);

  // Sync state helper to P2P network
  const updateAndBroadcastState = (updater: (prev: MissionState) => MissionState) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      if (!isSoloMode && network.connected) {
        network.send({ type: 'STATE_SYNC', state: next });
      }
      return next;
    });
  };

  // Timer Tick Interval (Runs on Host or in Solo Mode)
  useEffect(() => {
    if (!gameState || gameState.status !== 'active') return;
    if (!network.isHost && !isSoloMode) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.status !== 'active') return prev;

        const nextSeconds = prev.remainingSeconds - 1;
        if (nextSeconds <= 0) {
          const detonatedState: MissionState = {
            ...prev,
            remainingSeconds: 0,
            status: 'detonated',
          };
          if (!isSoloMode && network.connected) {
            network.send({ type: 'STATE_SYNC', state: detonatedState });
          }
          return detonatedState;
        }

        // Play tense tick
        sound.tick(nextSeconds <= 30);

        const updated: MissionState = {
          ...prev,
          remainingSeconds: nextSeconds,
        };
        if (!isSoloMode && network.connected) {
          network.send({ type: 'STATE_SYNC', state: updated });
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState?.status, isSoloMode]);

  // Check victory condition
  const checkVictory = (state: MissionState): boolean => {
    return (
      state.modules.wires.solved &&
      state.modules.glyphs.solved &&
      state.modules.frequency.solved &&
      state.modules.memory.solved
    );
  };

  // Trigger strike
  const registerStrike = () => {
    sound.strike();
    updateAndBroadcastState((prev) => {
      const newStrikes = prev.strikes + 1;
      const isDetonated = newStrikes >= prev.maxStrikes;
      return {
        ...prev,
        strikes: newStrikes,
        status: isDetonated ? 'detonated' : prev.status,
      };
    });
  };

  // Operative Action 1: Wire Cut
  const handleCutWire = (index: number) => {
    if (!gameState || gameState.status !== 'active') return;
    sound.wireCut();

    const isCorrect = index === gameState.modules.wires.correctWireIndex;

    if (isCorrect) {
      sound.moduleSolved();
      updateAndBroadcastState((prev) => {
        const cut = [...prev.modules.wires.cutWires];
        cut[index] = true;
        const next: MissionState = {
          ...prev,
          modules: {
            ...prev.modules,
            wires: {
              ...prev.modules.wires,
              cutWires: cut,
              solved: true,
            },
          },
        };
        if (checkVictory(next)) next.status = 'victory';
        return next;
      });
    } else {
      registerStrike();
      updateAndBroadcastState((prev) => {
        const cut = [...prev.modules.wires.cutWires];
        cut[index] = true;
        return {
          ...prev,
          modules: {
            ...prev.modules,
            wires: {
              ...prev.modules.wires,
              cutWires: cut,
            },
          },
        };
      });
    }
  };

  // Operative Action 2: Glyph Press
  const handlePressGlyph = (glyph: string) => {
    if (!gameState || gameState.status !== 'active') return;

    const currentPressed = gameState.modules.glyphs.pressedGlyphs;
    const expectedGlyph = gameState.modules.glyphs.correctOrder[currentPressed.length];

    if (glyph === expectedGlyph) {
      sound.beep(800);
      const nextPressed = [...currentPressed, glyph];
      const isSolved = nextPressed.length === 4;

      if (isSolved) sound.moduleSolved();

      updateAndBroadcastState((prev) => {
        const next: MissionState = {
          ...prev,
          modules: {
            ...prev.modules,
            glyphs: {
              ...prev.modules.glyphs,
              pressedGlyphs: nextPressed,
              solved: isSolved,
            },
          },
        };
        if (checkVictory(next)) next.status = 'victory';
        return next;
      });
    } else {
      // Strike & reset sequence
      registerStrike();
      updateAndBroadcastState((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          glyphs: {
            ...prev.modules.glyphs,
            pressedGlyphs: [],
          },
        },
      }));
    }
  };

  // Operative Action 3: Frequency Change & Lock
  const handleChangeFrequency = (freq: number) => {
    if (!gameState || gameState.status !== 'active') return;
    sound.beep(300 + freq / 4);
    updateAndBroadcastState((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        frequency: {
          ...prev.modules.frequency,
          currentFrequency: freq,
        },
      },
    }));
  };

  const handleLockFrequency = () => {
    if (!gameState || gameState.status !== 'active') return;
    const { currentFrequency, targetFrequency, tolerance } = gameState.modules.frequency;
    const isCorrect = Math.abs(currentFrequency - targetFrequency) <= tolerance;

    if (isCorrect) {
      sound.moduleSolved();
      updateAndBroadcastState((prev) => {
        const next: MissionState = {
          ...prev,
          modules: {
            ...prev.modules,
            frequency: {
              ...prev.modules.frequency,
              solved: true,
            },
          },
        };
        if (checkVictory(next)) next.status = 'victory';
        return next;
      });
    } else {
      registerStrike();
    }
  };

  // Operative Action 4: Memory Core Button Press
  const handlePressMemoryButton = (position: number, label: number) => {
    if (!gameState || gameState.status !== 'active') return;
    const memory = gameState.modules.memory;
    const currentStageData = memory.stages[memory.currentStage];

    const correct = getCorrectMemoryButton(
      memory.currentStage,
      currentStageData.displayDigit,
      currentStageData.buttonLabels,
      memory.historyPresses
    );

    const isCorrect = correct.position === position && correct.label === label;

    if (isCorrect) {
      sound.beep(950);
      const isFinalStage = memory.currentStage >= memory.stages.length - 1;

      if (isFinalStage) sound.moduleSolved();

      updateAndBroadcastState((prev) => {
        const nextHistory = [...prev.modules.memory.historyPresses, { position, label }];
        const next: MissionState = {
          ...prev,
          modules: {
            ...prev.modules,
            memory: {
              ...prev.modules.memory,
              currentStage: prev.modules.memory.currentStage + (isFinalStage ? 0 : 1),
              historyPresses: nextHistory,
              solved: isFinalStage,
            },
          },
        };
        if (checkVictory(next)) next.status = 'victory';
        return next;
      });
    } else {
      // Strike & reset back to stage 1
      registerStrike();
      updateAndBroadcastState((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          memory: {
            ...prev.modules.memory,
            currentStage: 0,
            historyPresses: [],
          },
        },
      }));
    }
  };

  // Lobby Handlers
  const handleCreateRoom = async (
    chosenRole: GameRole,
    diff: 'rookie' | 'veteran' | 'impossible'
  ) => {
    setIsConnecting(true);
    setConnectionError(null);
    const code = ['HAWK', 'LION', 'ECHO', 'BOLT', 'WOLF', 'RUBY', 'STAR', 'JAZZ'][
      Math.floor(Math.random() * 8)
    ];

    const newMission = generateMission(diff);
    newMission.status = 'active';

    try {
      await network.createRoom(code, newMission);
      setRoomCode(code);
      setRole(chosenRole);
      setIsSoloMode(false);
      setGameState(newMission);
    } catch {
      setConnectionError('Could not initialize room link. Try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinRoom = async (code: string, chosenRole: GameRole) => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      await network.joinRoom(code);
      setRoomCode(code.toUpperCase());
      setRole(chosenRole);
      setIsSoloMode(false);
    } catch {
      setConnectionError('Failed to connect to room. Check the code and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartSoloTest = () => {
    const soloMission = generateMission('veteran');
    soloMission.status = 'active';
    setGameState(soloMission);
    setIsSoloMode(true);
    setRole('operative');
  };

  const handlePlayAgain = (swapRoles: boolean) => {
    const newMission = generateMission('veteran');
    newMission.status = 'active';
    setGameState(newMission);

    if (swapRoles) {
      setRole((prev) => (prev === 'operative' ? 'analyst' : 'operative'));
      if (!isSoloMode && network.connected) {
        network.send({ type: 'ROLE_SWAP' });
      }
    }

    if (!isSoloMode && network.connected) {
      network.send({ type: 'STATE_SYNC', state: newMission });
    }
  };

  const handleReturnToLobby = () => {
    network.disconnect();
    setGameState(null);
    setIsSoloMode(false);
    setRoomCode('');
  };

  // Render Screens
  if (!gameState) {
    return (
      <Lobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onStartSoloTest={handleStartSoloTest}
        isConnecting={isConnecting}
        connectionError={connectionError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center">
      {/* Top Banner showing Room Code on 2-phone multiplayer */}
      {!isSoloMode && (
        <div className="w-full bg-zinc-900 border-b border-zinc-800 py-1.5 px-4 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span>ROOM:</span>
            <span className="font-bold text-amber-400 tracking-wider">{roomCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>ROLE:</span>
            <span className="font-bold text-zinc-200 uppercase">{role}</span>
          </div>
        </div>
      )}

      {/* Operative Console OR Analyst Manual */}
      {role === 'operative' ? (
        <OperativeConsole
          state={gameState}
          onCutWire={handleCutWire}
          onPressGlyph={handlePressGlyph}
          onChangeFrequency={handleChangeFrequency}
          onLockFrequency={handleLockFrequency}
          onPressMemoryButton={handlePressMemoryButton}
          isConnected={isConnected || isSoloMode}
          onRoleSwap={() => setRole('analyst')}
          isSingleDeviceMode={isSoloMode}
        />
      ) : (
        <AnalystManual
          state={gameState}
          isConnected={isConnected || isSoloMode}
          onRoleSwap={() => setRole('operative')}
          isSingleDeviceMode={isSoloMode}
        />
      )}

      {/* Game Over / Victory Modal */}
      {(gameState.status === 'victory' || gameState.status === 'detonated') && (
        <GameOverModal
          state={gameState}
          onPlayAgain={handlePlayAgain}
          onReturnToLobby={handleReturnToLobby}
        />
      )}
    </div>
  );
}

export default App;
