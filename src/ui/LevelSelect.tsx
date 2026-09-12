import { useGameStore } from '../game/state/store';
import { getLocalizedLevelTitle, t } from '../i18n/text';

export function LevelSelect() {
  const language = useGameStore((state) => state.language);
  const levels = useGameStore((state) => state.levels);
  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const loadLevel = useGameStore((state) => state.loadLevel);

  return (
    <div className="level-grid">
      {levels.map((level) => (
        <button
          key={level.id}
          type="button"
          className={`level-button${level.id === currentLevelId ? ' level-button--active' : ''}`}
          onClick={() => loadLevel(level.id)}
        >
          <span className="level-button__title">{getLocalizedLevelTitle(level, language)}</span>
          <span className="level-button__meta">
            {(level.metadata?.difficulty ? t(language, `difficulty.${level.metadata.difficulty}` as const) : 'mvp')} · {level.playerBlockCount} {t(language, 'difficulty.blocks')}
          </span>
        </button>
      ))}
    </div>
  );
}
