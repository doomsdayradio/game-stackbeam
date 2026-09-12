import { getBoardProjectionInsetPercent, VISUAL_PALETTE } from '../game/render/rendering';
import { useGameStore } from '../game/state/store';

const targetCellBackground: Record<string, string> = {
  empty: 'transparent',
  cyan: VISUAL_PALETTE.cyan,
  magenta: VISUAL_PALETTE.magenta,
  mix: VISUAL_PALETTE.mix,
  white: VISUAL_PALETTE.white,
};

interface TargetOverlayProps {
  active: boolean;
}

export function TargetOverlay({ active }: TargetOverlayProps) {
  const level = useGameStore((state) => state.level);

  if (!active) {
    return null;
  }

  const inset = getBoardProjectionInsetPercent(level.gridSize);

  return (
    <div
      className="target-overlay"
      style={{
        inset: `${inset}%`,
      }}
    >
      <div
        className="target-overlay__grid"
        style={{
          gridTemplateColumns: `repeat(${level.gridSize}, minmax(0, 1fr))`,
        }}
      >
        {level.targetImage.flatMap((row, y) =>
          row.map((color, x) => (
            <div
              key={`${x}-${y}`}
              className="target-overlay__cell"
              style={{
                background:
                  color === 'empty'
                    ? 'transparent'
                    : `radial-gradient(circle, ${targetCellBackground[color]}2E 0%, ${targetCellBackground[color]}16 52%, transparent 76%)`,
              }}
            />
          )),
        )}
      </div>
    </div>
  );
}
