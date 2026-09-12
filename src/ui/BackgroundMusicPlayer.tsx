import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../i18n/text';
import { useGameStore } from '../game/state/store';

type Difficulty = 'easy' | 'normal' | 'hard';

interface MusicTrack {
  title: string;
  src: string;
}

type TrackMap = Record<Difficulty, MusicTrack[]>;

const APP_BASE_URL = new URL('.', document.baseURI);

function resolveAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, '');
  return new URL(normalizedPath, APP_BASE_URL).toString();
}

function isValidTrack(value: unknown): value is MusicTrack {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<MusicTrack>;
  return typeof candidate.title === 'string' && typeof candidate.src === 'string';
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === 'easy' || value === 'normal' || value === 'hard';
}

function toTrackMap(data: unknown): TrackMap {
  if (Array.isArray(data)) {
    const validTracks = data.filter(isValidTrack);
    return {
      easy: validTracks,
      normal: validTracks,
      hard: validTracks,
    };
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid track list format.');
  }

  const record = data as Record<string, unknown>;
  const emptyMap: TrackMap = { easy: [], normal: [], hard: [] };

  for (const [difficulty, rawTracks] of Object.entries(record)) {
    if (!isDifficulty(difficulty)) {
      continue;
    }

    if (!Array.isArray(rawTracks)) {
      throw new Error(`Track list for ${difficulty} must be an array.`);
    }

    emptyMap[difficulty] = rawTracks.filter(isValidTrack);
  }

  return emptyMap;
}

function shuffleTrackSources(sources: string[], avoidFirstSrc = ''): string[] {
  const shuffled = [...sources];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }

  if (avoidFirstSrc && shuffled.length > 1 && shuffled[0] === avoidFirstSrc) {
    [shuffled[0], shuffled[1]] = [shuffled[1]!, shuffled[0]!];
  }

  return shuffled;
}

export function BackgroundMusicPlayer() {
  const language = useGameStore((state) => state.language);
  const selectedDifficulty = useGameStore((state) => state.level.metadata?.difficulty ?? 'normal');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracksByDifficulty, setTracksByDifficulty] = useState<TrackMap>({
    easy: [],
    normal: [],
    hard: [],
  });
  const [trackQueue, setTrackQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [currentTrackSrc, setCurrentTrackSrc] = useState('');
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [hasTrackListError, setHasTrackListError] = useState(false);
  const activeTracks = useMemo(
    () => tracksByDifficulty[selectedDifficulty] ?? [],
    [tracksByDifficulty, selectedDifficulty],
  );
  const activeTrackSources = useMemo(
    () => activeTracks.map((track) => resolveAssetUrl(track.src)),
    [activeTracks],
  );

  const playTrack = useCallback(async (trackSrc: string) => {
    const audio = audioRef.current;

    if (!audio || !trackSrc) {
      return;
    }

    const hasDifferentTrackLoaded = audio.src !== trackSrc;

    if (hasDifferentTrackLoaded) {
      audio.src = trackSrc;
      audio.load();
    }

    setCurrentTrackSrc(trackSrc);

    if (!audio.paused && !hasDifferentTrackLoaded) {
      return;
    }

    try {
      await audio.play();
      setNeedsUserInteraction(false);
    } catch {
      setNeedsUserInteraction(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTrackConfig() {
      try {
        const response = await fetch(resolveAssetUrl('audio/tracks.json'), { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: unknown = await response.json();
        const parsedTrackMap = toTrackMap(data);

        if (cancelled) {
          return;
        }

        setTracksByDifficulty(parsedTrackMap);
        setHasTrackListError(false);
      } catch {
        if (!cancelled) {
          setTracksByDifficulty({ easy: [], normal: [], hard: [] });
          setTrackQueue([]);
          setQueueIndex(0);
          setCurrentTrackSrc('');
          setHasTrackListError(true);
        }
      }
    }

    loadTrackConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (activeTrackSources.length === 0) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setTrackQueue([]);
      setQueueIndex(0);
      setCurrentTrackSrc('');
      setNeedsUserInteraction(false);
      return;
    }

    setTrackQueue(shuffleTrackSources(activeTrackSources, currentTrackSrc));
    setQueueIndex(0);
  }, [activeTrackSources]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!musicEnabled) {
      audio.pause();
      setNeedsUserInteraction(false);
      return;
    }

    if (trackQueue.length === 0) {
      return;
    }

    const nextTrackSrc = trackQueue[queueIndex] ?? '';
    void playTrack(nextTrackSrc);
  }, [musicEnabled, playTrack, queueIndex, trackQueue]);

  useEffect(() => {
    if (!musicEnabled || !needsUserInteraction) {
      return;
    }

    const retryPlayback = () => {
      const nextTrackSrc = trackQueue[queueIndex] ?? '';
      void playTrack(nextTrackSrc);
    };

    window.addEventListener('pointerdown', retryPlayback, { once: true });
    window.addEventListener('keydown', retryPlayback, { once: true });

    return () => {
      window.removeEventListener('pointerdown', retryPlayback);
      window.removeEventListener('keydown', retryPlayback);
    };
  }, [musicEnabled, needsUserInteraction, playTrack, queueIndex, trackQueue]);

  function handleTrackEnded() {
    if (trackQueue.length === 0) {
      return;
    }

    if (queueIndex >= trackQueue.length - 1) {
      setTrackQueue(shuffleTrackSources(activeTrackSources, currentTrackSrc));
      setQueueIndex(0);
      return;
    }

    setQueueIndex((index) => index + 1);
  }

  function toggleMusic() {
    setMusicEnabled((enabled) => !enabled);
  }

  return (
    <div className="music-player">
      <audio ref={audioRef} preload="none" onEnded={handleTrackEnded} />
      {musicEnabled ? (
        <button
          type="button"
          className={`help-button music-player__button${activeTrackSources.length > 0 ? ' help-button--active' : ''}`}
          aria-pressed="true"
          onClick={toggleMusic}
          disabled={activeTrackSources.length === 0}
          title={
            activeTrackSources.length === 0
              ? hasTrackListError
                ? t(language, 'music.noList')
                : t(language, 'music.noTracks')
              : undefined
          }
        >
          {t(language, 'controls.music')}
        </button>
      ) : (
        <button
          type="button"
          className="help-button music-player__button"
          aria-pressed="false"
          onClick={toggleMusic}
          disabled={activeTrackSources.length === 0}
          title={
            activeTrackSources.length === 0
              ? hasTrackListError
                ? t(language, 'music.noList')
                : t(language, 'music.noTracks')
              : undefined
          }
        >
          {t(language, 'controls.music')}
        </button>
      )}
    </div>
  );
}
