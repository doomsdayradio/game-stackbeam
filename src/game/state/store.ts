import { create } from 'zustand';
import type { Language } from '../../i18n/text';
import { createEmptyPreviewState, getBlockPreview, getShotPreview } from '../core/preview';
import { createGameState, reduceGameState } from '../core/reducer';
import type { EdgeShot, GameState, GridPosition, Level, PreviewState } from '../core/types';
import { levels as fallbackLevels } from '../levels/levels';
import {
  DIFFICULTY_ORDER,
  type Difficulty,
  type PuzzlePool,
  buildPuzzlePoolFromLevels,
  getLevelDifficulty,
  parsePuzzlePoolDocument,
  pickRandomPuzzle,
} from '../levels/puzzlePool';

const fallbackPuzzlePool = buildPuzzlePoolFromLevels(fallbackLevels);
const initialDifficulty: Difficulty = 'easy';
const initialLevel = pickRandomPuzzle(fallbackPuzzlePool[initialDifficulty]) ?? fallbackLevels[0]!;
const initialState = createGameState(initialLevel);

function findLevelById(pool: PuzzlePool, levelId: string): Level | null {
  for (const difficulty of DIFFICULTY_ORDER) {
    const level = pool[difficulty].find((candidate) => candidate.id === levelId);

    if (level) {
      return level;
    }
  }

  return null;
}

function nextAvailableDifficulty(pool: PuzzlePool, preferred: Difficulty): Difficulty {
  if (pool[preferred].length > 0) {
    return preferred;
  }

  const fallback = DIFFICULTY_ORDER.find((difficulty) => pool[difficulty].length > 0);
  return fallback ?? preferred;
}

