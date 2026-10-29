// Game Engine & Mission Generator for Operation: CrossTalk

export type WireColor = 'red' | 'blue' | 'yellow' | 'white' | 'black';

export interface WireModuleState {
  type: 'wires';
  wires: WireColor[];
  cutWires: boolean[];
  correctWireIndex: number;
  solved: boolean;
}

export interface GlyphModuleState {
  type: 'glyphs';
  displayedGlyphs: string[];
  correctOrder: string[];
  pressedGlyphs: string[];
  solved: boolean;
}

export interface FrequencyModuleState {
  type: 'frequency';
  targetFrequency: number;
  currentFrequency: number;
  tolerance: number;
  solved: boolean;
}

export interface MemoryStageState {
  displayDigit: number;
  buttonLabels: number[]; // 4 buttons with numbers 1..4 shuffled
}

export interface MemoryModuleState {
  type: 'memory';
  stages: MemoryStageState[];
  currentStage: number; // 0, 1, 2
  historyPresses: { position: number; label: number }[]; // 1-indexed for manual
  solved: boolean;
}

export interface MissionState {
  missionId: string;
  serialNumber: string;
  batteryCount: number;
  indicator: {
    label: 'FRK' | 'CAR' | 'NSA' | 'SIG';
    lit: boolean;
  };
  totalTimeSeconds: number;
  remainingSeconds: number;
  strikes: number;
  maxStrikes: number;
  status: 'waiting' | 'active' | 'victory' | 'detonated';
  modules: {
    wires: WireModuleState;
    glyphs: GlyphModuleState;
    frequency: FrequencyModuleState;
    memory: MemoryModuleState;
  };
}

// Glyph pool: 4 unique columns of 6 glyphs each
export const GLYPH_COLUMNS = [
  ['⚡', '🜚', '👁', 'ᚱ', '⚓', '🗝'],
  ['🜂', '⚡', '🗝', '🜏', '⚔', 'ᛟ'],
  ['👁', '🝤', '🜄', '🜚', '⚔', '☣'],
  ['ᛟ', '🜁', '🜏', '🝤', '⚓', '🜂'],
];

// Helper to determine wire solution
function calculateWireSolution(wires: WireColor[], serialNumber: string, indicatorLit: boolean): number {
  const lastChar = serialNumber.slice(-1);
  const lastDigit = parseInt(lastChar.match(/\d/) ? lastChar : serialNumber.split('').filter(c => /\d/.test(c)).pop() || '0', 10);
  const isOdd = lastDigit % 2 !== 0;

  const count = (color: WireColor) => wires.filter(w => w === color).length;
  const lastIndexOf = (color: WireColor) => wires.lastIndexOf(color);

  const n = wires.length;

  if (n === 4) {
    if (count('red') > 1 && isOdd) return lastIndexOf('red');
    if (indicatorLit && count('red') === 0) return 2;
    if (wires[n - 1] === 'yellow' && count('red') === 0) return 0;
    if (count('blue') === 1) return 0;
    if (count('yellow') > 1) return n - 1;
    return 1;
  } else if (n === 5) {
    if (wires[n - 1] === 'black' && isOdd) return 3;
    if (indicatorLit && count('red') === 1) return 1;
    if (count('red') === 1 && count('yellow') > 1) return 0;
    if (count('black') === 0) return 1;
    return 0;
  } else {
    // 6 wires
    if (count('yellow') === 0 && isOdd) return 2;
    if (indicatorLit && count('white') > 2) return 0;
    if (count('yellow') === 1 && count('white') > 1) return 3;
    if (count('red') === 0) return n - 1;
    return 3;
  }
}

