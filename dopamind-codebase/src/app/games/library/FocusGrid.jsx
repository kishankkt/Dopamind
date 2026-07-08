// FocusGrid v3 — UGP-owned timer, pure game logic only
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

export default function FocusGrid({
  isActive,
  onComplete,
  onQuit,
  onHudUpdate,
  soundEnabled,
  level = 1,
  difficultyValue = 9,
  sessionSeconds = 60,
}) {
  const gridSize = Math.min(Math.max(Math.floor(difficultyValue), 4), 16);
  const seqLength = Math.min(2 + Math.floor(level / 2), 7);

  const [sequence, setSequence] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | showing | input | feedback
  const [activeTile, setActiveTile] = useState(null);
  const [userProgress, setUserProgress] = useState(0); // how many in seq tapped correctly
  const [lastResult, setLastResult] = useState(null); // 'correct' | 'incorrect'

  const scoreRef = useRef(0);
  const roundsRef = useRef(0);
  const streakRef = useRef(0);
  const maxStreakRef = useRef(0);
  const sessionTimerRef = useRef(null);
  const showTimerRef = useRef(null);
  const gameStartRef = useRef(Date.now());

  useEffect(() => {
    if (!isActive) {
      clearTimeout(sessionTimerRef.current);
      clearTimeout(showTimerRef.current);
      return;
    }
    // Reset
    scoreRef.current = 0;
    roundsRef.current = 0;
    streakRef.current = 0;
    maxStreakRef.current = 0;
    setPhase('idle');
    setUserProgress(0);
    setLastResult(null);
    gameStartRef.current = Date.now();

    // Session ends via UGP timer. Also set our own end to match.
    sessionTimerRef.current = setTimeout(() => endGame(), sessionSeconds * 1000);

    // Start first round after brief pause
    setTimeout(() => startRound(), 300);

    return () => {
      clearTimeout(sessionTimerRef.current);
      clearTimeout(showTimerRef.current);
    };
  }, [isActive, sessionSeconds]);

  const makeSequence = () =>
    Array.from({ length: seqLength }, () => Math.floor(Math.random() * gridSize));

  const startRound = () => {
    const seq = makeSequence();
    setSequence(seq);
    setUserProgress(0);
    setLastResult(null);
    showSequence(seq);
  };

  const showSequence = (seq) => {
    setPhase('showing');
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setActiveTile(null);
        setPhase('input');
        return;
      }
      setActiveTile(seq[i]);
      if (soundEnabled) playChime(seq[i] % 8);
      showTimerRef.current = setTimeout(() => {
        setActiveTile(null);
        showTimerRef.current = setTimeout(() => {
          i++;
          step();
        }, 200);
      }, 500);
    };
    showTimerRef.current = setTimeout(step, 400);
  };

  const handleTile = (index) => {
    if (phase !== 'input') return;
    const expected = sequence[userProgress];
    if (index === expected) {
      setActiveTile(index);
      setTimeout(() => setActiveTile(null), 150);
      const next = userProgress + 1;
      if (next === sequence.length) {
        // Round complete
        scoreRef.current += 1;
        streakRef.current += 1;
        maxStreakRef.current = Math.max(maxStreakRef.current, streakRef.current);
        roundsRef.current += 1;
        if (onHudUpdate) onHudUpdate({ score: scoreRef.current });
        if (soundEnabled) playChime(scoreRef.current % 8);
        setLastResult('correct');
        setPhase('feedback');
        setTimeout(() => startRound(), 600);
      } else {
        setUserProgress(next);
      }
    } else {
      // Wrong
      roundsRef.current += 1;
      streakRef.current = 0;
      if (soundEnabled) playErrorSound();
      setLastResult('incorrect');
      setPhase('feedback');
      setTimeout(() => startRound(), 700);
    }
  };

  const endGame = () => {
    clearTimeout(sessionTimerRef.current);
    clearTimeout(showTimerRef.current);
    const accuracy = roundsRef.current > 0
      ? Math.round((scoreRef.current / roundsRef.current) * 100) : 0;
    onComplete({
      score: scoreRef.current,
      attempts: roundsRef.current,
      accuracy_percent: accuracy,
      avg_speed_seconds: 0,
      level_reached: level,
      duration_seconds: Math.round((Date.now() - gameStartRef.current) / 1000),
      streak_in_game: maxStreakRef.current,
      perfect_rounds: scoreRef.current,
      game_specific: { grid_size: gridSize, seq_length: seqLength },
    });
  };

  if (!isActive) return null;

  const cols = Math.ceil(Math.sqrt(gridSize));

  return (
    <div className="active-game-container" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, padding: '16px', gap: 16,
    }}>
      {/* Status */}
      <div style={{
        fontSize: '0.88rem', fontWeight: 700, minHeight: 24, textAlign: 'center',
        color: phase === 'input' ? 'var(--color-accent-gold)'
          : lastResult === 'correct' ? 'var(--color-emerald-base)'
            : lastResult === 'incorrect' ? 'var(--color-error-coral)'
              : 'var(--text-muted)',
      }}>
        {phase === 'showing' && '👀 Watch the sequence…'}
        {phase === 'input' && `👆 Tap ${sequence.length - userProgress} more`}
        {phase === 'feedback' && lastResult === 'correct' && '✓ Correct!'}
        {phase === 'feedback' && lastResult === 'incorrect' && '✗ Wrong'}
        {phase === 'idle' && 'Get ready…'}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(40px, 72px))`,
        gap: 10,
        margin: '0 auto',
        justifyContent: 'center',
      }}>
        {Array.from({ length: gridSize }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleTile(i)}
            style={{
              aspectRatio: '1/1',
              minWidth: 40, minHeight: 40,
              backgroundColor: activeTile === i
                ? 'var(--color-emerald-base)'
                : 'transparent',
              border: `2px solid ${activeTile === i ? 'var(--color-emerald-base)' : 'var(--border)'}`,
              borderRadius: 14,
              cursor: phase === 'input' ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
              boxShadow: activeTile === i ? '0 0 20px rgba(16,185,129,0.4)' : 'none',
              transform: activeTile === i ? 'scale(0.92)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {maxStreakRef.current >= 2 && (
        <div style={{ color: 'var(--color-emerald-base)', fontWeight: 700, fontSize: '0.82rem' }}>
          🔥 {maxStreakRef.current} in a row
        </div>
      )}
    </div>
  );
}