export interface GameStore extends GameState {
  language: Language;
  selectedDifficulty: Difficulty;
  levels: Level[];
  currentLevelId: string;
  puzzlePool: PuzzlePool;
  isPuzzlePoolLoaded: boolean;
  puzzlePoolError: string | null;
  preview: PreviewState;
  setLanguage: (language: Language) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  loadPuzzlePool: () => Promise<void>;
  loadLevel: (levelId: string) => void;
  nextPuzzle: () => void;
  setHoveredCell: (position: GridPosition | null) => void;
  setHoveredEdge: (edge: EdgeShot | null) => void;
  clearPreview: () => void;
  placeBlock: (position: GridPosition) => void;
  fireEdge: (edge: EdgeShot) => void;
  undo: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  language: 'de',
  selectedDifficulty: getLevelDifficulty(initialLevel),
  levels: fallbackPuzzlePool[getLevelDifficulty(initialLevel)],
  currentLevelId: initialLevel.id,
  puzzlePool: fallbackPuzzlePool,
  isPuzzlePoolLoaded: false,
  puzzlePoolError: null,
  preview: createEmptyPreviewState(),
  setLanguage: (language) => {
    set((state) => ({
      ...state,
      language,
    }));
  },
  setDifficulty: (difficulty) => {
    set((state) => {
      const resolvedDifficulty = nextAvailableDifficulty(state.puzzlePool, difficulty);
      const levelPool = state.puzzlePool[resolvedDifficulty];
      const nextLevel = pickRandomPuzzle(levelPool, state.currentLevelId);

      if (!nextLevel) {
        return {
          ...state,
          selectedDifficulty: resolvedDifficulty,
          levels: levelPool,
        };
      }

      return {
        ...state,
        ...createGameState(nextLevel),
        selectedDifficulty: resolvedDifficulty,
        levels: levelPool,
        currentLevelId: nextLevel.id,
        preview: createEmptyPreviewState(),
      };
    });
  },
  loadPuzzlePool: async () => {
    try {
      const response = await fetch('/puzzles/puzzle-pool.json', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload: unknown = await response.json();
      const parsed = parsePuzzlePoolDocument(payload);

      set((state) => {
        const resolvedDifficulty = nextAvailableDifficulty(parsed.puzzles, state.selectedDifficulty);
        const currentLevel = findLevelById(parsed.puzzles, state.currentLevelId);
        const shouldKeepCurrentLevel =
          currentLevel !== null && getLevelDifficulty(currentLevel) === resolvedDifficulty;
        const nextLevel =
          shouldKeepCurrentLevel
            ? currentLevel
            : pickRandomPuzzle(parsed.puzzles[resolvedDifficulty], state.currentLevelId);

        if (!nextLevel) {
          return {
            ...state,
            selectedDifficulty: resolvedDifficulty,
            levels: parsed.puzzles[resolvedDifficulty],
            puzzlePool: parsed.puzzles,
            isPuzzlePoolLoaded: true,
            puzzlePoolError: null,
          };
        }

        return {
          ...state,
          ...createGameState(nextLevel),
          selectedDifficulty: resolvedDifficulty,
          levels: parsed.puzzles[resolvedDifficulty],
          currentLevelId: nextLevel.id,
          puzzlePool: parsed.puzzles,
          isPuzzlePoolLoaded: true,
          puzzlePoolError: null,
          preview: createEmptyPreviewState(),
        };
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);

      set((state) => ({
        ...state,
        isPuzzlePoolLoaded: true,
        puzzlePoolError: reason,
      }));
    }
  },
  loadLevel: (levelId) => {
    set((state) => {
      const level = findLevelById(state.puzzlePool, levelId);

      if (!level) {
        return state;
      }

      const difficulty = getLevelDifficulty(level);

      return {
        ...state,
        ...createGameState(level),
        selectedDifficulty: difficulty,
        levels: state.puzzlePool[difficulty],
        currentLevelId: level.id,
        preview: createEmptyPreviewState(),
      };
    });
  },
  nextPuzzle: () => {
    set((state) => {
      const levelPool = state.puzzlePool[state.selectedDifficulty];
      const nextLevel = pickRandomPuzzle(levelPool, state.currentLevelId);

      if (!nextLevel) {
        return state;
      }

      return {
        ...state,
        ...createGameState(nextLevel),
        levels: levelPool,
        currentLevelId: nextLevel.id,
        preview: createEmptyPreviewState(),
      };
    });
  },
  setHoveredCell: (position) => {
    const runtime = get().runtime;

    set((state) => ({
      ...state,
      preview: {
        hoveredCell: position,
        hoveredEdge: null,
        block: position ? getBlockPreview(runtime, position) : null,
        shot: null,
      },
    }));
  },
  setHoveredEdge: (edge) => {
    const runtime = get().runtime;

    set((state) => ({
      ...state,
      preview: {
        hoveredCell: null,
        hoveredEdge: edge,
        block: null,
        shot: edge ? getShotPreview(runtime, edge) : null,
      },
    }));
  },
  clearPreview: () => {
    set((state) => ({
      ...state,
      preview: createEmptyPreviewState(),
    }));
  },
  placeBlock: (position) => {
    set((state) =>
      state.runtime.isWin
        ? {
            ...state,
            preview: createEmptyPreviewState(),
          }
        : {
            ...state,
            ...reduceGameState(state, { type: 'place-block', position }),
            preview: createEmptyPreviewState(),
          },
    );
  },
  fireEdge: (edge) => {
    set((state) =>
      state.runtime.isWin
        ? {
            ...state,
            preview: createEmptyPreviewState(),
          }
        : {
            ...state,
            ...reduceGameState(state, { type: 'fire-edge', edge }),
            preview: createEmptyPreviewState(),
          },
    );
  },
  undo: () => {
    set((state) => ({
      ...state,
      ...reduceGameState(state, { type: 'undo' }),
      preview: createEmptyPreviewState(),
    }));
  },
  reset: () => {
    set((state) => ({
      ...state,
      ...reduceGameState(state, { type: 'reset' }),
      preview: createEmptyPreviewState(),
    }));
  },
}));
