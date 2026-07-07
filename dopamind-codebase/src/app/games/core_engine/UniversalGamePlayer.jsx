/**
 * UniversalGamePlayer.jsx — DopaMind Standard Game Shell
 *
 * Wraps every game component with:
 *   - Standard header (game name, category badge, exit, sound, 5-min session timer)
 *   - Live HUD (score, timer, level — updated by games via onHudUpdate)
 *   - Post-game summary with XP reveal, level change indicator, Grow button
 *   - Quit confirmation modal
 *
 * Games emit: onComplete(stats), onQuit(), onHudUpdate({ score, timeLeft, level })
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Trophy, RotateCcw, LayoutGrid, Sprout, Timer } from 'lucide-react';
import { getGame } from './gameRegistry';
import { getXPProgress } from '@/app/core/engagement/EngagementEngine';
import { getLevelLabel } from '@/app/core/engagement/AdaptiveEngine';
import './UniversalGamePlayer.css';

const SESSION_SECS = 5 * 60; // 5-minute recommended per-game session

const CAT_COLOR = {
  'Quick Reflexes':    '#f97316',
  'Stay Sharp':        '#3b82f6',
  'Remember & Recall': '#8b5cf6',
  'Think & Solve':     '#10b981',
  'Word Power':        '#ec4899',
  'Sort & Prioritize': '#eab308',
};

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function UniversalGamePlayer({
  gameId,
  currentLevel,        // int 1-10 — loaded by AppShell from user_game_levels
  onGameComplete,      // (gameId, stats, engagementResult) => void
  onExitToGym,         // () => void
  onGrow,              // () => void — pick next game by weakest category
  engagementResult,    // set after AppShell processes DB: { xpEarned, newXP, newLevel, leveledUp, newBadges, isPersonalBest, adaptive }
  isProcessing,        // true while AppShell saving
  children,
}) {
  const gameInfo  = getGame(gameId);
  const catColor  = CAT_COLOR[gameInfo?.category] || 'var(--color-emerald-base)';

  // HUD live state
  const [hudScore,    setHudScore]    = useState(0);
  const [hudTimeLeft, setHudTimeLeft] = useState(gameInfo?.durationSeconds || null);
  const [hudLevel,    setHudLevel]    = useState(currentLevel || 1);

  // Session timer (5 min recommended)
  const [sessionSecs, setSessionSecs]  = useState(SESSION_SECS);
  const sessionRef                     = useRef(null);

  // Player state
  const [soundEnabled,    setSoundEnabled]    = useState(true);
  const [gameState,       setGameState]       = useState('playing');
  const [sessionStats,    setSessionStats]    = useState(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // XP animation
  const [xpAnimValue, setXpAnimValue] = useState(0);
  const xpAnimRef                     = useRef(null);

  // Start session countdown on mount
  useEffect(() => {
    sessionRef.current = setInterval(() => {
      setSessionSecs(p => (p > 0 ? p - 1 : 0));
    }, 1000);
    return () => clearInterval(sessionRef.current);
  }, []);

  // Animate XP when engagement result arrives
  useEffect(() => {
    if (engagementResult && gameState === 'summary') animateXP(engagementResult.xpEarned);
  }, [engagementResult]);

  const animateXP = (target) => {
    let cur = 0;
    const step = Math.ceil(target / 30);
    xpAnimRef.current = setInterval(() => {
      cur = Math.min(cur + step, target);
      setXpAnimValue(cur);
      if (cur >= target) clearInterval(xpAnimRef.current);
    }, 40);
  };

  const handleHudUpdate = ({ score, timeLeft, level }) => {
    if (score    !== undefined) setHudScore(score);
    if (timeLeft !== undefined) setHudTimeLeft(timeLeft);
    if (level    !== undefined) setHudLevel(level);
  };

  const handleComplete = (stats) => {
    clearInterval(sessionRef.current);
    setSessionStats(stats);
    setHudScore(stats.score || 0);
    setGameState('summary');
    if (onGameComplete) onGameComplete(gameId, stats);
  };

  const handleQuitRequest = () => setShowQuitConfirm(true);
  const handleQuitConfirm = () => { setShowQuitConfirm(false); onExitToGym(); };
  const handleQuitCancel  = () => setShowQuitConfirm(false);

  const restartGame = () => {
    setGameState('playing');
    setSessionStats(null);
    setHudScore(0);
    setHudTimeLeft(gameInfo?.durationSeconds || null);
    setHudLevel(currentLevel || 1);
    setXpAnimValue(0);
    setSessionSecs(SESSION_SECS);
    clearInterval(sessionRef.current);
    sessionRef.current = setInterval(() => {
      setSessionSecs(p => (p > 0 ? p - 1 : 0));
    }, 1000);
  };

  if (!gameInfo) return null;

  // ─── SUMMARY SCREEN ─────────────────────────────────────────────
  if (gameState === 'summary' && sessionStats) {
    const accuracy = sessionStats.accuracy_percent || 0;
    const speed    = parseFloat(sessionStats.avg_speed_seconds) || 0;
    const score    = sessionStats.score || 0;
    const adaptive = engagementResult?.adaptive;
    const dirIcon  = adaptive?.direction === 'up' ? '↑' : adaptive?.direction === 'down' ? '↓' : '─';
    const dirColor = adaptive?.direction === 'up' ? '#10b981' : adaptive?.direction === 'down' ? '#ef4444' : '#94a3b8';
    const nextLv   = adaptive?.nextLevel || currentLevel || 1;

    return (
      <div className="ugp-shell">
        <div className="ugp-summary animate-pop">
          <div className="ugp-summary-header">
            <div className="ugp-summary-icon" style={{ background: `${catColor}22` }}>
              {gameInfo.category === 'Quick Reflexes' ? '⚡' : gameInfo.category === 'Remember & Recall' ? '🧠' : '🌿'}
            </div>
            <h2 className="ugp-summary-title">Workout Complete</h2>
            <p className="ugp-summary-subtitle">{gameInfo.name} · {gameInfo.category}</p>
          </div>

          {/* Core stats */}
          <div className="ugp-stat-row">
            <div className="ugp-stat-box">
              <span className="ugp-stat-label">Score</span>
              <strong className="ugp-stat-value">{score}</strong>
            </div>
            <div className="ugp-stat-box">
              <span className="ugp-stat-label">Accuracy</span>
              <strong className="ugp-stat-value">{accuracy}%</strong>
            </div>
            <div className="ugp-stat-box">
              <span className="ugp-stat-label">Avg Speed</span>
              <strong className="ugp-stat-value">{speed ? `${speed}s` : '—'}</strong>
            </div>
          </div>

          {/* Adaptive level change */}
          {adaptive && (
            <div className="ugp-adaptive-row" style={{ borderColor: dirColor }}>
              <span className="ugp-adaptive-arrow" style={{ color: dirColor }}>{dirIcon}</span>
              <div>
                <div className="ugp-adaptive-label">
                  Level {nextLv} · <span style={{ color: 'var(--text-muted)' }}>{getLevelLabel(nextLv)}</span>
                </div>
                <div className="ugp-adaptive-reason">{adaptive.reason}</div>
              </div>
            </div>
          )}

          {/* Personal best */}
          {engagementResult?.isPersonalBest && (
            <div className="ugp-pb-banner">
              <Trophy size={18} /> <span>New Personal Best!</span>
            </div>
          )}

          {/* XP earned */}
          {engagementResult && (
            <div className="ugp-xp-earned">
              <span className="ugp-xp-label">XP Earned</span>
              <span className="ugp-xp-value">+{xpAnimValue}</span>
            </div>
          )}

          {/* Level up */}
          {engagementResult?.leveledUp && (
            <div className="ugp-levelup-banner">
              🎉 Level Up! You're now Level {engagementResult.newLevel}
            </div>
          )}

          {/* New badges */}
          {engagementResult?.newBadges?.length > 0 && (
            <div className="ugp-badges-row">
              {engagementResult.newBadges.map(b => (
                <div key={b.id} className="ugp-badge-pill">{b.icon} {b.name}</div>
              ))}
            </div>
          )}

          {/* Feedback */}
          <p className="ugp-feedback-text">
            {accuracy >= 90
              ? 'Outstanding precision. Your neural pathways are firing clean.'
              : accuracy >= 70
              ? 'Solid performance. Keep pushing for sharper accuracy.'
              : 'Good effort. Focus on reducing errors to build consistency.'}
          </p>

          {/* Actions */}
          <div className="ugp-summary-actions">
            {isProcessing
              ? <div className="ugp-saving">Saving results...</div>
              : <>
                  <button className="btn-secondary" onClick={restartGame}>
                    <RotateCcw size={15} /> Again
                  </button>
                  {onGrow && (
                    <button className="ugp-grow-btn" onClick={onGrow}>
                      <Sprout size={16} /> Grow — Next Game
                    </button>
                  )}
                  <button className="btn-secondary" onClick={onExitToGym}>
                    <LayoutGrid size={15} /> Gym
                  </button>
                </>
            }
          </div>
        </div>
      </div>
    );
  }

  // ─── PLAYING SCREEN ──────────────────────────────────────────────
  const sessionWarning = sessionSecs <= 60;
  const sessionExpired = sessionSecs === 0;

  return (
    <div className="ugp-shell">
      {/* Header */}
      <div className="ugp-header">
        <button className="ugp-back-btn" onClick={handleQuitRequest}>
          <ArrowLeft size={20} />
        </button>
        <div className="ugp-header-center">
          <h1 className="ugp-game-title">{gameInfo.name}</h1>
          <span className="ugp-category-badge" style={{ background: `${catColor}22`, color: catColor }}>
            {gameInfo.category}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Session timer */}
          <div className={`ugp-session-timer ${sessionWarning ? 'ugp-session-warn' : ''} ${sessionExpired ? 'ugp-session-done' : ''}`}>
            <Timer size={12} />
            <span>{sessionExpired ? 'Done!' : formatTime(sessionSecs)}</span>
          </div>
          <button className="ugp-sound-btn" onClick={() => setSoundEnabled(p => !p)}>
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* Live HUD */}
      <div className="ugp-hud">
        <div className="ugp-hud-metric">
          <span className="ugp-hud-label">Score</span>
          <strong className="ugp-hud-value">{hudScore}</strong>
        </div>
        {gameInfo.gameType !== 'endless' && hudTimeLeft !== null && (
          <div className={`ugp-hud-metric ${hudTimeLeft <= 10 ? 'ugp-hud-warning' : ''}`}>
            <span className="ugp-hud-label">Time</span>
            <strong className="ugp-hud-value">{hudTimeLeft}s</strong>
          </div>
        )}
        <div className="ugp-hud-metric">
          <span className="ugp-hud-label">Level</span>
          <strong className="ugp-hud-value" style={{ color: catColor }}>{hudLevel}</strong>
        </div>
      </div>

      {/* Game Viewport — AppShell renders the actual game as children */}
      <div className="ugp-game-viewport">
        {children}
      </div>

      {/* Grow nudge when session timer hits 0 */}
      {sessionExpired && onGrow && gameState === 'playing' && (
        <div className="ugp-grow-nudge">
          <Sprout size={16} />
          <span>5 min done — try another game?</span>
          <button className="ugp-grow-btn" onClick={onGrow}>Grow</button>
        </div>
      )}

      {/* Quit Confirm */}
      {showQuitConfirm && (
        <div className="ugp-quit-overlay" onClick={handleQuitCancel}>
          <div className="ugp-quit-modal glass-panel" onClick={e => e.stopPropagation()}>
            <h3>Quit this game?</h3>
            <p>Your current session won't be saved if you quit now.</p>
            <div className="ugp-quit-actions">
              <button className="btn-secondary" onClick={handleQuitCancel}>Keep Playing</button>
              <button className="btn-danger" onClick={handleQuitConfirm}>Quit to Gym</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
