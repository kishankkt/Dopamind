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
import { ArrowLeft, Volume2, VolumeX, Trophy, RotateCcw, LayoutGrid, Sprout, Timer, Eye, EyeOff } from 'lucide-react';
import { getGame } from './gameRegistry';
import { getXPProgress } from '@/app/core/engagement/EngagementEngine';
import { getLevelLabel, getDifficultyValue } from '@/app/core/engagement/AdaptiveEngine';
import GameAchievementOverlay from './GameAchievementOverlay';
import PreGameCountdown from './PreGameCountdown';
import { playGameSound, unlockAudio } from './gameSoundEngine';
import './UniversalGamePlayer.css';

const DEFAULT_SESSION_SECS = 60; // 1 minute default

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
  currentLevel,        // int 1-10
  gamesPlayed,         // total plays of this game (unlock time selector after 3)
  onGameComplete,      // (gameId, stats) => void
  onExitToGym,         // () => void
  onGrow,              // () => void
  engagementResult,    // { xpEarned, newXP, newLevel, leveledUp, newBadges, isPersonalBest, adaptive }
  isProcessing,        // true while AppShell saving
  children,
}) {
  const gameInfo  = getGame(gameId);
  const catColor  = CAT_COLOR[gameInfo?.category] || 'var(--color-emerald-base)';

  // HUD live state
  const [hudScore,    setHudScore]    = useState(0);
  const [hudTimeLeft, setHudTimeLeft] = useState(gameInfo?.durationSeconds || null);
  const [hudLevel,    setHudLevel]    = useState(currentLevel || 1);

  // Session timer
  const [sessionSecs, setSessionSecs]  = useState(DEFAULT_SESSION_SECS);
  const sessionRef                     = useRef(null);

  // Player state
  const [soundEnabled,      setSoundEnabled]    = useState(true);
  const [gameState,         setGameState]       = useState('pregame');
  const [hudExtendedStats, setHudExtendedStats] = useState({ accuracy: 0, wrong: 0, missed: 0 });
  const [showExtendedStats, setShowExtendedStats] = useState(false);
  const [sessionStats,      setSessionStats]    = useState(null);
  const [showQuitConfirm,   setShowQuitConfirm] = useState(false);
  const [chosenSessionSecs, setChosenSessionSecs] = useState(DEFAULT_SESSION_SECS);
  const [chosenGameConfig, setChosenGameConfig] = useState({});
  const [gameActive,        setGameActive]      = useState(false); // controls isActive passed to game
  const autoCompletedRef = useRef(false); // prevent double-fire

  // XP animation
  const [xpAnimValue, setXpAnimValue] = useState(0);
  const xpAnimRef = useRef(null);

  // In-game achievements
  const [pendingAchievements, setPendingAchievements] = useState([]);
  const inGameStreakRef = useRef(0);
  const prevScoreRef = useRef(0);

  // Session timer — starts on pregame confirm, auto-completes on expire
  const startSessionTimer = (secs) => {
    autoCompletedRef.current = false;
    setSessionSecs(secs);
    clearInterval(sessionRef.current);
    sessionRef.current = setInterval(() => {
      setSessionSecs(p => {
        if (p <= 1) {
          clearInterval(sessionRef.current);
          // Auto-complete: stop game, play end sound, trigger summary
          if (!autoCompletedRef.current) {
            autoCompletedRef.current = true;
            setGameActive(false); // games respond to isActive=false → call endGame
            // Give game 600ms to clean up & call onComplete naturally
            // If game doesn't call onComplete, force summary after 800ms
            setTimeout(() => {
              setGameState(s => s === 'playing' ? 'summary_forced' : s);
            }, 800);
          }
          return 0;
        }
        // Last 3 seconds: tick beep
        if (p <= 4 && soundEnabled) unlockAudio();
        return p - 1;
      });
    }, 1000);
  };

  useEffect(() => {
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

  const handleHudUpdate = ({ score, level, stats }) => {
    if (score !== undefined) {
      prevScoreRef.current = score;
      setHudScore(score);
    }
    if (level !== undefined) setHudLevel(level);
    if (stats !== undefined) setHudExtendedStats(stats);
  };

  const handleComplete = (stats) => {
    if (gameState === 'summary') return; // prevent double fire
    clearInterval(sessionRef.current);
    setSessionStats(stats);
    setHudScore(stats.score || 0);
    setGameActive(false);
    setGameState('summary');
    if (stats.accuracy_percent === 100) {
      setPendingAchievements(a => [...a, { type: 'perfect', subtitle: '100% accuracy!' }]);
    }
    if (soundEnabled) playGameSound(gameId, 'success');
    if (onGameComplete) onGameComplete(gameId, stats);
  };

  const handlePreGameStart = (sessionSeconds, gameConfig = {}) => {
    setChosenSessionSecs(sessionSeconds);
    setChosenGameConfig(gameConfig);
    setSessionSecs(sessionSeconds);
    setGameState('playing');
    setGameActive(true);
    unlockAudio();
    startSessionTimer(sessionSeconds);
    if (soundEnabled) playGameSound(gameId, 'start');
  };

  const handlePreGameCancel = () => {
    onExitToGym();
  };

  const handleQuitRequest = () => setShowQuitConfirm(true);
  const handleQuitConfirm = () => { clearInterval(sessionRef.current); setShowQuitConfirm(false); onExitToGym(); };
  const handleQuitCancel  = () => setShowQuitConfirm(false);

  const restartGame = () => {
    setGameState('pregame');
    setGameActive(false);
    setSessionStats(null);
    setHudScore(0);
    setHudLevel(currentLevel || 1);
    setXpAnimValue(0);
    setChosenSessionSecs(DEFAULT_SESSION_SECS);
    setPendingAchievements([]);
    prevScoreRef.current = 0;
    autoCompletedRef.current = false;
  };

  if (!gameInfo) return null;

  // ─── PRE-GAME SCREEN ────────────────────────────────────────────
  if (gameState === 'pregame') {
    const diffVal = getDifficultyValue(gameInfo, currentLevel || 1);
    return (
      <PreGameCountdown
        gameInfo={gameInfo}
        level={currentLevel || 1}
        difficultyValue={diffVal}
        gamesPlayed={gamesPlayed || 0}
        defaultSeconds={DEFAULT_SESSION_SECS}
        onStart={handlePreGameStart}
        onCancel={handlePreGameCancel}
      />
    );
  }

  // ─── SUMMARY SCREEN ─────────────────────────────────────────────
  // Also show summary if timer force-expired (session_forced = game didn't fire onComplete)
  const isForced = gameState === 'summary_forced';
  if ((gameState === 'summary' && sessionStats) || isForced) {
    if (isForced && !sessionStats) {
      // Force a minimal stats object from what we know
      const forced = { score: hudScore, attempts: 0, accuracy_percent: 0, avg_speed_seconds: 0,
        level_reached: currentLevel || 1, duration_seconds: chosenSessionSecs,
        streak_in_game: 0, perfect_rounds: 0, game_specific: {} };
      if (onGameComplete) onGameComplete(gameId, forced);
    }
    const stats = sessionStats || { score: hudScore, attempts: 0, accuracy_percent: 0, avg_speed_seconds: 0 };
    const accuracy = stats.accuracy_percent || 0;
    const speed    = parseFloat(stats.avg_speed_seconds) || 0;
    const score    = stats.score || 0;
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

  return (
    <div className="ugp-shell">
      {/* Header — back, game name, sound only */}
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
        <button className="ugp-sound-btn" onClick={() => setSoundEnabled(p => !p)}>
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* HUD — SCORE + LEVEL + EXTENDED STATS */}
      <div className="ugp-hud" style={{ flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {!showExtendedStats && (
              <span style={{ fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic', marginLeft: 8 }}>
                Live stats hidden for focus
              </span>
            )}
          </div>
          <button onClick={() => setShowExtendedStats(p => !p)} style={{ border: 'none', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 20, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.8 }}>
            {showExtendedStats ? <Eye size={16} /> : <EyeOff size={16} />}
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{showExtendedStats ? 'Hide' : 'Unhide'}</span>
          </button>
        </div>

        {showExtendedStats && (
          <div style={{ display: 'flex', gap: 16, width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, fontSize: '0.8rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div className="ugp-hud-metric"><span className="ugp-hud-label">Score</span><strong className="ugp-hud-value">{hudScore}</strong></div>
            <div className="ugp-hud-metric"><span className="ugp-hud-label">Level</span><strong className="ugp-hud-value" style={{ color: catColor }}>{hudLevel}</strong></div>
            <div className="ugp-hud-metric"><span className="ugp-hud-label">Accuracy</span><strong className="ugp-hud-value">{hudExtendedStats.accuracy}%</strong></div>
            <div className="ugp-hud-metric"><span className="ugp-hud-label">Wrong</span><strong className="ugp-hud-value" style={{color: '#ef4444'}}>{hudExtendedStats.wrong}</strong></div>
            <div className="ugp-hud-metric"><span className="ugp-hud-label">Missed</span><strong className="ugp-hud-value" style={{color: '#f59e0b'}}>{hudExtendedStats.missed}</strong></div>
            <div className="ugp-hud-metric"><span className="ugp-hud-label">Time</span><strong className="ugp-hud-value">{chosenSessionSecs - sessionSecs}s / {chosenSessionSecs}s</strong></div>
          </div>
        )}
      </div>

      {/* BOX 3: Rules / Info Container */}
      <div style={{
        margin: '0 24px 8px 24px',
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: 16,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.85rem', opacity: 0.6, margin: 0, fontWeight: 500 }}>
          {gameInfo.description || gameInfo.tagline}
        </p>
      </div>

      {/* BOX 4 & 5: Game Viewport */}
      <div className="ugp-game-viewport" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

        <GameAchievementOverlay
          achievements={pendingAchievements}
          onClear={() => setPendingAchievements([])}
        />
        <div className="ugp-game-layer">
          {React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child, {
                  isActive: gameActive,
                  sessionSeconds: chosenSessionSecs,
                  gameConfig: chosenGameConfig,
                  onComplete: handleComplete,
                  onQuit: handleQuitRequest,
                  onHudUpdate: handleHudUpdate,
                  soundEnabled,
                  level: currentLevel,
                })
              : child
          )}
        </div>
      </div>

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
