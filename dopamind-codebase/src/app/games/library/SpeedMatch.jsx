// SpeedMatch v4 — Final standard. UGP owns timer. Game owns logic only.
// Brain stats: accuracy %, avg latency, best streak, card volume, speed setting
import React, { useState, useEffect, useRef } from 'react';
import { playGameSound } from '@/app/games/core_engine/gameSoundEngine';
import { GameScreen, GameMainUI, GameFooterInfo, GameControls } from '@/app/games/core_engine/GameLayout';

const SHAPES = ['●', '▲', '■', '◆', '★', '⬢'];

export default function SpeedMatch({
  isActive,
  onComplete,
  onQuit,
  onHudUpdate,
  soundEnabled,
  level = 1,
  difficultyValue = 2.5,
  sessionSeconds = 60,
  gameConfig = {}
}) {
  const [currentShape, setCurrentShape] = useState('●');
  const [feedback, setFeedback]         = useState(null); // 'correct'|'incorrect'

  // All mutable game state in refs — no stale closures
  const scoreRef    = useRef(0);
  const attRef      = useRef(0);
  const streakRef   = useRef(0);
  const maxStreakRef= useRef(0);
  const wrongRef    = useRef(0);
  const missedRef   = useRef(0);
  const latencies   = useRef([]);
  const cardStart   = useRef(Date.now());
  const cardTimer   = useRef(null);
  const prevShape   = useRef(null);
  const phaseRef    = useRef('idle'); // idle | playing | done
  const doneRef     = useRef(false);

  // Keep latest callbacks in refs so closures never go stale
  const onCompleteRef  = useRef(onComplete);
  const onHudUpdateRef = useRef(onHudUpdate);
  const soundRef       = useRef(soundEnabled);
  useEffect(() => { onCompleteRef.current  = onComplete;   }, [onComplete]);
  useEffect(() => { onHudUpdateRef.current = onHudUpdate;  }, [onHudUpdate]);
  useEffect(() => { soundRef.current       = soundEnabled; }, [soundEnabled]);

  const speedLimit = gameConfig.cardTimeLimitMs !== undefined ? gameConfig.cardTimeLimitMs : Math.max(0.8, difficultyValue || 2.5) * 1000; // ms per card, 0 = off
  const cooldownMs = gameConfig.clickCooldownMs !== undefined ? gameConfig.clickCooldownMs : 300;

  // ── endGame ── called by timeout OR isActive→false
  const endGame = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimeout(cardTimer.current);
    phaseRef.current = 'done';

    const total   = attRef.current;
    const acc     = total > 0 ? Math.round(scoreRef.current / total * 100) : 0;
    const avgLat  = latencies.current.length
      ? (latencies.current.reduce((a, b) => a + b, 0) / latencies.current.length / 1000).toFixed(3)
      : 0;

    if (soundRef.current) playGameSound('speedmatch', 'success');

    // SpeedMatch brain stats — processing speed / frontal cortex markers
    onCompleteRef.current?.({
      score:              scoreRef.current,
      attempts:           total,
      accuracy_percent:   acc,
      avg_speed_seconds:  parseFloat(avgLat),
      level_reached:      level,
      duration_seconds:   sessionSeconds,
      streak_in_game:     maxStreakRef.current,
      perfect_rounds:     0,
      game_specific: {
        speed_limit_ms:   speedLimit,
        cards_seen:       total,
        best_streak:      maxStreakRef.current,
        avg_latency_ms:   latencies.current.length
          ? Math.round(latencies.current.reduce((a,b)=>a+b,0)/latencies.current.length)
          : 0,
      },
    });
  };

  // ── nextCard ──
  const nextCard = (prev) => {
    const next = Math.random() < 0.42
      ? prev
      : SHAPES.filter(s => s !== prev)[Math.floor(Math.random() * (SHAPES.length - 1))];
    prevShape.current = prev;
    setCurrentShape(next);
    setFeedback(null);
    cardStart.current = Date.now();

    // Auto-wrong if card times out
    clearTimeout(cardTimer.current);
    if (speedLimit > 0) {
      cardTimer.current = setTimeout(() => {
        if (phaseRef.current !== 'playing') return;
        attRef.current++;
        missedRef.current++;
        streakRef.current = 0;
        setFeedback('incorrect');
        if (soundRef.current) playGameSound('speedmatch', 'error');
        
        const acc = Math.round(scoreRef.current / attRef.current * 100);
        onHudUpdateRef.current?.({
          score: scoreRef.current,
          stats: { accuracy: acc, wrong: wrongRef.current, missed: missedRef.current }
        });

        setTimeout(() => {
          if (phaseRef.current === 'playing') nextCard(next);
        }, 200);
      }, speedLimit);
    }
  };

  // ── handleDecision ──
  const handleDecision = (userSaysMatch) => {
    if (phaseRef.current !== 'playing') return;

    const latencyMs = Date.now() - cardStart.current;
    if (latencyMs < cooldownMs) return; // Prevent spam clicking

    clearTimeout(cardTimer.current);

    latencies.current.push(latencyMs);
    attRef.current++;

    const isMatch = currentShape === prevShape.current;
    const correct = userSaysMatch === isMatch;

    if (correct) {
      scoreRef.current++;
      streakRef.current++;
      maxStreakRef.current = Math.max(maxStreakRef.current, streakRef.current);
      setFeedback('correct');
      if (soundRef.current) playGameSound('speedmatch', 'success');
    } else {
      wrongRef.current++;
      streakRef.current = 0;
      setFeedback('incorrect');
      if (soundRef.current) playGameSound('speedmatch', 'error');
    }

    const acc = Math.round(scoreRef.current / attRef.current * 100);
    onHudUpdateRef.current?.({
      score: scoreRef.current,
      stats: { accuracy: acc, wrong: wrongRef.current, missed: missedRef.current }
    });

    setTimeout(() => {
      if (phaseRef.current === 'playing') nextCard(currentShape);
    }, 160);
  };

  // ── Keyboard ──
  useEffect(() => {
    const fn = (e) => {
      if (phaseRef.current !== 'playing') return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); handleDecision(true);  }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleDecision(false); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [currentShape]); // re-bind when shape changes so currentShape is fresh

  // ── isActive lifecycle ──
  useEffect(() => {
    if (!isActive) {
      // UGP stopped the game (session expired) — fire endGame
      clearTimeout(cardTimer.current);
      if (phaseRef.current === 'playing') endGame();
      return;
    }
    // Fresh start
    scoreRef.current    = 0;
    attRef.current      = 0;
    streakRef.current   = 0;
    maxStreakRef.current = 0;
    latencies.current   = [];
    doneRef.current     = false;
    phaseRef.current    = 'playing';
    setFeedback(null);

    const first = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    prevShape.current = null;
    setCurrentShape(first);

    // 100ms delay so first shape renders before card timer fires
    const startTimer = setTimeout(() => nextCard(first), 100);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(cardTimer.current);
    };
  }, [isActive]);

  if (!isActive || phaseRef.current === 'done') return null;

  const correct   = feedback === 'correct';
  const incorrect = feedback === 'incorrect';

  return (
    <GameScreen>
      <GameMainUI>
        {/* Shape card */}
        <div style={{
          width:  'min(220px, 52vw)',
          height: 'min(220px, 52vw)',
          borderRadius: 28,
          background: correct   ? 'rgba(16,185,129,0.15)'
            : incorrect ? 'rgba(239,68,68,0.10)' : 'var(--border-subtle)',
          border: `2px solid ${correct ? 'var(--color-emerald-base)' : incorrect ? 'var(--color-error-coral)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(4.5rem, 16vw, 7rem)',
          transition: 'all 0.1s ease',
          transform: correct ? 'scale(1.05)' : 'scale(1)',
          boxShadow: correct ? '0 0 40px rgba(16,185,129,0.25)' : 'none',
        }}>
          {currentShape}
        </div>
      </GameMainUI>

      <GameFooterInfo>
        {maxStreakRef.current >= 3 && (
          <div style={{ color: 'var(--color-emerald-base)', fontWeight: 700, fontSize: '0.85rem', marginBottom: 12 }}>
            🔥 Best streak: {maxStreakRef.current}
          </div>
        )}
        
        <div style={{
          background: 'var(--border-subtle)',
          border: '1px solid var(--border-subtle)',
          padding: '8px 16px',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6
        }}>
          <p style={{ opacity: 0.9, fontSize: '0.85rem', margin: 0, fontWeight: 500, textAlign: 'center' }}>
            Does this match the <strong style={{ color: 'var(--color-emerald-base)' }}>PREVIOUS</strong> shape?
          </p>
          <div style={{ opacity: 0.4, fontSize: '0.7rem' }}>
            {speedLimit > 0 ? `${(speedLimit / 1000).toFixed(1)}s per card · ` : 'Untimed · '}← YES &nbsp; NO →
          </div>
        </div>
      </GameFooterInfo>

      <GameControls>
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => handleDecision(true)}
            style={{
              minWidth: 'min(120px, 30vw)', padding: '18px 24px',
              fontSize: 'clamp(1rem, 3vw, 1.15rem)', fontWeight: 800,
              background: 'rgba(16,185,129,0.1)', border: '1.5px solid var(--color-emerald-base)',
              borderRadius: 18, cursor: 'pointer', color: 'var(--color-emerald-base)',
              transition: 'transform 0.1s',
            }}
          >← YES</button>
          <button
            onClick={() => handleDecision(false)}
            style={{
              minWidth: 'min(120px, 30vw)', padding: '18px 24px',
              fontSize: 'clamp(1rem, 3vw, 1.15rem)', fontWeight: 800,
              background: 'rgba(239,68,68,0.08)', border: '1.5px solid var(--color-error-coral)',
              borderRadius: 18, cursor: 'pointer', color: 'var(--color-error-coral)',
              transition: 'transform 0.1s',
            }}
          >NO →</button>
        </div>
      </GameControls>
    </GameScreen>
  );
}
