import { resolveShot } from './shots';
import { canFireEdge, canPlacePlayerBlock } from './rules';
import type {
  BlockPreview,
  EdgeShot,
  GridPosition,
  PreviewState,
  RuntimeState,
  ShotPreview,
} from './types';

export function createEmptyPreviewState(): PreviewState {
  return {
    hoveredCell: null,
    hoveredEdge: null,
    block: null,
    shot: null,
  };
}

export function getBlockPreview(runtime: RuntimeState, position: GridPosition): BlockPreview {
  const validation = canPlacePlayerBlock(runtime, position);

  return {
    position,
    canPlace: validation.ok,
    reason: validation.reason,
  };
}

export function getShotPreview(runtime: RuntimeState, edge: EdgeShot): ShotPreview {
  const validation = canFireEdge(runtime, edge);
  const shot = resolveShot(runtime.grid, edge, runtime.shots);

  return {
    edge,
    canFire: validation.ok,
    reason: validation.reason,
    path: shot.path,
    blockedBy: shot.blockedBy,
    color: shot.color,
    intersections: shot.intersections,
  };
}
