// CountFlow v3 — UGP-owned timer, pure game logic
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

export default function CountFlow({
  isActive,
  onComplete,
  onQuit,
  onHudUpdate,
  soundEnabled,
  level = 1,
  difficultyValue = 10,
  sessionSeconds = 45,
}) {
  const [equation, setEquation] = useState('');
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
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
    nextEquation();
    sessionTimerRef.current = setTimeout(() => endGame(), sessionSeconds * 1000);
    return () => clearTimeout(sessionTimerRef.current);
  }, [isActive, sessionSeconds]);

  const nextEquation = () => {
    setFeedback(null);
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * (level < 5 ? 2 : 3))];
    const max = Math.max(5, Math.floor(difficultyValue));
    let a, b, ans;
    if (op === '+')  { a = Math.floor(Math.random() * max) + 1; b = Math.floor(Math.random() * max) + 1; ans = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * max) + max; b = Math.floor(Math.random() * a); ans = a - b; }
    else { const m = Math.max(2, Math.floor(Math.sqrt(max))); a = Math.floor(Math.random() * m) + 2; b = Math.floor(Math.random() * m) + 2; ans = a * b; }

    setEquation(`${a} ${op === '*' ? '×' : op} ${b}`);
    setCorrectAnswer(ans);

    const opts = [ans];
    let tries = 0;
    while (opts.length < 4 && tries < 30) {
      const off = Math.floor(Math.random() * Math.max(3, Math.floor(ans * 0.4))) + 1;
      const fake = Math.random() < 0.5 ? ans + off : Math.max(0, ans - off);
      if (!opts.includes(fake)) opts.push(fake);
      tries++;
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  const handleSelect = (val) => {
    if (feedback) return;
    attemptsRef.current += 1;
    if (val === correctAnswer) {
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
    setTimeout(() => nextEquation(), 300);
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
      game_specific: { max_operand: difficultyValue },
    });
  };

  if (!isActive) return null;

  return (
    <div className="active-game-container" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, padding: '16px', gap: 20,
    }}>
      {/* Equation */}
      <div style={{
        padding: '28px 32px',
        background: feedback === 'correct' ? 'rgba(16,185,129,0.08)'
          : feedback === 'incorrect' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
        border: `2px solid ${feedback === 'correct' ? 'var(--color-emerald-base)'
          : feedback === 'incorrect' ? 'var(--color-error-coral)' : 'var(--border)'}`,
        borderRadius: 24,
        fontSize: 'clamp(2rem, 7vw, 3.5rem)',
        fontWeight: 900,
        transition: 'all 0.15s',
        minWidth: 'min(280px, 80vw)',
        textAlign: 'center',
      }}>
        {equation} = ?
      </div>

      {/* Options */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        width: 'min(360px, 88vw)',
      }}>
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(opt)}
            style={{
              padding: '18px 12px',
              fontSize: 'clamp(1.3rem, 4vw, 1.6rem)',
              fontWeight: 800,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              borderRadius: 18, cursor: 'pointer', color: 'var(--text-main)',
              transition: 'transform 0.1s',
              fontFamily: 'var(--font-header)',
            }}
          >
            {opt}
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
