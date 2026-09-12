import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { t, type Language } from '../i18n/text';

interface WinCelebrationOverlayProps {
  open: boolean;
  language: Language;
  hasNextLevel: boolean;
  nextLevelTitle?: string;
  onNextLevel: () => void;
  onReplayLevel: () => void;
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface ConfettiPiece {
  left: number;
  delayMs: number;
  durationMs: number;
  driftPx: number;
  rotateFromDeg: number;
  rotateToDeg: number;
  color: string;
  sizePx: number;
}

const fireworkColors = ['#4be2ff', '#ff4ec4', '#b07dff', '#ffffff', '#7fffd8'];
const confettiColors = ['#4be2ff', '#ff4ec4', '#b07dff', '#fff07a', '#8cffb6', '#ffffff'];

function createConfettiPieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, index) => {
    const duration = 2500 + Math.random() * 1700;
    const size = 7 + Math.random() * 8;

    return {
      left: Math.random() * 100,
      delayMs: -(Math.random() * duration),
      durationMs: duration,
      driftPx: (Math.random() - 0.5) * 240,
      rotateFromDeg: Math.random() * 360,
      rotateToDeg: 260 + Math.random() * 620,
      color: confettiColors[index % confettiColors.length] ?? '#ffffff',
      sizePx: size,
    };
  });
}

export function WinCelebrationOverlay({
  open,
  language,
  hasNextLevel,
  nextLevelTitle,
  onNextLevel,
  onReplayLevel,
}: WinCelebrationOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiPieces = useMemo(() => createConfettiPieces(74), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const canvasElement = canvas;
    const ctx = context;
    const particles: FireworkParticle[] = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastSpawnTime = 0;
    let active = true;

    function resizeCanvas() {
      width = canvasElement.clientWidth;
      height = canvasElement.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasElement.width = Math.max(1, Math.floor(width * dpr));
      canvasElement.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnBurst(originX: number, originY: number) {
      const particleCount = 26 + Math.floor(Math.random() * 24);

      for (let index = 0; index < particleCount; index += 1) {
        const angle = (Math.PI * 2 * index) / particleCount + Math.random() * 0.4;
        const speed = 1.1 + Math.random() * 3.7;
        const maxLife = 55 + Math.random() * 42;

        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: maxLife,
          maxLife,
          size: 1.8 + Math.random() * 2.8,
          color: fireworkColors[Math.floor(Math.random() * fireworkColors.length)] ?? '#ffffff',
        });
      }
    }

    function spawnRandomBurst() {
      const originX = width * (0.14 + Math.random() * 0.72);
      const originY = height * (0.09 + Math.random() * 0.37);
      spawnBurst(originX, originY);
    }

    function drawFrame(timestamp: number) {
      if (!active) {
        return;
      }

      ctx.fillStyle = 'rgba(5, 8, 20, 0.22)';
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]!;
        particle.life -= 1;

        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.985;
        particle.vy = particle.vy * 0.985 + 0.03;

        const alpha = particle.life / particle.maxLife;
        ctx.beginPath();
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = Math.max(0.06, alpha);
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      ctx.globalAlpha = 1;

      if (timestamp - lastSpawnTime > 380) {
        spawnRandomBurst();
        lastSpawnTime = timestamp;
      }

      animationFrame = window.requestAnimationFrame(drawFrame);
    }

    resizeCanvas();
    spawnRandomBurst();
    spawnRandomBurst();
    animationFrame = window.requestAnimationFrame(drawFrame);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      active = false;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resizeCanvas);
      ctx.clearRect(0, 0, width, height);
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const nextButtonLabel =
    hasNextLevel
      ? nextLevelTitle
        ? t(language, 'win.nextLevel', { title: nextLevelTitle })
        : t(language, 'controls.nextPuzzle')
      : t(language, 'win.restartAtLevel1');

  return (
    <div className="win-overlay" role="dialog" aria-modal="true" aria-label={t(language, 'win.dialogAria')}>
      <canvas ref={canvasRef} className="win-overlay__fireworks" />
      <div className="win-overlay__confetti" aria-hidden="true">
        {confettiPieces.map((piece, index) => (
          <span
            key={`confetti-${index}`}
            className="win-overlay__confetti-piece"
            style={
              {
                left: `${piece.left}%`,
                width: `${piece.sizePx}px`,
                height: `${piece.sizePx * 0.52}px`,
                background: piece.color,
                animationDelay: `${piece.delayMs}ms`,
                animationDuration: `${piece.durationMs}ms`,
                '--confetti-drift': `${piece.driftPx}px`,
                '--confetti-rotate-start': `${piece.rotateFromDeg}deg`,
                '--confetti-rotate-end': `${piece.rotateToDeg}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <section className="win-overlay__card">
        <p className="panel-label">{t(language, 'win.levelComplete')}</p>
        <h2 className="win-overlay__title">{t(language, 'win.youWin')}</h2>
        <p className="win-overlay__subtitle">{t(language, 'win.subtitle')}</p>
        <div className="win-overlay__actions">
          <button type="button" className="control-button win-overlay__button win-overlay__button--next" onClick={onNextLevel}>
            {nextButtonLabel}
          </button>
          <button type="button" className="control-button win-overlay__button" onClick={onReplayLevel}>
            {t(language, 'win.replayLevel')}
          </button>
        </div>
      </section>
    </div>
  );
}
