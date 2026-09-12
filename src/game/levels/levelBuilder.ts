import { createColorMatrix, extractColorMatrix } from '../core/grid';
import { createGameState, reduceGameState } from '../core/reducer';
import type { Level, RuntimeAction } from '../core/types';
import { formatSolutionNotation } from './solution';

export interface LevelBlueprint {
  id: string;
  title: string;
  description: string;
  playerBlockCount: number;
  fixedBlocks: Level['fixedBlocks'];
  solution: RuntimeAction[];
  difficulty?: NonNullable<Level['metadata']>['difficulty'];
}

export function createLevelFromBlueprint(blueprint: LevelBlueprint): Level {
  const draftLevel: Level = {
    id: blueprint.id,
    title: blueprint.title,
    description: blueprint.description,
    gridSize: 16,
    fixedBlocks: blueprint.fixedBlocks,
    playerBlockCount: blueprint.playerBlockCount,
    targetImage: createColorMatrix(16),
    metadata: {
      difficulty: blueprint.difficulty,
      solution: blueprint.solution,
      solutionNotation: formatSolutionNotation(blueprint.solution),
    },
  };

  let state = createGameState(draftLevel);

  for (const action of blueprint.solution) {
    state = reduceGameState(state, action);
  }

  return {
    ...draftLevel,
    targetImage: extractColorMatrix(state.runtime.grid),
  };
}
