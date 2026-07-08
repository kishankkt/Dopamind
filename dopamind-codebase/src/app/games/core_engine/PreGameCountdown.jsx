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

            {/* Level */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.05)', borderRadius: 16,
              padding: '8px 20px', margin: '16px 0',
            }}>
              <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Your Level</span>
              <span style={{ fontWeight: 900, fontSize: '1.2rem', color }}>
                {level}
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                {LEVEL_LABELS[level] || ''}
              </span>
            </div>

            {/* Motivational message */}
            <p style={{
              margin: '0 0 28px',
              fontSize: '1rem',
              fontWeight: 600,
              opacity: 0.8,
              lineHeight: 1.5,
              fontStyle: 'italic',
              color: 'var(--text-main, white)',
            }}>
              "{message}"
            </p>

            {/* Time selector */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: 10 }}>
                {canControlTime ? 'Set your focus time:' : `Focus time: ${Math.round(sessionSecs / 60)} min (unlocks after 3 plays)`}
              </p>
              {canControlTime ? (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {PRESET_TIMES.map(t => (
                    <button
                      key={t.secs}
                      onClick={() => setSessionSecs(t.secs)}
                      style={{
                        padding: '8px 14px', borderRadius: 12, fontWeight: 700, fontSize: '0.82rem',
                        border: `1.5px solid ${sessionSecs === t.secs ? color : 'rgba(255,255,255,0.12)'}`,
                        background: sessionSecs === t.secs ? `${color}22` : 'transparent',
                        color: sessionSecs === t.secs ? color : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: `${color}11`, borderRadius: 12, padding: '8px 20px',
                  fontSize: '1.1rem', fontWeight: 800, color,
                  display: 'inline-block',
                }}>
                  {Math.round(sessionSecs / 60)} min session
                </div>
              )}
            </div>

            {/* SpeedMatch Minimal Config */}
            {gameInfo?.id === 'speedmatch' && (
              <div style={{ marginBottom: 24, background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6, marginBottom: 4 }}>
                      <span>Click Cooldown</span>
                      <span>{(gameConfig.clickCooldownMs/1000).toFixed(1)}s</span>
                    </div>
                    <input type="range" min="0" max="2000" step="100" 
                      value={gameConfig.clickCooldownMs} 
                      onChange={e => setGameConfig({...gameConfig, clickCooldownMs: Number(e.target.value)})}
                      style={{ width: '100%', accentColor: color, height: 4 }}
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.6, marginBottom: 4 }}>
                      <span>Card Time Limit</span>
                      <span>{(gameConfig.cardTimeLimitMs/1000).toFixed(1)}s</span>
                    </div>
                    <input type="range" min="1000" max="5000" step="500" 
                      value={gameConfig.cardTimeLimitMs} 
                      onChange={e => setGameConfig({...gameConfig, cardTimeLimitMs: Number(e.target.value)})}
                      style={{ width: '100%', accentColor: color, height: 4 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tagline */}
            <p style={{ fontSize: '0.8rem', opacity: 0.4, marginBottom: 20 }}>
              Processing Speed · Focus
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 0, padding: '14px 20px', borderRadius: 16,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem',
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
