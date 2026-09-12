import type { Level } from '../core/types';
import { generateDifficultyLevels } from './generator';

export const levels: Level[] = generateDifficultyLevels();

export const levelsById = new Map(levels.map((level) => [level.id, level]));
