import { parseEdgeKey } from '../core/grid';
import { getTargetMatchProgress } from '../core/rules';
import type { Side } from '../core/types';
import type { GameStore } from './store';

export function selectHudSummary(state: GameStore) {
  const progress = getTargetMatchProgress(state.level, state.runtime.grid);

  return {
    remainingBlocks: state.runtime.remainingPlayerBlocks,
    usedEdges: state.runtime.usedEdges.length,
    moveCount: state.runtime.moveCount,
    isWin: state.runtime.isWin,
    message: state.runtime.lastActionMessage,
    matchedCells: progress.matched,
    totalCells: progress.total,
  };
}

export function selectEdgeUsageBySide(state: GameStore): Record<Side, number> {
  const usage: Record<Side, number> = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  for (const key of state.runtime.usedEdges) {
    const edge = parseEdgeKey(key);
    usage[edge.side] += 1;
  }

  return usage;
}
