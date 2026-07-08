/**
 * PreGameCountdown.jsx — DopaMind Pre-Game Focus Modal
 *
 * Shown before every game starts. Shows:
 *   - Game name, cognitive target, category color
 *   - User's current level + what difficultyValue that means
 *   - Configurable session time (locked for first 3 plays, then user-controlled)
 *   - 5-second animated countdown
 *   - Motivational AI-style message
 *
 * Props:
 *   gameInfo      — from gameRegistry
 *   level         — current adaptive level (1-10)
 *   difficultyValue
 *   gamesPlayed   — total plays of this game (unlock timer control after 3)
 *   defaultSeconds — default session duration
 *   onStart(sessionSeconds) — called when countdown finishes
 *   onCancel()
 */

import React, { useState, useEffect, useRef } from 'react';

// Inline beep — no import needed, same AudioContext pattern
function beep(freq = 440, duration = 0.12, gain = 0.18) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    vol.gain.setValueAtTime(0, ctx.currentTime);
    vol.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.01);
    setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
  } catch(e) {}
}

const FOCUS_MESSAGES = {
  'Quick Reflexes':    ['Your reflexes fire faster than you think. Trust them.', 'Speed is a skill. Sharpen it.', 'React. Don\'t overthink. React.'],
  'Stay Sharp':        ['Pattern recognition is your brain\'s superpower.', 'See the signal through the noise.', 'Attention is a muscle. Work it.'],
  'Remember & Recall': ['Your memory is stronger than you believe.', 'Encode it. Hold it. Recall it.', 'Working memory is built round by round.'],
  'Think & Solve':     ['Let your prefrontal cortex lead.', 'Logic over impulse. Solve it.', 'Every equation is a small victory.'],
  'Word Power':        ['The Stroop effect is real. Beat it.', 'Words lie. Colors don\'t.', 'Train your brain to see through noise.'],
  'Sort & Prioritize': ['Prioritization is an executive skill.', 'What matters most? Decide fast.', 'Sort your way to clarity.'],
};

const CAT_COLOR = {
  'Quick Reflexes':    '#f97316',
  'Stay Sharp':        '#3b82f6',
  'Remember & Recall': '#8b5cf6',
  'Think & Solve':     '#10b981',
  'Word Power':        '#ec4899',
  'Sort & Prioritize': '#eab308',
};

const LEVEL_LABELS = ['', 'Beginner', 'Beginner', 'Warm Up', 'Warm Up', 'Active', 'Active', 'Sharp', 'Sharp', 'Elite', 'Master'];

const PRESET_TIMES = [
  { label: '1 min', secs: 60 },
  { label: '2 min', secs: 120 },
  { label: '3 min', secs: 180 },
  { label: '5 min', secs: 300 },
  { label: '10 min', secs: 600 },
];

