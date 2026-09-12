import { blendCellColor } from './colors';
import { createEdgeKey, getCell, isInsideGrid } from './grid';
import { getShotBeamColorAtPathIndex } from './shots';
import type {
  EdgeShot,
  Grid,
  GridPosition,
  Level,
  RuntimeState,
  ShotResult,
  ValidationResult,
} from './types';

export interface MatchProgress {
  matched: number;
  total: number;
}

export function canPlacePlayerBlock(
  runtime: RuntimeState,
  position: GridPosition,
): ValidationResult {
  const size = runtime.grid.length;

  if (!isInsideGrid(size, position)) {
    return { ok: false, reason: 'Outside of the playable grid.' };
  }

  if (runtime.remainingPlayerBlocks <= 0) {
    return { ok: false, reason: 'No player blocks remaining.' };
  }

  const cell = getCell(runtime.grid, position);

  if (cell.block) {
    return { ok: false, reason: 'A block already occupies this cell.' };
  }

  if (cell.color !== 'empty') {
    return { ok: false, reason: 'Colored cells can no longer receive blocks.' };
  }

  return { ok: true };
}

export function canFireEdge(runtime: RuntimeState, edge: EdgeShot): ValidationResult {
  if (runtime.usedEdges.includes(createEdgeKey(edge))) {
    return { ok: false, reason: 'This edge node has already been used.' };
  }

  return { ok: true };
}

export function applyShotToGrid(grid: Grid, shot: ShotResult): void {
  for (const [pathIndex, position] of shot.path.entries()) {
    const cell = getCell(grid, position);
    const beamColor = getShotBeamColorAtPathIndex(shot, pathIndex);
    cell.color = blendCellColor(cell.color, beamColor);

    if (!cell.beamSources.includes(shot.edge.side)) {
      cell.beamSources.push(shot.edge.side);
    }
  }
}

export function getTargetMatchProgress(level: Level, grid: Grid): MatchProgress {
  const total = level.gridSize * level.gridSize;
  let matched = 0;

  for (let y = 0; y < level.gridSize; y += 1) {
    for (let x = 0; x < level.gridSize; x += 1) {
      if (grid[y]![x]!.color === level.targetImage[y]![x]) {
        matched += 1;
      }
    }
  }

  return { matched, total };
}

export function isLevelSolved(level: Level, grid: Grid): boolean {
  const progress = getTargetMatchProgress(level, grid);
  return progress.matched === progress.total;
}
