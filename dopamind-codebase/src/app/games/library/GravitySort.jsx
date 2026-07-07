// [UGP-PATCHED] HUD removed — managed by UniversalGamePlayer
import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * GravitySort — Original DopaMind Game
 * 
 * Concept: Numbered orbs "fall" from the top of the screen at varying speeds.
 * The player must tap them in ascending numerical order before any orb hits the 
 * bottom. The twist: orbs fall at different speeds based on their value — higher 
 * numbers fall faster, creating a constant prioritization conflict between 
 * "what's closest to the ground" vs "what's next in sequence."
 * 
 * As levels progress, the number of simultaneous orbs increases and gravity 
 * accelerates. The game is endless — it only ends when an orb hits the floor.
 * 
 * Cognitive Target: Executive Prioritization & Sustained Selective Attention
 */
export default function GravitySort({ onComplete, onQuit, onHudUpdate }) {
  const [orbs, setOrbs] = useState([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wave, setWave] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);

  const frameRef = useRef(null);
  const orbIdCounter = useRef(0);
  const spawnTimer = useRef(null);
  const startTimeRef = useRef(Date.now());
  const reactionTimes = useRef([]);
  const lastTapTime = useRef(Date.now());
  const containerRef = useRef(null);
  const gameOverRef = useRef(false);

  const ARENA_HEIGHT = 400;
  const ORB_SIZE = 52;

  const spawnOrb = useCallback((num, gravityMultiplier) => {
    const speed = (0.3 + Math.random() * 0.4 + (num * 0.05)) * gravityMultiplier;
    const xPos = 10 + Math.random() * 75;
    orbIdCounter.current += 1;
    return {
      id: orbIdCounter.current,
      num,
      x: xPos,
      y: 0,
      speed,
      alive: true
    };
  }, []);

  const spawnWave = useCallback((waveNum) => {
    const count = Math.min(3 + waveNum, 9);
    const baseNum = (waveNum - 1) * count + 1;
    const gravityMult = 1 + (waveNum - 1) * 0.12;
    const newOrbs = [];
    for (let i = 0; i < count; i++) {
      const orb = spawnOrb(baseNum + i, gravityMult);
      orb.y = -(i * 35 + Math.random() * 20);
      newOrbs.push(orb);
    }
    setOrbs(prev => [...prev.filter(o => o.alive), ...newOrbs]);
  }, [spawnOrb]);

  useEffect(() => {
    spawnWave(1);
    startTimeRef.current = Date.now();
    lastTapTime.current = Date.now();
    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(spawnTimer.current);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      if (gameOverRef.current) return;
      setOrbs(prev => {
        const updated = prev.map(o => ({
          ...o,
          y: o.alive ? o.y + o.speed : o.y
        }));
        const fallen = updated.find(o => o.alive && o.y >= ARENA_HEIGHT - ORB_SIZE);
        if (fallen) {
          gameOverRef.current = true;
          setGameOver(true);
          return updated;
        }
        return updated;
      });
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const handleOrbTap = (orb) => {
    if (gameOver || !orb.alive) return;
    const now = Date.now();
    if (orb.num === nextExpected) {
      reactionTimes.current.push(now - lastTapTime.current);
      lastTapTime.current = now;
      setScore(s => s + 1);
      setCombo(c => c + 1);
      setOrbs(prev => prev.map(o => o.id === orb.id ? { ...o, alive: false } : o));
      const newExpected = nextExpected + 1;
      setNextExpected(newExpected);

      const aliveOrbs = orbs.filter(o => o.alive && o.id !== orb.id);
      if (aliveOrbs.length === 0) {
        const nextWave = wave + 1;
        setWave(nextWave);
        setTimeout(() => spawnWave(nextWave), 600);
      }
    } else {
      setMistakes(m => m + 1);
      setCombo(0);
    }
  };

  useEffect(() => {
    if (gameOver) {
      const totalAttempts = score + mistakes;
      const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
      const avgSpeed = reactionTimes.current.length > 0
        ? (reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length / 1000).toFixed(3)
        : 0;
      setTimeout(() => {
        onComplete({
          score,
          attempts: totalAttempts,
          accuracy_percent: accuracy,
          avg_speed_seconds: avgSpeed
        });
      }, 800);
    }
  }, [gameOver]);

  const getOrbColor = (num) => {
    const hue = (num * 37) % 360;
    return `hsl(${hue}, 70%, 55%)`;
  };

  return (
    <div className="active-game-container">
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: `${ARENA_HEIGHT}px`,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          marginTop: '16px'
        }}
      >
        {/* Floor danger zone */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '6px',
          background: 'linear-gradient(90deg, var(--color-error-coral), transparent, var(--color-error-coral))',
          opacity: 0.8
        }} />

        {orbs.filter(o => o.alive).map(orb => (
          <button
            key={orb.id}
            onClick={() => handleOrbTap(orb)}
            style={{
              position: 'absolute',
              left: `${orb.x}%`,
              top: `${orb.y}px`,
              width: `${ORB_SIZE}px`,
              height: `${ORB_SIZE}px`,
              borderRadius: '50%',
              background: orb.num === nextExpected
                ? 'var(--color-emerald-base)'
                : getOrbColor(orb.num),
              border: orb.num === nextExpected ? '3px solid white' : '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.1s',
              boxShadow: orb.num === nextExpected
                ? '0 0 20px rgba(52, 211, 153, 0.6)'
                : '0 4px 12px rgba(0,0,0,0.3)',
              transform: orb.num === nextExpected ? 'scale(1.1)' : 'scale(1)',
              zIndex: orb.num === nextExpected ? 10 : 1
            }}
          >
            {orb.num}
          </button>
        ))}

        {gameOver && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}>
            <h2 style={{ color: 'var(--color-error-coral)', fontSize: '2.5rem', fontWeight: 900 }}>
              GRAVITY WINS
            </h2>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', opacity: 0.6, marginTop: '12px', fontSize: '0.9rem' }}>
        Tap orbs in ascending order. Higher numbers fall faster. Don't let any hit the floor.
      </p>

      <div className="action-buttons-group" style={{ marginTop: '24px' }}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
