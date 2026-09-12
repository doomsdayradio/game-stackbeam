import { blendBeamVisualColor, getBeamColorForSide } from './colors';
import { getCell, isInsideGrid } from './grid';
import type {
  BeamIntersection,
  BeamVisualColor,
  CellColor,
  EdgeShot,
  Grid,
  GridPosition,
  ShotResult,
} from './types';

interface ShotVector {
  start: GridPosition;
  delta: GridPosition;
  exitEdge: EdgeShot;
}

function getShotVector(edge: EdgeShot, size: number): ShotVector {
  switch (edge.side) {
    case 'top':
      return {
        start: { x: edge.index, y: 0 },
        delta: { x: 0, y: 1 },
        exitEdge: { side: 'bottom', index: edge.index },
      };
    case 'bottom':
      return {
        start: { x: edge.index, y: size - 1 },
        delta: { x: 0, y: -1 },
        exitEdge: { side: 'top', index: edge.index },
      };
    case 'left':
      return {
        start: { x: 0, y: edge.index },
        delta: { x: 1, y: 0 },
        exitEdge: { side: 'right', index: edge.index },
      };
    case 'right':
      return {
        start: { x: size - 1, y: edge.index },
        delta: { x: -1, y: 0 },
        exitEdge: { side: 'left', index: edge.index },
      };
  }
}

export function getShotBeamColorAtPathIndex(shot: ShotResult, pathIndex: number): BeamVisualColor {
  let currentColor: BeamVisualColor = shot.color;

  for (const intersection of shot.intersections) {
    if (pathIndex < intersection.pathIndex) {
      break;
    }

    if (pathIndex === intersection.pathIndex) {
      return 'white';
    }

    currentColor = intersection.outgoingColor;
  }

  return currentColor;
}

function getEncounteredBeamColor(
  shots: ShotResult[],
  position: GridPosition,
): BeamVisualColor | 'empty' {
  let aggregate: BeamVisualColor | 'empty' = 'empty';

  for (const shot of shots) {
    const pathIndex = shot.path.findIndex(
      (pathPosition) => pathPosition.x === position.x && pathPosition.y === position.y,
    );

    if (pathIndex === -1) {
      continue;
    }

    const beamColor = getShotBeamColorAtPathIndex(shot, pathIndex);

    if (aggregate === 'empty') {
      aggregate = beamColor;
    } else {
      aggregate = blendBeamVisualColor(aggregate, beamColor);
    }
  }

  return aggregate;
}

export function resolveShot(grid: Grid, edge: EdgeShot, priorShots: ShotResult[] = []): ShotResult {
  const size = grid.length;
  const vector = getShotVector(edge, size);
  const shotColor = getBeamColorForSide(edge.side);
  const path: GridPosition[] = [];
  let blockedBy: GridPosition | null = null;
  const intersections: BeamIntersection[] = [];
  let currentVisualColor: BeamVisualColor = shotColor;
  let cursor: GridPosition = { ...vector.start };

  while (isInsideGrid(size, cursor)) {
    const cell = getCell(grid, cursor);

    if (cell.block) {
      blockedBy = { ...cursor };
      break;
    }

    const encounteredBeamColor = getEncounteredBeamColor(priorShots, cursor);
    const encounteredColor = encounteredBeamColor !== 'empty' ? encounteredBeamColor : cell.color;

    if (encounteredColor !== 'empty') {
      currentVisualColor = blendBeamVisualColor(currentVisualColor, encounteredColor);
      intersections.push({
        position: { ...cursor },
        pathIndex: path.length,
        incomingColor: encounteredColor,
        outgoingColor: currentVisualColor,
      });
    }

    path.push({ ...cursor });
    cursor = {
      x: cursor.x + vector.delta.x,
      y: cursor.y + vector.delta.y,
    };
  }

  return {
    edge: { ...edge },
    color: shotColor,
    path,
    blockedBy,
    exitEdge: vector.exitEdge,
    intersections,
  };
}
