// WordWarp v3 — UGP-owned timer, Stroop effect game
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

const COLORS = [
  { name: 'RED',    hex: '#F43F5E' },
  { name: 'BLUE',   hex: '#3B82F6' },
  { name: 'GREEN',  hex: '#10B981' },
  { name: 'YELLOW', hex: '#EAB308' },
  { name: 'PURPLE', hex: '#C084FC' },
  { name: 'ORANGE', hex: '#F97316' },
];

export default function WordWarp({
  isActive,
  onComplete,
  onQuit,
  onHudUpdate,
  soundEnabled,
  level = 1,
  difficultyValue = 4,
  sessionSeconds = 60,
}) {
  const optionCount = Math.min(Math.max(Math.floor(difficultyValue), 2), 6);

  const [wordText, setWordText] = useState('');
  const [wordColor, setWordColor] = useState('#FFF');
  const [correctName, setCorrectName] = useState('');
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const scoreRef = useRef(0);
  const attemptsRef = useRef(0);
  const streakRef = useRef(0);
  const maxStreakRef = useRef(0);
  const sessionTimerRef = useRef(null);
  const gameStartRef = useRef(Date.now());

  useEffect(() => {
    if (!isActive) {
      clearTimeout(sessionTimerRef.current);
      return;
    }
    scoreRef.current = 0;
    attemptsRef.current = 0;
    streakRef.current = 0;
    maxStreakRef.current = 0;
    gameStartRef.current = Date.now();
    nextRound();
    sessionTimerRef.current = setTimeout(() => endGame(), sessionSeconds * 1000);
    return () => clearTimeout(sessionTimerRef.current);
  }, [isActive, sessionSeconds]);

  const nextRound = () => {
    setFeedback(null);
    const textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const inkColors = COLORS.filter(c => c.name !== textColor.name);
    const inkColor = Math.random() < 0.7
      ? inkColors[Math.floor(Math.random() * inkColors.length)]
      : textColor;

    setWordText(textColor.name);
    setWordColor(inkColor.hex);
    setCorrectName(inkColor.name);

    const opts = [inkColor.name];
    if (textColor.name !== inkColor.name) opts.push(textColor.name);
    const pool = COLORS.filter(c => !opts.includes(c.name));
    while (opts.length < optionCount && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      opts.push(pool.splice(idx, 1)[0].name);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  const handleSelect = (name) => {
    if (feedback) return;
    attemptsRef.current += 1;
    if (name === correctName) {
      scoreRef.current += 1;
      streakRef.current += 1;
      maxStreakRef.current = Math.max(maxStreakRef.current, streakRef.current);
      if (onHudUpdate) onHudUpdate({ score: scoreRef.current });
      if (soundEnabled) playChime(scoreRef.current % 8);
      setFeedback('correct');
    } else {
      streakRef.current = 0;
      if (soundEnabled) playErrorSound();
      setFeedback('incorrect');
    }
    setTimeout(() => nextRound(), 280);
  };

  const endGame = () => {
    clearTimeout(sessionTimerRef.current);
    const accuracy = attemptsRef.current > 0 ? Math.round((scoreRef.current / attemptsRef.current) * 100) : 0;
    onComplete({
      score: scoreRef.current,
      attempts: attemptsRef.current,
      accuracy_percent: accuracy,
      avg_speed_seconds: 0,
      level_reached: level,
      duration_seconds: Math.round((Date.now() - gameStartRef.current) / 1000),
      streak_in_game: maxStreakRef.current,
      perfect_rounds: 0,
      game_specific: { option_count: optionCount },
    });
  };

  if (!isActive) return null;

  return (
    <div className="active-game-container" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, padding: '16px', gap: 20,
    }}>
      <p style={{ opacity: 0.65, fontSize: '0.88rem', margin: 0 }}>
        Tap the <strong>INK COLOR</strong> — ignore the word!
      </p>

      {/* Stroop word */}
      <div style={{
        padding: '24px 36px',
        background: feedback === 'correct' ? 'rgba(16,185,129,0.08)'
          : feedback === 'incorrect' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
        border: `2px solid ${feedback === 'correct' ? 'var(--color-emerald-base)'
          : feedback === 'incorrect' ? 'var(--color-error-coral)' : 'var(--border)'}`,
        borderRadius: 24, transition: 'all 0.15s',
        minWidth: 'min(260px, 75vw)', textAlign: 'center',
      }}>
        <span style={{
          fontSize: 'clamp(2.8rem, 10vw, 4.5rem)',
          fontWeight: 900,
          color: wordColor,
          textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          transition: 'color 0.1s',
        }}>
          {wordText}
        </span>
      </div>

      {/* Options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: optionCount <= 4 ? '1fr 1fr' : 'repeat(3, 1fr)',
        gap: 10,
        width: 'min(380px, 90vw)',
      }}>
        {options.map((name, i) => (
          <button
            key={i}
            onClick={() => handleSelect(name)}
            style={{
              padding: '14px 8px',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
              fontWeight: 700,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              borderRadius: 14, cursor: 'pointer', color: 'var(--text-main)',
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {maxStreakRef.current >= 3 && (
        <div style={{ color: 'var(--color-emerald-base)', fontWeight: 700, fontSize: '0.82rem' }}>
          🔥 {maxStreakRef.current} streak
        </div>
      )}
    </div>
  );
}
