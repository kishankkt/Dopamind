import React, { useState } from 'react';
import { GAME_REGISTRY, CATEGORY_ORDER, getGamesByCategory } from '@/app/games/core_engine/gameRegistry';
import {
  Zap, Target, Hash, Palette, Puzzle,
  Activity, Layers, Eye, Compass, Timer,
  ArrowDown, Radio, Lock, Sliders, Scale
} from 'lucide-react';

// Map icon string names to components
const ICON_MAP = {
  Zap, Target, Hash, Palette, Puzzle,
  Activity, Layers, Eye, Compass, Timer,
  ArrowDown, Radio, Lock, Sliders, Scale,
};

const CATEGORY_COLORS = {
  'Quick Reflexes':    { bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)',  text: '#f97316' },
  'Stay Sharp':        { bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)',  text: '#3b82f6' },
  'Remember & Recall': { bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.25)',  text: '#8b5cf6' },
  'Think & Solve':     { bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)',  text: '#10b981' },
  'Word Power':        { bg: 'rgba(236,72,153,0.1)',   border: 'rgba(236,72,153,0.25)',  text: '#ec4899' },
  'Sort & Prioritize': { bg: 'rgba(234,179,8,0.1)',    border: 'rgba(234,179,8,0.25)',   text: '#eab308' },
};

const GAME_TYPE_LABELS = {
  timed:   'Timed',
  rounds:  'Rounds',
  endless: 'Endless',
};

export default function BrainGymView({ onPlayGame }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const byCategory = getGamesByCategory();

  const categories = ['All', ...CATEGORY_ORDER.filter(cat => byCategory[cat]?.length)];

  const filteredGames = activeCategory === 'All'
    ? GAME_REGISTRY
    : (byCategory[activeCategory] || []);

  return (
    <>
      <header className="tab-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Brain Gym</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.6, fontSize: '0.9rem' }}>
            Choose a cognitive loop to begin. Every game waters your streak plant.
          </p>
        </div>
      </header>

      {/* ── Category Filter Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {categories.map(cat => {
          const colors = cat === 'All' ? null : CATEGORY_COLORS[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: isActive
                  ? `1px solid ${colors?.text || 'var(--color-emerald-base)'}`
                  : '1px solid var(--border)',
                background: isActive
                  ? (colors?.bg || 'rgba(16,185,129,0.12)')
                  : 'transparent',
                color: isActive
                  ? (colors?.text || 'var(--color-emerald-base)')
                  : 'var(--text-muted)',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Game Cards Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {filteredGames.map(game => {
          const colors = CATEGORY_COLORS[game.category] || CATEGORY_COLORS['Quick Reflexes'];
          const IconComponent = ICON_MAP[game.icon] || Zap;

          return (
            <div
              key={game.id}
              className="glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '22px',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                cursor: 'default',
                borderTop: `3px solid ${colors.text}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px ${colors.border}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
            >
              <div>
                {/* Icon + Category + Type */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.text, flexShrink: 0
                  }}>
                    <IconComponent size={22} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px',
                      background: colors.bg, color: colors.text,
                      border: `1px solid ${colors.border}`, borderRadius: '8px',
                      letterSpacing: '0.03em'
                    }}>
                      {game.category}
                    </span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px',
                      background: 'var(--border)', color: 'var(--text-muted)',
                      borderRadius: '6px'
                    }}>
                      {GAME_TYPE_LABELS[game.gameType]}
                      {game.durationSeconds ? ` · ${game.durationSeconds}s` : ''}
                      {game.rounds ? ` · ${game.rounds} rounds` : ''}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: '1.25rem', margin: '0 0 6px 0',
                  fontFamily: 'var(--font-header)', fontWeight: 800,
                  color: 'var(--text-main)'
                }}>
                  {game.name}
                </h2>

                {/* Tagline */}
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: colors.text, margin: '0 0 8px 0', opacity: 0.9 }}>
                  {game.tagline}
                </p>

                {/* Description */}
                <p style={{ fontSize: '0.84rem', opacity: 0.65, margin: '0 0 18px 0', lineHeight: '1.45' }}>
                  {game.description}
                </p>
              </div>

              {/* Audio badge + Play button */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={() => onPlayGame(game.id)}
                  style={{ flex: 1, justifyContent: 'center', padding: '11px', fontSize: '0.88rem' }}
                >
                  Start Workout
                </button>
                {game.hasAudio && (
                  <div title="Has audio feedback" style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'var(--brand-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', flexShrink: 0
                  }}>🔊</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
