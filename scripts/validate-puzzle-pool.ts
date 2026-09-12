import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { formatSolutionNotation, validateLevelAgainstSolution } from '../src/game/levels/solution';
import { DIFFICULTY_ORDER, parsePuzzlePoolDocument, type Difficulty } from '../src/game/levels/puzzlePool';

async function main() {
  const inputPath = path.resolve(process.cwd(), 'public', 'puzzles', 'puzzle-pool.json');
  const raw = await readFile(inputPath, 'utf8');
  const payload: unknown = JSON.parse(raw);
  const document = parsePuzzlePoolDocument(payload);
  let failedCount = 0;
  let totalCount = 0;

  console.log(`Validating puzzle pool generated at ${document.generatedAt}`);

  for (const difficulty of DIFFICULTY_ORDER) {
    const levels = document.puzzles[difficulty];
    console.log(`\n[${difficulty}] ${levels.length} puzzle(s)`);

    for (const level of levels) {
      totalCount += 1;
      const validation = validateLevelAgainstSolution(level);
      const mismatch = validateNotation(level, difficulty);
      const issues = [validation.ok ? null : validation.reason, mismatch].filter(Boolean);

      if (issues.length > 0) {
        failedCount += 1;
        console.log(`FAIL ${level.id}`);
        for (const issue of issues) {
          console.log(`  - ${issue}`);
        }
        continue;
      }

      console.log(`OK   ${level.id} (${validation.totalSteps} steps)`);
    }
  }

  if (failedCount > 0) {
    console.log(`\nValidation failed: ${failedCount}/${totalCount} puzzle(s) have issues.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nValidation passed: ${totalCount} puzzle(s)`);
}

function validateNotation(
  level: Parameters<typeof validateLevelAgainstSolution>[0],
  expectedDifficulty: Difficulty,
): string | null {
  if (level.metadata?.difficulty !== expectedDifficulty) {
    return `Difficulty mismatch: metadata=${String(level.metadata?.difficulty)} expected=${expectedDifficulty}`;
  }

  const solution = level.metadata?.solution ?? [];
  const expectedNotation = formatSolutionNotation(solution);
  const actualNotation = level.metadata?.solutionNotation ?? [];

  if (expectedNotation.length !== actualNotation.length) {
    return `Notation length mismatch: expected=${expectedNotation.length} actual=${actualNotation.length}`;
  }

  for (let index = 0; index < expectedNotation.length; index += 1) {
    if (expectedNotation[index] !== actualNotation[index]) {
      return `Notation mismatch at step ${index + 1}: expected=${expectedNotation[index]} actual=${actualNotation[index]}`;
    }
  }

  return null;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
