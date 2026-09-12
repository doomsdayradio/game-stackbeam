import { useGameStore } from '../game/state/store';
import { t, type Language } from '../i18n/text';
import type { Difficulty } from '../game/levels/puzzlePool';
import { BackgroundMusicPlayer } from './BackgroundMusicPlayer';
import { HelpDialog } from './HelpDialog';
import { HintDialog } from './HintDialog';

interface BoardTopBarProps {
  showTargetOverlay: boolean;
  onToggleTargetOverlay: () => void;
}

export function BoardTopBar({ showTargetOverlay, onToggleTargetOverlay }: BoardTopBarProps) {
  const language = useGameStore((state) => state.language);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const totalPlayerBlocks = useGameStore((state) => state.level.playerBlockCount);
  const remainingPlayerBlocks = useGameStore((state) => state.runtime.remainingPlayerBlocks);
  const selectedDifficulty = useGameStore((state) => state.selectedDifficulty);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const nextPuzzle = useGameStore((state) => state.nextPuzzle);
  const canUndo = useGameStore((state) => state.history.length > 0);
  const undo = useGameStore((state) => state.undo);
  const reset = useGameStore((state) => state.reset);
  const targetOverlayStateText = showTargetOverlay ? t(language, 'state.on') : t(language, 'state.off');
  const targetToggleLabel = t(language, 'controls.targetWithState', { state: targetOverlayStateText });

  return (
    <div className="board-topbar">
      <div className="board-topbar__header">
        <h1 className="board-topbar__title">Stack-Beam</h1>
        <div className="board-topbar__nav">
          <a className="help-button help-button--ghost board-topbar__link" href="../index.html">
            {t(language, 'controls.backToGames')}
          </a>
          <a
            className="help-button help-button--ghost board-topbar__link"
            href="../../story/lore/Gruppen/DerStack/der-stack.html"
          >
            {t(language, 'controls.loreStack')}
          </a>
        </div>
      </div>
      <div className="board-topbar__row">
        <div className="block-window" aria-label={t(language, 'blocks.label')}>
          <span className="block-window__label">{t(language, 'blocks.label')}</span>
          <div className="block-window__slots">
            {Array.from({ length: totalPlayerBlocks }, (_, index) => {
              const isUsed = index >= remainingPlayerBlocks;

              return (
                <span
                  key={`reserve-block-${index}`}
                  className={`block-window__slot${isUsed ? ' block-window__slot--used' : ''}`}
                />
              );
            })}
          </div>
        </div>

        <div className="board-topbar__controls">
          <div className="board-topbar__controls-row">
            <select
              className="level-select-inline level-select-inline--difficulty"
              value={selectedDifficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty)}
              aria-label={t(language, 'difficulty.label')}
            >
              <option value="easy">{t(language, 'difficulty.easy')}</option>
              <option value="normal">{t(language, 'difficulty.normal')}</option>
              <option value="hard">{t(language, 'difficulty.hard')}</option>
            </select>
            <select
              className="level-select-inline language-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              aria-label={t(language, 'language.label')}
            >
              <option value="en">{t(language, 'language.en')}</option>
              <option value="de">{t(language, 'language.de')}</option>
            </select>
            <button
              type="button"
              className={`help-button${showTargetOverlay ? ' help-button--active' : ''}`}
              aria-label={targetToggleLabel}
              title={targetToggleLabel}
              onClick={onToggleTargetOverlay}
            >
              {targetToggleLabel}
            </button>
            <BackgroundMusicPlayer />
          </div>

          <div className="board-topbar__controls-row">
            <button type="button" className="control-button" onClick={undo} disabled={!canUndo}>
              {t(language, 'controls.undo')}
            </button>
            <button type="button" className="control-button" onClick={reset}>
              {t(language, 'controls.reset')}
            </button>
            <button type="button" className="control-button" onClick={nextPuzzle}>
              {t(language, 'controls.nextPuzzle')}
            </button>
            <HelpDialog />
            <HintDialog />
          </div>
        </div>
      </div>

    </div>
  );
}