export default function PreGameCountdown({
  gameInfo,
  level = 1,
  difficultyValue,
  gamesPlayed = 0,
  defaultSeconds = 300,
  onStart,
  onCancel,
}) {
  const [phase, setPhase] = useState('preview'); // preview | countdown
  const [countdown, setCountdown] = useState(3);
  const [sessionSecs, setSessionSecs] = useState(defaultSeconds);
  const [gameConfig, setGameConfig] = useState({
    clickCooldownMs: 300,
    cardTimeLimitMs: 3000
  });
  const [showSettings, setShowSettings] = useState(false);
  const color = CAT_COLOR[gameInfo?.category] || '#10b981';
  const messages = FOCUS_MESSAGES[gameInfo?.category] || ['Focus. Breathe. Begin.'];
  const message = useRef(messages[Math.floor(Math.random() * messages.length)]).current;
  const timerRef = useRef(null);

  const canControlTime = true;

  const handleBegin = () => {
    setPhase('countdown');
    setCountdown(3);
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    beep(440, 0.12, 0.2); // immediate first beep on entry
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          beep(880, 0.25, 0.28); // Go! — bright
          setTimeout(() => onStart(sessionSecs, gameConfig), 200);
          return 0;
        }
        const next = prev - 1;
        beep(next === 1 ? 660 : 440, 0.12, 0.2); // rising pitch
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0,0,0,0.82)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--brand-surface, rgba(20,25,20,0.98))',
        border: `1.5px solid ${color}33`,
        borderRadius: 32,
        padding: '32px 24px', // Reduced padding
        maxWidth: 420,
        width: '100%',
        maxHeight: '92vh',    // Fix overflow on small screens
        overflowY: 'auto',
        color: 'var(--text-main)',
        boxShadow: `0 0 80px ${color}22, 0 32px 64px rgba(0,0,0,0.5)`,
        textAlign: 'center',
        animation: 'preGameIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}>

        {phase === 'preview' && (
          <>
            {/* Category badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${color}18`, border: `1px solid ${color}44`,
              borderRadius: 20, padding: '4px 12px', marginBottom: 20,
              fontSize: '0.75rem', fontWeight: 700, color,
              textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>
              {gameInfo?.category}
            </div>

            {/* Game name */}
            <h2 style={{ margin: '0 0 6px', fontSize: '2rem', fontWeight: 900, color: 'var(--text-main, white)' }}>
              {gameInfo?.name}
            </h2>
            <p style={{ margin: '0 0 6px', opacity: 0.55, fontSize: '0.85rem' }}>
              {gameInfo?.cognitiveTarget}
            </p>

            {/* Advanced Settings Accordion */}
            <div style={{
              margin: '24px 0',
              background: 'var(--border-subtle)',
              borderRadius: 16,
              overflow: 'hidden',
              border: `1px solid var(--border-subtle)`
            }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', background: 'transparent', border: 'none',
                  color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer'
                }}
              >
                <span>⚙️ Game Settings</span>
                <span style={{ transform: showSettings ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }}>▼</span>
              </button>

              {showSettings && (
                <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 24, animation: 'preGameIn 0.2s ease' }}>
                  
                  {/* Focus Time */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 600 }}>Focus Time (Minutes)</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color }}>{sessionSecs === 0 ? 'Endless' : (sessionSecs / 60)}</span>
                        <button onClick={() => setSessionSecs(sessionSecs === 0 ? 60 : 0)} style={{
                          padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700,
                          background: sessionSecs === 0 ? `${color}22` : 'transparent',
                          border: `1px solid ${sessionSecs === 0 ? color : 'var(--border-subtle)'}`,
                          color: sessionSecs === 0 ? color : 'var(--text-main)', opacity: sessionSecs === 0 ? 1 : 0.6, cursor: 'pointer'
                        }}>Off</button>
                      </div>
                    </div>
                    {sessionSecs > 0 && (
                       <input type="range" min="60" max="1200" step="60" value={sessionSecs} onChange={e => setSessionSecs(Number(e.target.value))} style={{ width: '100%', accentColor: color, height: 4 }} />
                    )}
                  </div>

                  {/* Click Cooldown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 600 }}>Click Cooldown</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color }}>{gameConfig.clickCooldownMs === 0 ? 'Instant' : (gameConfig.clickCooldownMs/1000).toFixed(1) + 's'}</span>
                        <button onClick={() => setGameConfig({...gameConfig, clickCooldownMs: gameConfig.clickCooldownMs === 0 ? 300 : 0})} style={{
                          padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700,
                          background: gameConfig.clickCooldownMs === 0 ? `${color}22` : 'transparent',
                          border: `1px solid ${gameConfig.clickCooldownMs === 0 ? color : 'var(--border-subtle)'}`,
                          color: gameConfig.clickCooldownMs === 0 ? color : 'var(--text-main)', opacity: gameConfig.clickCooldownMs === 0 ? 1 : 0.6, cursor: 'pointer'
                        }}>Off</button>
                      </div>
                    </div>
                    {gameConfig.clickCooldownMs > 0 && (
                      <input type="range" min="100" max="2000" step="100" value={gameConfig.clickCooldownMs} onChange={e => setGameConfig({...gameConfig, clickCooldownMs: Number(e.target.value)})} style={{ width: '100%', accentColor: color, height: 4 }} />
                    )}
                  </div>

                  {/* Card Time Limit */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 600 }}>Card Time Limit</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color }}>{gameConfig.cardTimeLimitMs === 0 ? 'No Limit' : (gameConfig.cardTimeLimitMs/1000).toFixed(1) + 's'}</span>
                        <button onClick={() => setGameConfig({...gameConfig, cardTimeLimitMs: gameConfig.cardTimeLimitMs === 0 ? 3000 : 0})} style={{
                          padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700,
                          background: gameConfig.cardTimeLimitMs === 0 ? `${color}22` : 'transparent',
                          border: `1px solid ${gameConfig.cardTimeLimitMs === 0 ? color : 'var(--border-subtle)'}`,
                          color: gameConfig.cardTimeLimitMs === 0 ? color : 'var(--text-main)', opacity: gameConfig.cardTimeLimitMs === 0 ? 1 : 0.6, cursor: 'pointer'
                        }}>Off</button>
                      </div>
                    </div>
                    {gameConfig.cardTimeLimitMs > 0 && (
                      <input type="range" min="1000" max="10000" step="500" value={gameConfig.cardTimeLimitMs} onChange={e => setGameConfig({...gameConfig, cardTimeLimitMs: Number(e.target.value)})} style={{ width: '100%', accentColor: color, height: 4 }} />
                    )}
                  </div>
                  
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 0, padding: '14px 20px', borderRadius: 16,
                  background: 'transparent', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)', opacity: 0.5, cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                Back
              </button>
              <button
                onClick={handleBegin}
                style={{
                  flex: 1, padding: '16px', borderRadius: 16,
                  background: color, border: 'none',
                  color: 'white', fontWeight: 900, fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: `0 0 30px ${color}44`,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.target.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
              >
                Start Focus Session →
              </button>
            </div>
          </>
        )}

        {phase === 'countdown' && (
          <div style={{ padding: '20px 0' }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.5, marginBottom: 16 }}>Get Ready…</p>
            <div style={{
              width: 120, height: 120, margin: '0 auto 24px',
              borderRadius: '50%',
              border: `4px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '4rem', fontWeight: 900, color,
              boxShadow: `0 0 60px ${color}44`,
              animation: 'countdownPulse 1s ease infinite',
            }}>
              {countdown}
            </div>
            <p style={{ opacity: 0.6, fontWeight: 600, fontSize: '1rem' }}>
              {countdown > 3 ? 'Clear your mind…' : countdown > 1 ? 'Focus…' : 'Go!'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes preGameIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes countdownPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
