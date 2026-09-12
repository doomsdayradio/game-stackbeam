import type { Level } from '../core/types';
import { createLevelFromBlueprint } from './levelBuilder';
import { parseSolutionNotation } from './solution';

export const DIFFICULTY_ORDER = ['easy', 'normal', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTY_ORDER)[number];

export type PuzzlePool = Record<Difficulty, Level[]>;

export interface PuzzlePoolDocument {
  generatedAt: string;
  puzzles: PuzzlePool;
}

interface CompactPuzzleDefinition {
  id: string;
  title: string;
  description?: string;
  playerBlockCount: number;
  initialMap: string[];
  solutionNotation: string | string[];
}

export interface CompactPuzzlePoolDocument {
  format: 'stack-beam-puzzle-pool-v2';
  generatedAt: string;
  encoding: {
    initialMap: {
      empty: '0';
      fixedBlock: 'B';
    };
  };
  puzzles: Record<Difficulty, CompactPuzzleDefinition[]>;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasDifficulty(value: unknown): value is Difficulty {
  return value === 'easy' || value === 'normal' || value === 'hard';
}

function isGridPosition(value: unknown): value is { x: number; y: number } {
  if (!isObject(value)) {
    return false;
  }

  return typeof value.x === 'number' && typeof value.y === 'number';
}

function isRuntimeAction(value: unknown): boolean {
  if (!isObject(value) || typeof value.type !== 'string') {
    return false;
  }

  if (value.type === 'place-block') {
    return isGridPosition(value.position);
  }

  if (value.type === 'fire-edge') {
    if (!isObject(value.edge)) {
      return false;
    }

    return (
      (value.edge.side === 'top' ||
        value.edge.side === 'right' ||
        value.edge.side === 'bottom' ||
        value.edge.side === 'left') &&
      typeof value.edge.index === 'number'
    );
  }

  return false;
}

function isTargetImage(value: unknown): boolean {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((row) => Array.isArray(row));
}

function isLegacyLevelLike(value: unknown): value is Level {
  if (!isObject(value)) {
    return false;
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.description !== 'string' ||
    typeof value.gridSize !== 'number' ||
    !Array.isArray(value.fixedBlocks) ||
    typeof value.playerBlockCount !== 'number' ||
    !isTargetImage(value.targetImage)
  ) {
    return false;
  }

  if (!value.fixedBlocks.every((position) => isGridPosition(position))) {
    return false;
  }

  if (value.metadata === undefined) {
    return true;
  }

  if (!isObject(value.metadata)) {
    return false;
  }

  if (value.metadata.difficulty !== undefined && !hasDifficulty(value.metadata.difficulty)) {
    return false;
  }

  if (value.metadata.solution !== undefined) {
    if (!Array.isArray(value.metadata.solution) || !value.metadata.solution.every((action) => isRuntimeAction(action))) {
      return false;
    }
  }

  if (value.metadata.solutionNotation !== undefined) {
    if (!Array.isArray(value.metadata.solutionNotation) || !value.metadata.solutionNotation.every((item) => typeof item === 'string')) {
      return false;
    }
  }

  return true;
}

function parseInitialMap(initialMap: string[]): { gridSize: number; fixedBlocks: Level['fixedBlocks'] } {
  if (!Array.isArray(initialMap) || initialMap.length === 0) {
    throw new Error('initialMap must be a non-empty array of strings.');
  }

  const gridSize = initialMap.length;
  const fixedBlocks: Level['fixedBlocks'] = [];

  for (let y = 0; y < initialMap.length; y += 1) {
    const row = initialMap[y];

    if (typeof row !== 'string') {
      throw new Error('initialMap rows must be strings.');
    }

    if (row.length !== gridSize) {
      throw new Error(`initialMap must be square. Row ${y} has length ${row.length}, expected ${gridSize}.`);
    }

    for (let x = 0; x < row.length; x += 1) {
      const symbol = row[x]!;

      if (symbol === '0') {
        continue;
      }

      if (symbol === 'B' || symbol === '1') {
        fixedBlocks.push({ x, y });
        continue;
      }

      throw new Error(`Unsupported initialMap symbol "${symbol}" at (${x},${y}).`);
    }
  }

  return { gridSize, fixedBlocks };
}

function parseCompactPuzzleDefinition(
  raw: unknown,
  difficulty: Difficulty,
): Level {
  if (!isObject(raw)) {
    throw new Error(`Compact puzzle definition for "${difficulty}" must be an object.`);
  }

  if (
    typeof raw.id !== 'string' ||
    typeof raw.title !== 'string' ||
    typeof raw.playerBlockCount !== 'number' ||
    !Array.isArray(raw.initialMap)
  ) {
    throw new Error(`Compact puzzle definition for "${difficulty}" misses required fields.`);
  }

  const solutionNotationRaw = raw.solutionNotation;

  if (!(typeof solutionNotationRaw === 'string' || Array.isArray(solutionNotationRaw))) {
    throw new Error(`Compact puzzle "${raw.id}" has invalid solutionNotation.`);
  }

  const { gridSize, fixedBlocks } = parseInitialMap(raw.initialMap as string[]);

  if (gridSize !== 16) {
    throw new Error(`Compact puzzle "${raw.id}" has gridSize=${gridSize}. Expected 16.`);
  }

  const solution = parseSolutionNotation(solutionNotationRaw as string | string[]);

  return createLevelFromBlueprint({
    id: raw.id,
    title: raw.title,
    description: typeof raw.description === 'string' ? raw.description : `Generated ${difficulty} puzzle.`,
    playerBlockCount: raw.playerBlockCount,
    fixedBlocks,
    solution,
    difficulty,
  });
}

function encodeInitialMap(level: Level): string[] {
  const grid = Array.from({ length: level.gridSize }, () =>
    Array.from({ length: level.gridSize }, () => '0'),
  );

  for (const block of level.fixedBlocks) {
    if (grid[block.y]?.[block.x] !== undefined) {
      grid[block.y]![block.x] = 'B';
    }
  }

  return grid.map((row) => row.join(''));
}

export function toCompactPuzzlePoolDocument(
  puzzles: PuzzlePool,
  generatedAt = new Date().toISOString(),
): CompactPuzzlePoolDocument {
  function toNotation(level: Level): string {
    return (level.metadata?.solutionNotation ?? []).join(' ');
  }

  return {
    format: 'stack-beam-puzzle-pool-v2',
    generatedAt,
    encoding: {
      initialMap: {
        empty: '0',
        fixedBlock: 'B',
      },
    },
    puzzles: {
      easy: puzzles.easy.map((level) => ({
        id: level.id,
        title: level.title,
        description: level.description,
        playerBlockCount: level.playerBlockCount,
        initialMap: encodeInitialMap(level),
        solutionNotation: toNotation(level),
      })),
      normal: puzzles.normal.map((level) => ({
        id: level.id,
        title: level.title,
        description: level.description,
        playerBlockCount: level.playerBlockCount,
        initialMap: encodeInitialMap(level),
        solutionNotation: toNotation(level),
      })),
      hard: puzzles.hard.map((level) => ({
        id: level.id,
        title: level.title,
        description: level.description,
        playerBlockCount: level.playerBlockCount,
        initialMap: encodeInitialMap(level),
        solutionNotation: toNotation(level),
      })),
    },
  };
}

export function createEmptyPuzzlePool(): PuzzlePool {
  return {
    easy: [],
    normal: [],
    hard: [],
  };
}

export function getLevelDifficulty(level: Level): Difficulty {
  return level.metadata?.difficulty ?? 'normal';
}

export function buildPuzzlePoolFromLevels(levels: Level[]): PuzzlePool {
  const pool = createEmptyPuzzlePool();

  for (const level of levels) {
    const difficulty = getLevelDifficulty(level);
    pool[difficulty].push(level);
  }

  return pool;
}

export function pickRandomPuzzle(levels: Level[], currentLevelId?: string): Level | null {
  if (levels.length === 0) {
    return null;
  }

  if (levels.length === 1) {
    return levels[0]!;
  }

  const pool = currentLevelId ? levels.filter((level) => level.id !== currentLevelId) : levels;
  const source = pool.length > 0 ? pool : levels;
  return source[Math.floor(Math.random() * source.length)] ?? null;
}

export function parsePuzzlePoolDocument(data: unknown): PuzzlePoolDocument {
  if (!isObject(data)) {
    throw new Error('Puzzle pool payload must be an object.');
  }

  if (!isObject(data.puzzles)) {
    throw new Error('Puzzle pool payload misses "puzzles" object.');
  }

  const pool = createEmptyPuzzlePool();

  for (const difficulty of DIFFICULTY_ORDER) {
    const rawEntries = data.puzzles[difficulty];

    if (!Array.isArray(rawEntries)) {
      throw new Error(`Puzzle list for difficulty "${difficulty}" must be an array.`);
    }

    for (const rawEntry of rawEntries) {
      if (isLegacyLevelLike(rawEntry)) {
        const level: Level = {
          ...rawEntry,
          metadata: {
            ...rawEntry.metadata,
            difficulty,
          },
        };
        pool[difficulty].push(level);
        continue;
      }

      pool[difficulty].push(parseCompactPuzzleDefinition(rawEntry, difficulty));
    }
  }

  return {
    generatedAt: typeof data.generatedAt === 'string' ? data.generatedAt : new Date().toISOString(),
    puzzles: pool,
  };
}
