import { useEffect, useState } from 'react';
import { BoardCanvas } from '../game/render/BoardCanvas';
import { useGameStore } from '../game/state/store';
import { BoardTopBar } from '../ui/BoardTopBar';
import { TargetOverlay } from '../ui/TargetOverlay';
import { WinCelebrationOverlay } from '../ui/WinCelebrationOverlay';

export function App() {
  const isWin = useGameStore((state) => state.runtime.isWin);
  const language = useGameStore((state) => state.language);
  const levels = useGameStore((state) => state.levels);
  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const loadPuzzlePool = useGameStore((state) => state.loadPuzzlePool);
  const nextPuzzle = useGameStore((state) => state.nextPuzzle);
  const reset = useGameStore((state) => state.reset);
  const [showTargetOverlay, setShowTargetOverlay] = useState(true);

  useEffect(() => {
    if (isWin) {
      setShowTargetOverlay(false);
    }
  }, [isWin]);

  useEffect(() => {
    setShowTargetOverlay(true);
  }, [currentLevelId]);

  useEffect(() => {
    void loadPuzzlePool();
  }, [loadPuzzlePool]);

  return (
    <div className={`app-shell${isWin ? ' app-shell--win' : ''}`}>
      <main className="board-page">
        <BoardTopBar
          showTargetOverlay={showTargetOverlay}
          onToggleTargetOverlay={() => setShowTargetOverlay((value) => !value)}
        />

        <div className="board-canvas-shell">
          <TargetOverlay active={showTargetOverlay} />
          <BoardCanvas />
        </div>
      </main>

      <WinCelebrationOverlay
        open={isWin}
        language={language}
        hasNextLevel={levels.length > 0}
        onReplayLevel={reset}
        onNextLevel={nextPuzzle}
      />
    </div>
  );
}
