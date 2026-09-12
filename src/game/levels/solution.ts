import { createGameState, reduceGameState } from '../core/reducer';
import type { EdgeShot, Level, RuntimeAction, RuntimeState } from '../core/types';
import { getSideDisplayName, t, type Language } from '../../i18n/text';

export interface LevelValidationResult {
  levelId: string;
  title: string;
  ok: boolean;
  totalSteps: number;
  reason?: string;
}

export interface SolutionProgress {
  status: 'missing' | 'available' | 'diverged' | 'solved';
  totalSteps: number;
  completedSteps: number;
  matchedPrefixLength: number;
  nextAction: RuntimeAction | null;
  solution: RuntimeAction[];
}

function edgeEquals(a: EdgeShot, b: EdgeShot) {
  return a.side === b.side && a.index === b.index;
}

export function actionsEqual(a: RuntimeAction, b: RuntimeAction): boolean {
  if (a.type !== b.type) {
    return false;
  }

  if (a.type === 'place-block' && b.type === 'place-block') {
    return a.position.x === b.position.x && a.position.y === b.position.y;
  }

  if (a.type === 'fire-edge' && b.type === 'fire-edge') {
    return edgeEquals(a.edge, b.edge);
  }

  return false;
}

export function toHexIndex(value: number) {
  return value.toString(16).toUpperCase();
}

function getSideNotationPrefix(side: EdgeShot['side']) {
  switch (side) {
    case 'left':
      return 'L';
    case 'right':
      return 'R';
    case 'top':
      return 'T';
    case 'bottom':
      return 'B';
  }
}

export function formatRuntimeActionNotation(action: RuntimeAction): string {
  if (action.type === 'place-block') {
    return `X${toHexIndex(action.position.x)}${toHexIndex(action.position.y)}`;
  }

  return `${getSideNotationPrefix(action.edge.side)}${toHexIndex(action.edge.index)}`;
}

export function formatSolutionNotation(solution: RuntimeAction[]): string[] {
  return solution.map((action) => formatRuntimeActionNotation(action));
}

function parseHex(value: string, context: string): number {
  const parsed = Number.parseInt(value, 16);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid hex value for ${context}: ${value}`);
  }

  return parsed;
}

export function parseRuntimeActionNotation(token: string): RuntimeAction {
  const trimmed = token.trim().toUpperCase();

  if (!trimmed) {
    throw new Error('Empty notation token.');
  }

  if (trimmed.startsWith('X')) {
    const payload = trimmed.slice(1);

    if (payload.length !== 2) {
      throw new Error(`Invalid block notation: ${token}`);
    }

    return {
      type: 'place-block',
      position: {
        x: parseHex(payload[0]!, 'block x'),
        y: parseHex(payload[1]!, 'block y'),
      },
    };
  }

  const sideCode = trimmed[0]!;
  const indexPayload = trimmed.slice(1);

  if (!indexPayload) {
    throw new Error(`Missing edge index in notation: ${token}`);
  }

  const side =
    sideCode === 'T'
      ? 'top'
      : sideCode === 'R'
        ? 'right'
        : sideCode === 'B'
          ? 'bottom'
          : sideCode === 'L'
            ? 'left'
            : null;

  if (!side) {
    throw new Error(`Invalid edge side in notation: ${token}`);
  }

  return {
    type: 'fire-edge',
    edge: {
      side,
      index: parseHex(indexPayload, 'edge index'),
    },
  };
}

export function parseSolutionNotation(notation: string | string[]): RuntimeAction[] {
  const tokens = Array.isArray(notation)
    ? notation
    : notation
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 0);

  return tokens.map((token) => parseRuntimeActionNotation(token));
}

export function describeRuntimeAction(action: RuntimeAction, language: Language = 'de'): string {
  if (action.type === 'place-block') {
    return `${formatRuntimeActionNotation(action)} - ${t(language, 'action.placeBlock', {
      x: toHexIndex(action.position.x),
      y: toHexIndex(action.position.y),
    })}`;
  }

  return `${formatRuntimeActionNotation(action)} - ${t(language, 'action.fireEdge', {
    side: getSideDisplayName(action.edge.side, language),
    index: toHexIndex(action.edge.index),
  })}`;
}

export function getSolutionProgress(level: Level, runtime: RuntimeState): SolutionProgress {
  const solution = level.metadata?.solution ?? [];
  const completedSteps = runtime.performedActions.length;

  if (solution.length === 0) {
    return {
      status: runtime.isWin ? 'solved' : 'missing',
      totalSteps: 0,
      completedSteps,
      matchedPrefixLength: 0,
      nextAction: null,
      solution,
    };
  }

  let matchedPrefixLength = 0;

  while (
    matchedPrefixLength < completedSteps &&
    matchedPrefixLength < solution.length &&
    actionsEqual(runtime.performedActions[matchedPrefixLength]!, solution[matchedPrefixLength]!)
  ) {
    matchedPrefixLength += 1;
  }

  if (runtime.isWin) {
    return {
      status: 'solved',
      totalSteps: solution.length,
      completedSteps,
      matchedPrefixLength,
      nextAction: null,
      solution,
    };
  }

  const isFollowingCanonical = matchedPrefixLength === completedSteps && completedSteps <= solution.length;

  if (!isFollowingCanonical) {
    return {
      status: 'diverged',
      totalSteps: solution.length,
      completedSteps,
      matchedPrefixLength,
      nextAction: null,
      solution,
    };
  }

  return {
    status: 'available',
    totalSteps: solution.length,
    completedSteps,
    matchedPrefixLength,
    nextAction: solution[completedSteps] ?? null,
    solution,
  };
}

export function validateLevelAgainstSolution(level: Level): LevelValidationResult {
  const solution = level.metadata?.solution ?? [];

  if (solution.length === 0) {
    return {
      levelId: level.id,
      title: level.title,
      ok: false,
      totalSteps: 0,
      reason: 'Level has no canonical solution metadata.',
    };
  }

  let state = createGameState(level);

  for (const action of solution) {
    const nextState = reduceGameState(state, action);

    if (
      nextState.runtime.moveCount === state.runtime.moveCount &&
      nextState.runtime.lastActionMessage
    ) {
      return {
        levelId: level.id,
        title: level.title,
        ok: false,
        totalSteps: solution.length,
        reason: `Solution action rejected: ${nextState.runtime.lastActionMessage}`,
      };
    }

    state = nextState;
  }

  if (!state.runtime.isWin) {
    return {
      levelId: level.id,
      title: level.title,
      ok: false,
      totalSteps: solution.length,
      reason: 'Canonical solution did not reach the target image.',
    };
  }

  return {
    levelId: level.id,
    title: level.title,
    ok: true,
    totalSteps: solution.length,
  };
}
