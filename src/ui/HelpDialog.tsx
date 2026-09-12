import { useState } from 'react';
import { useGameStore } from '../game/state/store';
import { t } from '../i18n/text';

export function HelpDialog() {
  const [open, setOpen] = useState(false);
  const language = useGameStore((state) => state.language);

  return (
    <>
      <button
        type="button"
        className={`help-button${open ? ' help-button--active' : ''}`}
        aria-pressed={open}
        onClick={() => setOpen(true)}
      >
        {t(language, 'controls.help')}
      </button>

      {open ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={t(language, 'help.dialogAria')}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-card__header">
              <div>
                <p className="panel-label">{t(language, 'controls.help')}</p>
                <h2>{t(language, 'help.title')}</h2>
              </div>
              <button type="button" className="help-button help-button--ghost" onClick={() => setOpen(false)}>
                {t(language, 'help.close')}
              </button>
            </div>

            <div className="modal-card__body">
              <p>{t(language, 'help.rule.1')}</p>
              <p>{t(language, 'help.rule.2')}</p>
              <p>{t(language, 'help.rule.3')}</p>
              <p>{t(language, 'help.rule.4')}</p>
              <p>{t(language, 'help.rule.5')}</p>
            </div>

            <div className="panel-section help-color-guide">
              <p className="panel-label">{t(language, 'help.color.title')}</p>

              <div className="help-color-guide__sources">
                <div className="help-color-guide__source-item">
                  <span className="help-color-swatch help-color-swatch--cyan" aria-hidden="true" />
                  <span>{t(language, 'help.color.source.cyan')}</span>
                </div>
                <div className="help-color-guide__source-item">
                  <span className="help-color-swatch help-color-swatch--magenta" aria-hidden="true" />
                  <span>{t(language, 'help.color.source.magenta')}</span>
                </div>
              </div>

              <div className="help-color-guide__examples">
                <div className="help-color-guide__example">
                  <span className="help-color-swatch help-color-swatch--empty" aria-hidden="true" />
                  <span className="help-color-guide__op">+</span>
                  <span className="help-color-swatch help-color-swatch--cyan" aria-hidden="true" />
                  <span className="help-color-guide__op">=</span>
                  <span className="help-color-swatch help-color-swatch--cyan" aria-hidden="true" />
                  <span className="help-color-guide__text">{t(language, 'help.color.rule.empty')}</span>
                </div>

                <div className="help-color-guide__example">
                  <span className="help-color-swatch help-color-swatch--magenta" aria-hidden="true" />
                  <span className="help-color-guide__op">+</span>
                  <span className="help-color-swatch help-color-swatch--magenta" aria-hidden="true" />
                  <span className="help-color-guide__op">=</span>
                  <span className="help-color-swatch help-color-swatch--magenta" aria-hidden="true" />
                  <span className="help-color-guide__text">{t(language, 'help.color.rule.same')}</span>
                </div>

                <div className="help-color-guide__example">
                  <span className="help-color-swatch help-color-swatch--cyan" aria-hidden="true" />
                  <span className="help-color-guide__op">+</span>
                  <span className="help-color-swatch help-color-swatch--magenta" aria-hidden="true" />
                  <span className="help-color-guide__op">=</span>
                  <span className="help-color-swatch help-color-swatch--mix" aria-hidden="true" />
                  <span className="help-color-guide__text">{t(language, 'help.color.rule.mix')}</span>
                </div>

                <div className="help-color-guide__example">
                  <span className="help-color-swatch help-color-swatch--mix" aria-hidden="true" />
                  <span className="help-color-guide__op">+</span>
                  <span className="help-color-swatch help-color-swatch--cyan" aria-hidden="true" />
                  <span className="help-color-guide__op">=</span>
                  <span className="help-color-swatch help-color-swatch--white" aria-hidden="true" />
                  <span className="help-color-guide__text">{t(language, 'help.color.rule.white')}</span>
                </div>

                <div className="help-color-guide__example">
                  <span className="help-color-swatch help-color-swatch--white" aria-hidden="true" />
                  <span className="help-color-guide__op">+</span>
                  <span className="help-color-swatch help-color-swatch--magenta" aria-hidden="true" />
                  <span className="help-color-guide__op">=</span>
                  <span className="help-color-swatch help-color-swatch--white" aria-hidden="true" />
                  <span className="help-color-guide__text">{t(language, 'help.color.rule.lockWhite')}</span>
                </div>
              </div>

              <p className="target-panel__summary">{t(language, 'help.color.note')}</p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
