import React from 'react';

/**
 * GameLayout.jsx
 * Standardized layout wrappers for DopaMind games.
 * Enforces the 6-container architecture by providing the exact slots for the game's internal layout.
 */

// Wraps the entire game component's return
export function GameScreen({ children }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      flex: 1,
    }}>
      {children}
    </div>
  );
}

// BOX 4: The Main Game UI (Shapes, Grid, etc.) — Centered vertically
export function GameMainUI({ children, style }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      width: '100%',
      padding: '16px',
      ...style,
    }}>
      {children}
    </div>
  );
}

// BOX 5: Game Footer Info (Streak, hints, speed limit) — Anchored to bottom
export function GameFooterInfo({ children, style }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '12px 16px',
      marginTop: 'auto',
      ...style,
    }}>
      {children}
    </div>
  );
}

// BOX 6: The Game Controls (Buttons, Sliders, Input) — Stacks under Footer Info
export function GameControls({ children, style }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '16px',
      background: 'var(--border-subtle)',
      borderTop: '1px solid var(--border-subtle)',
      borderRadius: '24px 24px 0 0',
      ...style,
    }}>
      {children}
    </div>
  );
}
