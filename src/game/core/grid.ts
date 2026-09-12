import type {
  Cell,
  CellColor,
  EdgeShot,
  GameState,
  Grid,
  GridPosition,
  RuntimeState,
  ShotResult,
  Side,
} from './types';

export function createCell(): Cell {
  return {
    color: 'empty',
    block: null,
    beamSources: [],
  };
}

export function createGrid(size: number): Grid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => createCell()));
}

export function createColorMatrix(size: number, fill: CellColor = 'empty'): CellColor[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => fill));
}

export function cloneShotResult(shot: ShotResult): ShotResult {
  return {
    ...shot,
    edge: { ...shot.edge },
    exitEdge: { ...shot.exitEdge },
    blockedBy: shot.blockedBy ? { ...shot.blockedBy } : null,
    intersections: shot.intersections.map((intersection) => ({
      position: { ...intersection.position },
      pathIndex: intersection.pathIndex,
      incomingColor: intersection.incomingColor,
      outgoingColor: intersection.outgoingColor,
    })),
    path: shot.path.map((position) => ({ ...position })),
  };
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) =>
    row.map((cell) => ({
      color: cell.color,
      block: cell.block ? { ...cell.block } : null,
      beamSources: [...cell.beamSources],
    })),
  );
}

export function cloneRuntimeState(runtime: RuntimeState): RuntimeState {
  return {
    ...runtime,
    grid: cloneGrid(runtime.grid),
    usedEdges: [...runtime.usedEdges],
    shots: runtime.shots.map(cloneShotResult),
    performedActions: runtime.performedActions.map((action) =>
      action.type === 'place-block'
        ? {
            type: 'place-block',
            position: { ...action.position },
          }
        : {
            type: 'fire-edge',
            edge: { ...action.edge },
          },
    ),
  };
}

export function cloneGameState(state: GameState): GameState {
  return {
    level: state.level,
    runtime: cloneRuntimeState(state.runtime),
    history: state.history.map(cloneRuntimeState),
  };
}

export function createPositionKey(position: GridPosition): string {
  return `${position.x}:${position.y}`;
}

export function arePositionsEqual(a: GridPosition | null, b: GridPosition | null): boolean {
  return a?.x === b?.x && a?.y === b?.y;
}

export function createEdgeKey(edge: EdgeShot): string {
  return `${edge.side}:${edge.index}`;
}

export function parseEdgeKey(key: string): EdgeShot {
  const [side, index] = key.split(':');

  return {
    side: side as Side,
    index: Number(index),
  };
}

export function getOppositeEdge(edge: EdgeShot): EdgeShot {
  switch (edge.side) {
    case 'top':
      return { side: 'bottom', index: edge.index };
    case 'bottom':
      return { side: 'top', index: edge.index };
    case 'left':
      return { side: 'right', index: edge.index };
    case 'right':
      return { side: 'left', index: edge.index };
  }
}

export function isInsideGrid(size: number, position: GridPosition): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x < size &&
    position.y < size
  );
}

export function getCell(grid: Grid, position: GridPosition): Cell {
  return grid[position.y]![position.x]!;
}

export function extractColorMatrix(grid: Grid): CellColor[][] {
  return grid.map((row) => row.map((cell) => cell.color));
}
