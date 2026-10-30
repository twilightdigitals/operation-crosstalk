import { useState, useEffect, useRef } from 'react';
import {
  type MissionState,
  generateMission,
  getCorrectMemoryButton,
} from './services/gameEngine';
import { network, type GameRole, type RealtimeAction } from './services/p2p';
import { sound } from './services/sound';
import { Lobby } from './components/Lobby';
import { WaitingLobby } from './components/WaitingLobby';
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
  const [difficulty, setDifficulty] = useState<'rookie' | 'veteran' | 'impossible'>('veteran');

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Check victory condition
  const checkVictory = (state: MissionState): boolean => {
    return (
      state.modules.wires.solved &&
      state.modules.glyphs.solved &&
      state.modules.frequency.solved &&
      state.modules.memory.solved
    );
  };

  // Setup Supabase Realtime Action Listeners
  useEffect(() => {
    network.initialize(
      (action: RealtimeAction) => {
        handleRemoteAction(action);
      },
      (connectedStatus) => {
        setIsConnected(connectedStatus);
        if (connectedStatus) {
          sound.moduleSolved(); // Connection chime
          if (network.isHost) {
            setGameState((prev) => {
              if (prev && prev.status === 'waiting') {
                return {
                  ...prev,
                  status: 'active',
                };
              }
              return prev;
            });
          }
        }
      }
    );

    return () => {
      network.disconnect();
    };
  }, []);

  // Handler for actions received from partner over Supabase Realtime
  const handleRemoteAction = (action: RealtimeAction) => {
    setGameState((prev) => {
      if (!prev) return prev;

      switch (action.type) {
        case 'PARTNER_JOINED':
        case 'PARTNER_READY': {
          sound.moduleSolved();
          setIsConnected(true);
          return {
            ...prev,
            status: 'active',
          };
        }

        case 'MISSION_INIT': {
          setIsConnected(true);
          return {
            ...action.state,
            status: 'active',
          };
        }

        case 'WIRE_CUT': {
          sound.wireCut();
          const cut = [...prev.modules.wires.cutWires];
          cut[action.wireIndex] = true;

          if (action.isCorrect) {
            sound.moduleSolved();
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
          } else {
            sound.strike();
            const newStrikes = prev.strikes + 1;
            return {
              ...prev,
              strikes: newStrikes,
              status: newStrikes >= prev.maxStrikes ? 'detonated' : prev.status,
              modules: {
                ...prev.modules,
                wires: {
                  ...prev.modules.wires,
                  cutWires: cut,
                },
              },
            };
          }
        }

        case 'GLYPH_PRESSED': {
          if (action.isError) {
            sound.strike();
            const newStrikes = prev.strikes + 1;
            return {
              ...prev,
              strikes: newStrikes,
              status: newStrikes >= prev.maxStrikes ? 'detonated' : prev.status,
              modules: {
                ...prev.modules,
                glyphs: {
                  ...prev.modules.glyphs,
                  pressedGlyphs: [],
                },
              },
            };
          } else {
            sound.beep(800);
            if (action.isSolved) sound.moduleSolved();

            const next: MissionState = {
              ...prev,
              modules: {
                ...prev.modules,
                glyphs: {
                  ...prev.modules.glyphs,
                  pressedGlyphs: action.nextPressed,
                  solved: action.isSolved,
                },
              },
            };
            if (checkVictory(next)) next.status = 'victory';
            return next;
          }
        }

        case 'FREQUENCY_CHANGED': {
          return {
            ...prev,
            modules: {
              ...prev.modules,
              frequency: {
                ...prev.modules.frequency,
                currentFrequency: action.frequency,
              },
            },
          };
        }

        case 'FREQUENCY_LOCKED': {
          if (action.isCorrect) {
            sound.moduleSolved();
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
          } else {
            sound.strike();
            const newStrikes = prev.strikes + 1;
            return {
              ...prev,
              strikes: newStrikes,
              status: newStrikes >= prev.maxStrikes ? 'detonated' : prev.status,
            };
          }
        }

        case 'MEMORY_STAGE_ADVANCE': {
          sound.beep(950);
          if (action.isSolved) sound.moduleSolved();

          const next: MissionState = {
            ...prev,
            modules: {
              ...prev.modules,
              memory: {
                ...prev.modules.memory,
                currentStage: action.nextStage,
                historyPresses: action.history,
                solved: action.isSolved,
              },
            },
          };
          if (checkVictory(next)) next.status = 'victory';
          return next;
        }

        case 'MEMORY_RESET': {
          sound.strike();
          const newStrikes = prev.strikes + 1;
          return {
            ...prev,
            strikes: newStrikes,
            status: newStrikes >= prev.maxStrikes ? 'detonated' : prev.status,
            modules: {
              ...prev.modules,
              memory: {
                ...prev.modules.memory,
                currentStage: 0,
                historyPresses: [],
              },
            },
          };
        }

        case 'ROLE_SWAP': {
          setRole((r) => (r === 'operative' ? 'analyst' : 'operative'));
          return prev;
        }

        case 'PLAY_AGAIN': {
          if (action.swapRoles) {
            setRole((r) => (r === 'operative' ? 'analyst' : 'operative'));
          }
          return action.newMission;
        }

        case 'DETONATED': {
          return {
            ...prev,
            remainingSeconds: 0,
            status: 'detonated',
          };
        }

        default:
          return prev;
      }
    });
  };

  // Local Countdown Timer: runs independently on both devices during active game.
  // Neither phone overrides the other's state with timer ticks!
  useEffect(() => {
    if (!gameState || gameState.status !== 'active') return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.status !== 'active') return prev;

        const nextSeconds = prev.remainingSeconds - 1;
        if (nextSeconds <= 0) {
          if (network.isHost && network.connected) {
            network.send({ type: 'DETONATED', sender: network.clientId });
          }
          return {
            ...prev,
            remainingSeconds: 0,
            status: 'detonated',
          };
        }

        sound.tick(nextSeconds <= 30);
        return {
          ...prev,
          remainingSeconds: nextSeconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState?.status]);

  // Operative Action 1: Wire Cut
  const handleCutWire = (index: number) => {
    if (!gameState || gameState.status !== 'active') return;
    sound.wireCut();

    const isCorrect = index === gameState.modules.wires.correctWireIndex;

    if (!isSoloMode && network.connected) {
      network.send({
        type: 'WIRE_CUT',
        wireIndex: index,
        isCorrect,
        sender: network.clientId,
      });
    }

    setGameState((prev) => {
      if (!prev) return prev;
      const cut = [...prev.modules.wires.cutWires];
      cut[index] = true;

      if (isCorrect) {
        sound.moduleSolved();
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
      } else {
        sound.strike();
        const newStrikes = prev.strikes + 1;
        return {
          ...prev,
          strikes: newStrikes,
          status: newStrikes >= prev.maxStrikes ? 'detonated' : prev.status,
          modules: {
            ...prev.modules,
            wires: {
              ...prev.modules.wires,
              cutWires: cut,
            },
          },
        };
      }
    });
  };

  // Operative Action 2: Glyph Press
  const handlePressGlyph = (glyph: string) => {
    if (!gameState || gameState.status !== 'active') return;

    const currentPressed = gameState.modules.glyphs.pressedGlyphs;
    const expectedGlyph = gameState.modules.glyphs.correctOrder[currentPressed.length];
    const isError = glyph !== expectedGlyph;
    const nextPressed = isError ? [] : [...currentPressed, glyph];
    const isSolved = !isError && nextPressed.length === 4;

    if (!isSoloMode && network.connected) {
      network.send({
        type: 'GLYPH_PRESSED',
        glyph,
        nextPressed,
        isSolved,
        isError,
        sender: network.clientId,
      });
    }

    setGameState((prev) => {
      if (!prev) return prev;

      if (isError) {
        sound.strike();
        const newStrikes = prev.strikes + 1;
        return {
          ...prev,
          strikes: newStrikes,
          status: newStrikes >= prev.maxStrikes ? 'detonated' : prev.status,
          modules: {
            ...prev.modules,
            glyphs: {
              ...prev.modules.glyphs,
              pressedGlyphs: [],
            },
          },
        };
      } else {
        sound.beep(800);
        if (isSolved) sound.moduleSolved();

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
      }
    });
  };

  // Operative Action 3: Frequency Change & Lock
  const handleChangeFrequency = (freq: number) => {
    if (!gameState || gameState.status !== 'active') return;
    sound.beep(300 + freq / 4);

    if (!isSoloMode && network.connected) {
      network.send({
        type: 'FREQUENCY_CHANGED',
        frequency: freq,
        sender: network.clientId,
      });
    }

    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        modules: {
          ...prev.modules,
          frequency: {
            ...prev.modules.frequency,
            currentFrequency: freq,
          },
        },
      };
    });
  };

  const handleLockFrequency = () => {
    if (!gameState || gameState.status !== 'active') return;
    const { currentFrequency, targetFrequency, tolerance } = gameState.modules.frequency;
    const isCorrect = Math.abs(currentFrequency - targetFrequency) <= tolerance;

    if (!isSoloMode && network.connected) {
      network.send({
        type: 'FREQUENCY_LOCKED',
        isCorrect,
        sender: network.clientId,
      });
    }

    setGameState((prev) => {
      if (!prev) return prev;

      if (isCorrect) {
        sound.moduleSolved();
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
      } else {
        sound.strike();
        const newStrikes = prev.strikes + 1;
        return {
          ...prev,
          strikes: newStrikes,
          status: newStrikes >= prev.maxStrikes ? 'detonated' : prev.status,
        };
      }
    });
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
      const nextStage = memory.currentStage + (isFinalStage ? 0 : 1);
      const nextHistory = [...memory.historyPresses, { position, label }];

      if (isFinalStage) sound.moduleSolved();

      if (!isSoloMode && network.connected) {
        network.send({
          type: 'MEMORY_STAGE_ADVANCE',
          nextStage,
          history: nextHistory,
          isSolved: isFinalStage,
          sender: network.clientId,
        });
      }

      setGameState((prev) => {
        if (!prev) return prev;
        const next: MissionState = {
          ...prev,
          modules: {
            ...prev.modules,
            memory: {
              ...prev.modules.memory,
              currentStage: nextStage,
              historyPresses: nextHistory,
              solved: isFinalStage,
            },
          },
        };
        if (checkVictory(next)) next.status = 'victory';
        return next;
      });
    } else {
      sound.strike();

      if (!isSoloMode && network.connected) {
        network.send({
          type: 'MEMORY_RESET',
          sender: network.clientId,
        });
      }

      setGameState((prev) => {
        if (!prev) return prev;
        const newStrikes = prev.strikes + 1;
        return {
          ...prev,
          strikes: newStrikes,
          status: newStrikes >= prev.maxStrikes ? 'detonated' : prev.status,
          modules: {
            ...prev.modules,
            memory: {
              ...prev.modules.memory,
              currentStage: 0,
              historyPresses: [],
            },
          },
        };
      });
    }
  };

  // Lobby Handlers
  const handleCreateRoom = async (
    chosenRole: GameRole,
    diff: 'rookie' | 'veteran' | 'impossible'
  ) => {
    setIsConnecting(true);
    setConnectionError(null);

    // 5 clean uppercase random letters (no ambiguous chars)
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const code = Array.from({ length: 5 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');

    const newMission = generateMission(diff);
    newMission.status = 'waiting';
    setDifficulty(diff);

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
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z]/g, '');

    try {
      const syncedState = await network.joinRoom(cleanCode);
      setRoomCode(cleanCode);
      setRole(chosenRole);
      setIsSoloMode(false);
      setGameState({
        ...syncedState,
        status: 'active',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to room. Check the code and try again.';
      setConnectionError(msg);
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
    const currentDiff = gameState?.difficulty || difficulty;
    const newMission = generateMission(currentDiff);
    newMission.status = 'active';

    if (!isSoloMode && network.connected) {
      network.send({
        type: 'PLAY_AGAIN',
        newMission,
        swapRoles,
        sender: network.clientId,
      });
    }

    if (swapRoles) {
      setRole((r) => (r === 'operative' ? 'analyst' : 'operative'));
    }
    setGameState(newMission);
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

  // Waiting Room for Host until Partner Connects
  if (gameState.status === 'waiting' && !isSoloMode) {
    return (
      <WaitingLobby
        roomCode={roomCode}
        role={role}
        timerMinutes={Math.floor(gameState.totalTimeSeconds / 60)}
        onCancel={handleReturnToLobby}
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
