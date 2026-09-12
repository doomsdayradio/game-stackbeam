import { cloneRuntimeState, createEdgeKey, createGrid, getCell, getOppositeEdge } from './grid';
import { resolveShot } from './shots';
import { applyShotToGrid, canFireEdge, canPlacePlayerBlock, isLevelSolved } from './rules';
import type {
  Block,
  EdgeShot,
  GameAction,
  GameState,
  GridPosition,
  Level,
  RuntimeState,
} from './types';

const fixedBlock: Block = {
  owner: 'fixed',
  kind: 'solid',
};

const playerBlock: Block = {
  owner: 'player',
  kind: 'solid',
};

function finalizeRuntime(level: Level, runtime: RuntimeState, lastActionMessage: string | null) {
  runtime.isWin = isLevelSolved(level, runtime.grid);
  runtime.lastActionMessage = lastActionMessage;
}

export function createRuntimeState(level: Level): RuntimeState {
  const grid = createGrid(level.gridSize);

  for (const position of level.fixedBlocks) {
    getCell(grid, position).block = { ...fixedBlock };
  }

  const runtime: RuntimeState = {
    grid,
    remainingPlayerBlocks: level.playerBlockCount,
    usedEdges: [],
    shots: [],
    performedActions: [],
    isWin: false,
    moveCount: 0,
    lastActionMessage: null,
  };

  finalizeRuntime(level, runtime, null);
  return runtime;
}

export function createGameState(level: Level): GameState {
  return {
    level,
    runtime: createRuntimeState(level),
    history: [],
  };
}

function withRuntimeMessage(state: GameState, message: string): GameState {
  const runtime = cloneRuntimeState(state.runtime);
  finalizeRuntime(state.level, runtime, message);

  return {
    ...state,
    runtime,
  };
}

function commitRuntime(state: GameState, nextRuntime: RuntimeState): GameState {
  return {
    ...state,
    runtime: nextRuntime,
    history: [...state.history, cloneRuntimeState(state.runtime)],
  };
}

function placePlayerBlock(state: GameState, position: GridPosition): GameState {
  const validation = canPlacePlayerBlock(state.runtime, position);

  if (!validation.ok) {
    return withRuntimeMessage(state, validation.reason ?? 'Block placement is not allowed.');
  }

  const runtime = cloneRuntimeState(state.runtime);
  getCell(runtime.grid, position).block = { ...playerBlock };
  runtime.remainingPlayerBlocks -= 1;
  runtime.performedActions.push({
    type: 'place-block',
    position: { ...position },
  });
  runtime.moveCount += 1;
  finalizeRuntime(state.level, runtime, null);

  return commitRuntime(state, runtime);
}

function fireEdge(state: GameState, edge: EdgeShot): GameState {
  const validation = canFireEdge(state.runtime, edge);

  if (!validation.ok) {
    return withRuntimeMessage(state, validation.reason ?? 'This edge node cannot fire again.');
  }

  const runtime = cloneRuntimeState(state.runtime);
  const shot = resolveShot(runtime.grid, edge, runtime.shots);
  applyShotToGrid(runtime.grid, shot);
  const edgeKeys = [createEdgeKey(edge)];

  // Opposite edge is consumed only when the beam reaches the far side without being blocked.
  if (!shot.blockedBy) {
    edgeKeys.push(createEdgeKey(getOppositeEdge(edge)));
  }

  for (const edgeKey of edgeKeys) {
    if (!runtime.usedEdges.includes(edgeKey)) {
      runtime.usedEdges.push(edgeKey);
    }
  }

  runtime.shots.push(shot);
  runtime.performedActions.push({
    type: 'fire-edge',
    edge: { ...edge },
  });
  runtime.moveCount += 1;
  finalizeRuntime(state.level, runtime, null);

  return commitRuntime(state, runtime);
}

export function reduceGameState(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'load-level':
      return createGameState(action.level);
    case 'reset':
      return createGameState(state.level);
    case 'undo': {
      const previous = state.history[state.history.length - 1];

      if (!previous) {
        return withRuntimeMessage(state, 'Nothing to undo yet.');
      }

      return {
        ...state,
        runtime: cloneRuntimeState(previous),
        history: state.history.slice(0, -1),
      };
    }
    case 'place-block':
      return placePlayerBlock(state, action.position);
    case 'fire-edge':
      return fireEdge(state, action.edge);
    default:
      return state;
  }
}
