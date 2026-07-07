// [UGP-PATCHED] HUD removed — managed by UniversalGamePlayer
import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * PhaseLock — Original DopaMind Game
 * 
 * Concept: Two concentric rings rotate in opposite directions at different speeds.
 * Each ring has a "gate" (a colored gap). The player must tap ONLY when both gates 
 * align — creating a brief window of opportunity. Tapping at the wrong time is a miss.
 * 
 * As levels progress: a third ring appears, speeds change dynamically, and the gates
 * shrink in size, demanding increasingly precise timing and multi-layer attention.
 * 
 * This has never existed because no game has combined multi-ring phase-alignment 
 * with shrinking tolerance windows as a cognitive training mechanic.
 * 
 * Cognitive Target: Temporal Synchronization & Divided Sustained Attention
 */
export default function PhaseLock({ onComplete, onQuit, onHudUpdate }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const gameOverRef = useRef(false);

  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [totalTaps, setTotalTaps] = useState(0);

  const anglesRef = useRef([0, Math.PI]);
  const speedsRef = useRef([0.02, -0.015]);
  const gateWidthRef = useRef(0.35);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const mistakesRef = useRef(0);
  const reactionTimes = useRef([]);
  const lastSuccessTime = useRef(Date.now());

  const RING_RADII = [130, 95, 60];
  const RING_COLORS = ['#34d399', '#f59e0b', '#ec4899'];

  const getNumRings = () => {
    const lv = levelRef.current;
    if (lv < 4) return 2;
    return 3;
  };

  const areGatesAligned = () => {
    const numRings = getNumRings();
    const angles = anglesRef.current;
    const gateWidth = gateWidthRef.current;

    for (let i = 0; i < numRings - 1; i++) {
      const a1 = ((angles[i] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const a2 = ((angles[i + 1] % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      let diff = Math.abs(a1 - a2);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      if (diff > gateWidth) return false;
    }
    return true;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const numRings = getNumRings();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rings
    for (let i = 0; i < numRings; i++) {
      const radius = RING_RADII[i];
      const angle = anglesRef.current[i];
      const gateWidth = gateWidthRef.current;

      // Ring track
      ctx.beginPath();
      ctx.arc(cx, cy, radius, angle + gateWidth / 2, angle + 2 * Math.PI - gateWidth / 2);
      ctx.strokeStyle = RING_COLORS[i];
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Gate markers
      const gateStartAngle = angle - gateWidth / 2;
      const gateEndAngle = angle + gateWidth / 2;
      for (const ga of [gateStartAngle, gateEndAngle]) {
        const gx = cx + Math.cos(ga) * radius;
        const gy = cy + Math.sin(ga) * radius;
        ctx.beginPath();
        ctx.arc(gx, gy, 5, 0, 2 * Math.PI);
        ctx.fillStyle = RING_COLORS[i];
        ctx.fill();
      }
    }

    // Center indicator
    const aligned = areGatesAligned();
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = aligned ? '#34d399' : 'rgba(255,255,255,0.1)';
    ctx.fill();
    if (aligned) {
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 320;
    canvas.height = 320;

    const tick = () => {
      if (gameOverRef.current) return;
      const numRings = getNumRings();
      for (let i = 0; i < numRings; i++) {
        anglesRef.current[i] += speedsRef.current[i];
      }
      draw();
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, [draw]);

  const advanceLevel = () => {
    const newLevel = levelRef.current + 1;
    levelRef.current = newLevel;
    setLevel(newLevel);

    // Speed up and shrink gates
    const speedMult = 1 + newLevel * 0.08;
    speedsRef.current = [0.02 * speedMult, -0.015 * speedMult, 0.012 * speedMult];
    gateWidthRef.current = Math.max(0.15, 0.35 - newLevel * 0.02);
  };

  const handleTap = () => {
    if (gameOverRef.current) return;
    setTotalTaps(t => t + 1);
    const now = Date.now();

    if (areGatesAligned()) {
      reactionTimes.current.push(now - lastSuccessTime.current);
      lastSuccessTime.current = now;
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setFeedback("hit");
      setTimeout(() => setFeedback(null), 300);
      advanceLevel();
    } else {
      mistakesRef.current += 1;
      setMistakes(mistakesRef.current);
      setFeedback("miss");
      setTimeout(() => setFeedback(null), 300);

      if (mistakesRef.current >= 3) {
        gameOverRef.current = true;
        setGameOver(true);
        const total = scoreRef.current + mistakesRef.current;
        const accuracy = total > 0 ? Math.round((scoreRef.current / total) * 100) : 0;
        const avgSpeed = reactionTimes.current.length > 0
          ? (reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length / 1000).toFixed(3)
          : 0;
        setTimeout(() => {
          onComplete({
            score: scoreRef.current,
            attempts: total,
            accuracy_percent: accuracy,
            avg_speed_seconds: avgSpeed
          });
        }, 1000);
      }
    }
  };

  return (
    <div className="active-game-container">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '16px',
        gap: '16px'
      }}>
        <div style={{
          position: 'relative',
          borderRadius: '50%',
          border: feedback === 'hit' ? '3px solid var(--color-emerald-base)' : feedback === 'miss' ? '3px solid var(--color-error-coral)' : '3px solid transparent',
          transition: 'border-color 0.2s',
          padding: '4px'
        }}>
          <canvas ref={canvasRef} style={{ display: 'block' }} />
          {gameOver && (
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <h2 style={{ color: 'var(--color-error-coral)', fontSize: '1.5rem', fontWeight: 900 }}>DESYNC</h2>
            </div>
          )}
        </div>

        <button
          className="btn-primary"
          onClick={handleTap}
          disabled={gameOver}
          style={{
            width: '200px',
            padding: '18px',
            fontSize: '1.2rem',
            fontWeight: '800',
            borderRadius: '16px',
            boxShadow: feedback === 'hit' ? '0 0 20px rgba(52,211,153,0.4)' : 'none'
          }}
        >
          {gameOver ? 'Game Over' : 'LOCK'}
        </button>
      </div>

      <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '16px', fontSize: '0.85rem' }}>
        Tap LOCK only when the ring gates align. 3 misses and it's over.
      </p>

      <div className="action-buttons-group" style={{ marginTop: '16px' }}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
