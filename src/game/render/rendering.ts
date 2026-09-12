import type {
  BeamColor,
  BeamVisualColor,
  BlockOwner,
  CellColor,
  EdgeShot,
  GridPosition,
  Side,
} from '../core/types';

export const CELL_SPACING = 1.02;
export const CELL_SIZE = 0.9;
export const TILE_HEIGHT = 0.16;
export const BLOCK_HEIGHT = 0.58;
export const EDGE_OFFSET = 1.22;
export const TOP_DOWN_CAMERA_HALF_EXTENT = 9.75;

export const VISUAL_PALETTE = {
  boardBase: '#09101f',
  boardGlow: '#101c34',
  cellBase: '#11192d',
  cyan: '#4be2ff',
  magenta: '#ff4ec4',
  mix: '#b07dff',
  white: '#ffffff',
  danger: '#ff8b93',
  preview: '#8df9ff',
  fixedBlock: '#62708e',
  fixedBlockGlow: '#ffb87f',
  playerBlock: '#7ce8ff',
  playerBlockGlow: '#65ffda',
} as const;

export function getCellVisuals(color: CellColor) {
  switch (color) {
    case 'cyan':
      return {
        surface: '#121923',
        emissive: VISUAL_PALETTE.cyan,
        intensity: 0.07,
      };
    case 'magenta':
      return {
        surface: '#18131b',
        emissive: VISUAL_PALETTE.magenta,
        intensity: 0.075,
      };
    case 'mix':
      return {
        surface: '#171723',
        emissive: VISUAL_PALETTE.mix,
        intensity: 0.09,
      };
    case 'white':
      return {
        surface: '#1a1f2a',
        emissive: VISUAL_PALETTE.white,
        intensity: 0.11,
      };
    case 'empty':
    default:
      return {
        surface: VISUAL_PALETTE.cellBase,
        emissive: '#12233d',
        intensity: 0.16,
      };
  }
}

export function getSideBeamColor(side: Side): BeamColor {
  return side === 'top' || side === 'bottom' ? 'cyan' : 'magenta';
}

export function getBeamVisualColor(color: BeamColor): string {
  return color === 'cyan' ? VISUAL_PALETTE.cyan : VISUAL_PALETTE.magenta;
}

export function getEnergyVisualColor(color: Exclude<CellColor, 'empty'>): string {
  return getBeamEnergyColor(color);
}

export function getBeamEnergyColor(color: BeamVisualColor): string {
  switch (color) {
    case 'cyan':
      return VISUAL_PALETTE.cyan;
    case 'magenta':
      return VISUAL_PALETTE.magenta;
    case 'mix':
      return VISUAL_PALETTE.mix;
    case 'white':
      return VISUAL_PALETTE.white;
  }
}

export function getBlockVisuals(owner: BlockOwner) {
  if (owner === 'fixed') {
    return {
      body: VISUAL_PALETTE.fixedBlock,
      emissive: VISUAL_PALETTE.fixedBlockGlow,
    };
  }

  return {
    body: VISUAL_PALETTE.playerBlock,
    emissive: VISUAL_PALETTE.playerBlockGlow,
  };
}

export function toHexIndex(value: number): string {
  return value.toString(16).toUpperCase();
}

export function gridToWorld(position: GridPosition, gridSize: number) {
  const half = (gridSize - 1) / 2;

  return [
    (position.x - half) * CELL_SPACING,
    0,
    (position.y - half) * CELL_SPACING,
  ] as const;
}

export function edgeToWorld(edge: EdgeShot, gridSize: number) {
  const half = ((gridSize - 1) * CELL_SPACING) / 2;

  switch (edge.side) {
    case 'top':
      return [
        gridToWorld({ x: edge.index, y: 0 }, gridSize)[0],
        0.22,
        -half - EDGE_OFFSET,
      ] as const;
    case 'bottom':
      return [
        gridToWorld({ x: edge.index, y: gridSize - 1 }, gridSize)[0],
        0.22,
        half + EDGE_OFFSET,
      ] as const;
    case 'left':
      return [
        -half - EDGE_OFFSET,
        0.22,
        gridToWorld({ x: 0, y: edge.index }, gridSize)[2],
      ] as const;
    case 'right':
      return [
        half + EDGE_OFFSET,
        0.22,
        gridToWorld({ x: gridSize - 1, y: edge.index }, gridSize)[2],
      ] as const;
  }
}

export function getBoardProjectionInsetPercent(gridSize: number): number {
  const boardWorldSize = (gridSize - 1) * CELL_SPACING + CELL_SIZE;
  const totalWorldSize = TOP_DOWN_CAMERA_HALF_EXTENT * 2;
  return ((totalWorldSize - boardWorldSize) / 2 / totalWorldSize) * 100;
}
