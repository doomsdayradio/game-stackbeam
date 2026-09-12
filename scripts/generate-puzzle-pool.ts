import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { generatePuzzlePool } from '../src/game/levels/generator';
import { toCompactPuzzlePoolDocument, type Difficulty } from '../src/game/levels/puzzlePool';

interface CliOptions {
  baseSeed?: number;
  counts: Partial<Record<Difficulty, number>>;
}

function parseIntegerArg(value: string | undefined, flag: string): number {
  if (!value) {
    throw new Error(`Missing value for ${flag}.`);
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid numeric value for ${flag}: ${value}`);
  }

  return parsed;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    counts: {},
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--base-seed') {
      options.baseSeed = parseIntegerArg(argv[index + 1], token);
      index += 1;
      continue;
    }

    if (token === '--easy' || token === '--normal' || token === '--hard') {
      const key = token.slice(2) as Difficulty;
      options.counts[key] = parseIntegerArg(argv[index + 1], token);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const generated = generatePuzzlePool({
    baseSeed: options.baseSeed,
    counts: options.counts,
  });
  const document = toCompactPuzzlePoolDocument(generated.puzzles, generated.generatedAt);
  const outputPath = path.resolve(process.cwd(), 'public', 'puzzles', 'puzzle-pool.json');

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

  console.log(`Wrote puzzle pool to ${outputPath}`);
  console.log(
    `easy=${document.puzzles.easy.length}, normal=${document.puzzles.normal.length}, hard=${document.puzzles.hard.length}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
