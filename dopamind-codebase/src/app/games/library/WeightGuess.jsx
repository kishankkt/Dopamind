// [UGP-PATCHED] HUD removed — managed by UniversalGamePlayer
import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * WeightGuess — Original DopaMind Game
 * 
 * Concept: Two objects appear on a virtual balance beam. Each object is a 
 * geometric shape with a number inside it. The NUMBER is misleading — the 
 * actual "weight" is determined by the SHAPE (circle > square > triangle > diamond).
 * The player must tap the side they believe is heavier based on shape-weight rules,
 * NOT the visible numbers.
 * 
 * As levels progress: objects stack (2-3 shapes per side), requiring mental addition
 * of shape-weights while ignoring the misleading numbers. The numbers become 
 * increasingly convincing decoys.
 * 
 * This has never existed because no game has combined Stroop-like number interference
 * with shape-based weight logic on a balance beam as a cognitive conflict mechanic.
 * 
 * Cognitive Target: Cognitive Conflict Resolution & Rule-Based Reasoning Under Interference
 */
export default function WeightGuess({ onComplete, onQuit, onHudUpdate }) {
  const SHAPE_WEIGHTS = { circle: 4, square: 3, triangle: 2, diamond: 1 };
  const SHAPES = ['circle', 'square', 'triangle', 'diamond'];

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [round, setRound] = useState(1);
  const [leftSide, setLeftSide] = useState([]);
  const [rightSide, setRightSide] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [tiltDirection, setTiltDirection] = useState(null);

  const reactionTimes = useRef([]);
  const roundStart = useRef(Date.now());
  const totalAttempts = useRef(0);

  const generateSide = useCallback((numItems) => {
    const items = [];
    for (let i = 0; i < numItems; i++) {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      // The decoy number is intentionally misleading
      const decoyNum = Math.floor(Math.random() * 9) + 1;
      items.push({ shape, decoyNum, weight: SHAPE_WEIGHTS[shape] });
    }
    return items;
  }, []);

  const generateRound = useCallback(() => {
    const itemCount = Math.min(1 + Math.floor((level - 1) / 3), 3);
    let left, right, leftWeight, rightWeight;
    do {
      left = generateSide(itemCount);
      right = generateSide(itemCount);
      leftWeight = left.reduce((s, i) => s + i.weight, 0);
      rightWeight = right.reduce((s, i) => s + i.weight, 0);
    } while (leftWeight === rightWeight);

    setLeftSide(left);
    setRightSide(right);
    setFeedback(null);
    setTiltDirection(null);
    roundStart.current = Date.now();
  }, [level, generateSide]);

  useEffect(() => {
    generateRound();
  }, []);

  const handleChoice = (side) => {
    if (feedback || gameOver) return;

    const now = Date.now();
    reactionTimes.current.push(now - roundStart.current);
    totalAttempts.current += 1;

    const leftWeight = leftSide.reduce((s, i) => s + i.weight, 0);
    const rightWeight = rightSide.reduce((s, i) => s + i.weight, 0);
    const correct = (side === 'left' && leftWeight > rightWeight) || (side === 'right' && rightWeight > leftWeight);

    setTiltDirection(leftWeight > rightWeight ? 'left' : 'right');

    if (correct) {
      setScore(s => s + 1);
      setFeedback("correct");
      setTimeout(() => {
        const newRound = round + 1;
        setRound(newRound);
        if (newRound % 4 === 0) setLevel(l => l + 1);
        generateRound();
      }, 1200);
    } else {
      setMistakes(m => m + 1);
      setFeedback("wrong");
      if (mistakes + 1 >= 3) {
        setGameOver(true);
        const total = totalAttempts.current;
        const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
        const avgSpeed = reactionTimes.current.length > 0
          ? (reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length / 1000).toFixed(3)
          : 0;
        setTimeout(() => {
          onComplete({
            score,
            attempts: total,
            accuracy_percent: accuracy,
            avg_speed_seconds: avgSpeed
          });
        }, 1200);
      } else {
        setTimeout(() => {
          const newRound = round + 1;
          setRound(newRound);
          generateRound();
        }, 1500);
      }
    }
  };

  const renderShape = (item, idx) => {
    const shapeStyle = {
      width: '56px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.3rem',
      fontWeight: '900',
      color: 'white',
      textShadow: '0 1px 4px rgba(0,0,0,0.4)'
    };

    const colors = {
      circle: '#34d399',
      square: '#3b82f6',
      triangle: '#f59e0b',
      diamond: '#ec4899'
    };

    if (item.shape === 'circle') {
      return (
        <div key={idx} style={{ ...shapeStyle, borderRadius: '50%', background: colors.circle }}>
          {item.decoyNum}
        </div>
      );
    }
    if (item.shape === 'square') {
      return (
        <div key={idx} style={{ ...shapeStyle, borderRadius: '8px', background: colors.square }}>
          {item.decoyNum}
        </div>
      );
    }
    if (item.shape === 'triangle') {
      return (
        <div key={idx} style={{
          width: 0, height: 0,
          borderLeft: '28px solid transparent',
          borderRight: '28px solid transparent',
          borderBottom: `56px solid ${colors.triangle}`,
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute',
            top: '20px',
            left: '-8px',
            fontSize: '1.1rem',
            fontWeight: 900,
            color: 'white',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)'
          }}>{item.decoyNum}</span>
        </div>
      );
    }
    // Diamond
    return (
      <div key={idx} style={{
        ...shapeStyle,
        background: colors.diamond,
        borderRadius: '4px',
        transform: 'rotate(45deg)',
        width: '42px',
        height: '42px'
      }}>
        <span style={{ transform: 'rotate(-45deg)' }}>{item.decoyNum}</span>
      </div>
    );
  };

  const beamRotation = tiltDirection === 'left' ? -8 : tiltDirection === 'right' ? 8 : 0;

  return (
    <div className="active-game-container">
      {/* Weight Key */}
      <div style={{
        display: 'flex', gap: '12px', justifyContent: 'center', margin: '12px 0', flexWrap: 'wrap'
      }}>
        {SHAPES.map(s => (
          <span key={s} style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            opacity: 0.7
          }}>
            {s}: {SHAPE_WEIGHTS[s]}kg
          </span>
        ))}
      </div>

      {/* Balance Beam */}
      <div style={{ position: 'relative', margin: '24px auto', maxWidth: '400px' }}>
        {/* Fulcrum */}
        <div style={{
          width: 0, height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderBottom: '30px solid rgba(255,255,255,0.2)',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }} />

        {/* Beam */}
        <div style={{
          height: '6px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '3px',
          transform: `rotate(${beamRotation}deg)`,
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          marginTop: '-3px',
          position: 'relative',
          zIndex: 1
        }} />

        {/* Sides */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          <button
            onClick={() => handleChoice('left')}
            disabled={!!feedback || gameOver}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '20px',
              background: feedback === 'correct' && tiltDirection === 'left' ? 'rgba(52,211,153,0.15)'
                : feedback === 'wrong' && tiltDirection !== 'left' ? 'rgba(239,68,68,0.1)'
                : 'rgba(255,255,255,0.03)',
              border: '2px solid var(--border)',
              borderRadius: '16px',
              cursor: feedback ? 'default' : 'pointer',
              transition: 'all 0.2s',
              marginRight: '8px'
            }}
          >
            {leftSide.map((item, i) => renderShape(item, i))}
            <span style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '8px', opacity: 0.7 }}>LEFT</span>
          </button>

          <button
            onClick={() => handleChoice('right')}
            disabled={!!feedback || gameOver}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '20px',
              background: feedback === 'correct' && tiltDirection === 'right' ? 'rgba(52,211,153,0.15)'
                : feedback === 'wrong' && tiltDirection !== 'right' ? 'rgba(239,68,68,0.1)'
                : 'rgba(255,255,255,0.03)',
              border: '2px solid var(--border)',
              borderRadius: '16px',
              cursor: feedback ? 'default' : 'pointer',
              transition: 'all 0.2s',
              marginLeft: '8px'
            }}
          >
            {rightSide.map((item, i) => renderShape(item, i))}
            <span style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '8px', opacity: 0.7 }}>RIGHT</span>
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="animate-pop" style={{ textAlign: 'center', marginTop: '12px' }}>
          <p style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: feedback === 'correct' ? 'var(--color-emerald-base)' : 'var(--color-error-coral)',
            margin: 0
          }}>
            {feedback === 'correct' ? '✓ Correct!' : '✗ The numbers lied!'}
          </p>
        </div>
      )}

      <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '12px', fontSize: '0.8rem' }}>
        Ignore the numbers. Tap the HEAVIER side based on shape weights. 3 wrong = game over.
      </p>

      <div className="action-buttons-group" style={{ marginTop: '12px' }}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