// Helper to pick random item
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export function generateMission(difficulty: 'rookie' | 'veteran' | 'impossible' = 'veteran'): MissionState {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  const serial = `${pick(letters.split(''))}${pick(letters.split(''))}-${pick(digits.split(''))}${pick(digits.split(''))}${pick(digits.split(''))}${pick(digits.split(''))}-${pick(letters.split(''))}`;

  const batteryCount = pick([1, 2, 3]);
  const indicatorLabel = pick(['FRK', 'CAR', 'NSA', 'SIG'] as const);
  const indicatorLit = pick([true, false]);

  // Wire module setup
  const wireCounts = difficulty === 'rookie' ? [4] : difficulty === 'veteran' ? [4, 5] : [5, 6];
  const wireLength = pick(wireCounts);
  const colorsPool: WireColor[] = ['red', 'blue', 'yellow', 'white', 'black'];
  const wires: WireColor[] = Array.from({ length: wireLength }, () => pick(colorsPool));
  const correctWireIndex = calculateWireSolution(wires, serial, indicatorLit);

  // Glyph module setup
  // Pick one column, choose 4 glyphs from it, shuffle for operative
  const chosenCol = pick(GLYPH_COLUMNS);
  const sampledGlyphs = shuffle(chosenCol).slice(0, 4);
  // Correct order is how they appear in chosenCol
  const correctOrder = chosenCol.filter(g => sampledGlyphs.includes(g));

  // Frequency module setup
  // Frequency based on indicator & battery count
  const freqTable: Record<string, number> = {
    'FRK-1': 320, 'FRK-2': 440, 'FRK-3': 560,
    'CAR-1': 380, 'CAR-2': 500, 'CAR-3': 640,
    'NSA-1': 420, 'NSA-2': 580, 'NSA-3': 720,
    'SIG-1': 480, 'SIG-2': 620, 'SIG-3': 760,
  };
  const key = `${indicatorLabel}-${batteryCount}`;
  const targetFrequency = freqTable[key] || 500;

  // Memory module setup (3 stages)
  const memoryStages: MemoryStageState[] = [
    { displayDigit: pick([1, 2, 3, 4]), buttonLabels: shuffle([1, 2, 3, 4]) },
    { displayDigit: pick([1, 2, 3, 4]), buttonLabels: shuffle([1, 2, 3, 4]) },
    { displayDigit: pick([1, 2, 3, 4]), buttonLabels: shuffle([1, 2, 3, 4]) },
  ];

  const totalTimeSeconds = difficulty === 'rookie' ? 300 : difficulty === 'veteran' ? 240 : 180;

  return {
    missionId: Math.random().toString(36).substring(2, 6).toUpperCase(),
    serialNumber: serial,
    batteryCount,
    indicator: {
      label: indicatorLabel,
      lit: indicatorLit,
    },
    totalTimeSeconds,
    remainingSeconds: totalTimeSeconds,
    strikes: 0,
    maxStrikes: 3,
    status: 'waiting',
    modules: {
      wires: {
        type: 'wires',
        wires,
        cutWires: Array(wires.length).fill(false),
        correctWireIndex,
        solved: false,
      },
      glyphs: {
        type: 'glyphs',
        displayedGlyphs: sampledGlyphs,
        correctOrder,
        pressedGlyphs: [],
        solved: false,
      },
      frequency: {
        type: 'frequency',
        targetFrequency,
        currentFrequency: 450,
        tolerance: 30,
        solved: false,
      },
      memory: {
        type: 'memory',
        stages: memoryStages,
        currentStage: 0,
        historyPresses: [],
        solved: false,
      },
    },
  };
}

// Memory rule solver for a given stage
export function getCorrectMemoryButton(
  stageIndex: number,
  displayDigit: number,
  buttonLabels: number[],
  historyPresses: { position: number; label: number }[]
): { position: number; label: number } {
  // 1-indexed position: 1..4
  let targetPosition: number | null = null;
  let targetLabel: number | null = null;

  if (stageIndex === 0) {
    // Stage 1
    if (displayDigit === 1) targetPosition = 2;
    else if (displayDigit === 2) targetPosition = 2;
    else if (displayDigit === 3) targetPosition = 3;
    else targetPosition = 4;
  } else if (stageIndex === 1) {
    // Stage 2
    if (displayDigit === 1) targetLabel = 4;
    else if (displayDigit === 2) targetPosition = historyPresses[0].position;
    else if (displayDigit === 3) targetPosition = 1;
    else targetPosition = historyPresses[0].position;
  } else {
    // Stage 3
    if (displayDigit === 1) targetLabel = historyPresses[1].label;
    else if (displayDigit === 2) targetLabel = historyPresses[0].label;
    else if (displayDigit === 3) targetPosition = 3;
    else targetLabel = 4;
  }

  if (targetPosition !== null) {
    return {
      position: targetPosition,
      label: buttonLabels[targetPosition - 1],
    };
  } else {
    const pos = buttonLabels.indexOf(targetLabel!) + 1;
    return {
      position: pos,
      label: targetLabel!,
    };
  }
}
