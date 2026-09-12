import { levels } from '../src/game/levels/levels';
import { validateLevelAgainstSolution } from '../src/game/levels/solution';

const results = levels.map((level) => ({
  level,
  validation: validateLevelAgainstSolution(level),
}));

for (const { level, validation } of results) {
  if (validation.ok) {
    const notation = level.metadata?.solutionNotation?.join(' ') ?? '(missing)';
    const difficulty = level.metadata?.difficulty ?? 'unknown';
    console.log(`OK   ${validation.levelId} [${difficulty}] (${validation.totalSteps} steps)`);
    console.log(`     solve: ${notation}`);
  } else {
    console.log(`FAIL ${validation.levelId}: ${validation.reason}`);
  }
}

const failed = results.filter((result) => !result.validation.ok);

if (failed.length > 0) {
  process.exitCode = 1;
} else {
  console.log(`Validated ${results.length} level(s).`);
}
