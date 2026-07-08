/**
 * GameAchievementOverlay.jsx
 * Renders pop-up achievement toasts during gameplay.
 * Triggered via onAchievement callback from UniversalGamePlayer.
 *
 * Achievement types:
 *   streak   → 3/5/10 correct in a row
 *   levelup  → adaptive engine pushed level up mid-game
 *   personal → new personal best
 *   perfect  → 100% accuracy round
 *   milestone→ score hits milestone
 */

import React, { useEffect, useState } from 'react';

const ACHIEVEMENT_CONFIG = {
  streak:    { emoji: '🔥', label: 'On Fire!',         color: '#f97316', bg: 'rgba(249,115,22,0.18)' },
  levelup:   { emoji: '⬆️', label: 'Level Up!',        color: '#10b981', bg: 'rgba(16,185,129,0.18)' },
  personal:  { emoji: '🏆', label: 'Personal Best!',   color: '#eab308', bg: 'rgba(234,179,8,0.18)'  },
  perfect:   { emoji: '⭐', label: 'Perfect Round!',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.18)' },
  milestone: { emoji: '🎯', label: 'Milestone!',       color: '#38bdf8', bg: 'rgba(56,189,248,0.18)' },
};

function ConfettiBurst({ color }) {
  const pieces = Array.from({ length: 16 });
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', borderRadius: 'inherit' }}>
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * 360;
        const dist = 35 + Math.random() * 25;
        const size = 5 + Math.random() * 4;
        const palette = [color, '#fff', '#eab308', '#10b981'];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: size,
              height: size,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              background: palette[i % palette.length],
              transform: `rotate(${angle}deg) translateY(-${dist}px)`,
              opacity: 0,
              animation: `confettiFly 0.65s ease-out ${(i * 0.02).toFixed(2)}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
}

function AchievementToast({ type, subtitle, onDone }) {
  const cfg = ACHIEVEMENT_CONFIG[type] || ACHIEVEMENT_CONFIG.milestone;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 350);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: `translateX(-50%) ${visible ? 'translateY(0) scale(1)' : 'translateY(-18px) scale(0.88)'}`,
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        zIndex: 80,
        background: cfg.bg,
        border: `1.5px solid ${cfg.color}55`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 22,
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: `0 8px 36px ${cfg.bg}, 0 0 0 1px ${cfg.color}22`,
        minWidth: 170,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <ConfettiBurst color={cfg.color} />
      <span style={{ fontSize: '1.4rem', lineHeight: 1, zIndex: 1 }}>{cfg.emoji}</span>
      <div style={{ zIndex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: '0.88rem', color: cfg.color, lineHeight: 1.1 }}>{cfg.label}</div>
        {subtitle && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

export default function GameAchievementOverlay({ achievements, onClear }) {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setQueue(prev => [...prev, ...achievements]);
      onClear?.();
    }
  }, [achievements]);

  const handleDone = () => setQueue(prev => prev.slice(1));

  if (queue.length === 0) return null;
  const current = queue[0];

  return (
    <AchievementToast
      key={`${current.type}-${Date.now()}`}
      type={current.type}
      subtitle={current.subtitle}
      onDone={handleDone}
    />
  );
}
