export type CellColor = 'empty' | 'cyan' | 'magenta' | 'mix' | 'white';
export type BeamColor = Extract<CellColor, 'cyan' | 'magenta'>;
export type BeamVisualColor = Exclude<CellColor, 'empty'>;
export type BlockOwner = 'fixed' | 'player';
export type BlockKind = 'solid';
export type Side = 'top' | 'right' | 'bottom' | 'left';

export interface GridPosition {
  x: number;
  y: number;
}

export interface EdgeShot {
  side: Side;
  index: number;
}

export interface Block {
  owner: BlockOwner;
  kind: BlockKind;
}

export interface Cell {
  color: CellColor;
  block: Block | null;
  beamSources: Side[];
}

export type Grid = Cell[][];
export type TargetImage = CellColor[][];

export interface LevelMetadata {
  difficulty?: 'easy' | 'normal' | 'hard';
  solution?: RuntimeAction[];
  solutionNotation?: string[];
}

export interface Level {
  id: string;
  title: string;
  description: string;
  gridSize: number;
  fixedBlocks: GridPosition[];
  playerBlockCount: number;
  targetImage: TargetImage;
  metadata?: LevelMetadata;
}

export interface ShotResult {
  edge: EdgeShot;
  color: BeamColor;
  path: GridPosition[];
  blockedBy: GridPosition | null;
  exitEdge: EdgeShot;
  intersections: BeamIntersection[];
}

export interface BeamIntersection {
  position: GridPosition;
  pathIndex: number;
  incomingColor: BeamVisualColor;
  outgoingColor: BeamVisualColor;
}

export interface RuntimeState {
  grid: Grid;
  remainingPlayerBlocks: number;
  usedEdges: string[];
  shots: ShotResult[];
  performedActions: RuntimeAction[];
  isWin: boolean;
  moveCount: number;
  lastActionMessage: string | null;
}

export interface GameState {
  level: Level;
  runtime: RuntimeState;
  history: RuntimeState[];
}

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

export interface BlockPreview {
  position: GridPosition;
  canPlace: boolean;
  reason?: string;
}

export interface ShotPreview {
  edge: EdgeShot;
  canFire: boolean;
  reason?: string;
  path: GridPosition[];
  blockedBy: GridPosition | null;
  color: BeamColor;
  intersections: BeamIntersection[];
}

export interface PreviewState {
  hoveredCell: GridPosition | null;
  hoveredEdge: EdgeShot | null;
  block: BlockPreview | null;
  shot: ShotPreview | null;
}

export type RuntimeAction =
  | {
      type: 'place-block';
      position: GridPosition;
    }
  | {
      type: 'fire-edge';
      edge: EdgeShot;
    };

export type GameAction =
  | RuntimeAction
  | {
      type: 'undo';
    }
  | {
      type: 'reset';
    }
  | {
      type: 'load-level';
      level: Level;
    };

export type Action = GameAction;
