import { useEffect, useMemo, useState } from 'react';
import { describeRuntimeAction, getSolutionProgress, validateLevelAgainstSolution } from '../game/levels/solution';
import { useGameStore } from '../game/state/store';
import { t, translateCoreMessage } from '../i18n/text';

export function HintDialog() {
  const [open, setOpen] = useState(false);
  const [hintRequested, setHintRequested] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const language = useGameStore((state) => state.language);
  const level = useGameStore((state) => state.level);
  const runtime = useGameStore((state) => state.runtime);
  const validation = useMemo(() => validateLevelAgainstSolution(level), [level]);
  const progress = useMemo(() => getSolutionProgress(level, runtime), [level, runtime]);

  useEffect(() => {
    setHintRequested(false);
    setShowSolution(false);
  }, [level.id, open]);

  let hintText = t(language, 'help.hint.default');

  if (hintRequested) {
    if (progress.status === 'solved') {
      hintText = t(language, 'help.hint.solved');
    } else if (progress.status === 'missing') {
      hintText = t(language, 'help.hint.missing');
    } else if (progress.status === 'diverged') {
      hintText = t(language, 'help.hint.diverged');
    } else if (progress.nextAction) {
      hintText = describeRuntimeAction(progress.nextAction, language);
    } else {
      hintText = t(language, 'help.hint.none');
    }
  }

  return (
    <>
      <button
        type="button"
        className={`help-button${open ? ' help-button--active' : ''}`}
        aria-pressed={open}
        onClick={() => setOpen(true)}
      >
        {t(language, 'controls.solution')}
      </button>

      {open ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={t(language, 'help.canonicalTitle')}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-card__header">
              <div>
                <p className="panel-label">{t(language, 'controls.solution')}</p>
                <h2>{t(language, 'help.canonicalTitle')}</h2>
              </div>
              <button type="button" className="help-button help-button--ghost" onClick={() => setOpen(false)}>
                {t(language, 'help.close')}
              </button>
            </div>

            <div className="modal-card__body">
              <p className="target-panel__summary">
                {validation.ok
                  ? t(language, 'help.validationOk', { steps: validation.totalSteps })
                  : validation.reason
                    ? translateCoreMessage(validation.reason, language)
                    : t(language, 'help.validationFailed')}
              </p>

              <div className="control-row">
                <button type="button" className="control-button" onClick={() => setHintRequested(true)}>
                  {t(language, 'help.hint')}
                </button>
                <button
                  type="button"
                  className="control-button"
                  onClick={() => setShowSolution((value) => !value)}
                >
                  {showSolution ? t(language, 'help.hideSolution') : t(language, 'help.showSolution')}
                </button>
              </div>

              <div className="message-box">
                {hintRequested ? (
                  <>
                    <strong>
                      {t(language, 'help.step', {
                        step: Math.min(progress.completedSteps + 1, Math.max(progress.totalSteps, 1)),
                      })}
                    </strong>{' '}
                    {hintText}
                  </>
                ) : (
                  hintText
                )}
              </div>

              <div className="panel-section notation-guide">
                <p className="panel-label">{t(language, 'help.notationExplainTitle')}</p>
                {level.metadata?.solutionNotation?.length ? (
                  <p className="target-panel__summary">
                    {t(language, 'help.notationLabel')}: {level.metadata.solutionNotation.join('  ')}
                  </p>
                ) : null}
                <p className="target-panel__summary">{t(language, 'help.notationExplainIntro')}</p>
                <p className="notation-guide__item">
                  <span className="notation-token">T/B/L/R + Hex-Slot</span>
                  {t(language, 'help.notationExplainEdge')}
                </p>
                <p className="notation-guide__item">
                  <span className="notation-token">X + Hex-XY</span>
                  {t(language, 'help.notationExplainBlock')}
                </p>
                <p className="target-panel__summary">{t(language, 'help.notationExplainHex')}</p>
                <p className="target-panel__summary">{t(language, 'help.notationExplainExamples')}</p>

                <p className="panel-label">{t(language, 'help.notationExplainDecodeTitle')}</p>
                <ol className="notation-guide__list">
                  <li>{t(language, 'help.notationExplainDecode.1')}</li>
                  <li>{t(language, 'help.notationExplainDecode.2')}</li>
                  <li>{t(language, 'help.notationExplainDecode.3')}</li>
                  <li>{t(language, 'help.notationExplainDecode.4')}</li>
                </ol>

                <p className="panel-label">{t(language, 'help.notationExplainExamplesTitle')}</p>
                <ul className="notation-guide__list">
                  <li>
                    <span className="notation-token">T4</span>
                    {t(language, 'help.notationExplainExample.1')}
                  </li>
                  <li>
                    <span className="notation-token">RA</span>
                    {t(language, 'help.notationExplainExample.2')}
                  </li>
                  <li>
                    <span className="notation-token">X6A</span>
                    {t(language, 'help.notationExplainExample.3')}
                  </li>
                </ul>
              </div>

              {showSolution ? (
                <ol className="solution-list">
                  {progress.solution.map((action, index) => {
                    const isCompleted = index < progress.matchedPrefixLength;
                    const isCurrent =
                      progress.status === 'available' && index === progress.matchedPrefixLength;
                    const isDivergedStep =
                      progress.status === 'diverged' &&
                      index === progress.matchedPrefixLength &&
                      progress.matchedPrefixLength < progress.totalSteps;

                    return (
                      <li
                        key={`${action.type}-${index}`}
                        className={`solution-item${isCompleted ? ' solution-item--completed' : ''}${isCurrent ? ' solution-item--current' : ''}${isDivergedStep ? ' solution-item--diverged' : ''}`}
                      >
                        {describeRuntimeAction(action, language)}
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
