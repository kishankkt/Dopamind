// [UGP-PATCHED] HUD removed — managed by UniversalGamePlayer
import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * EchoMap — Original DopaMind Game
 * 
 * Concept: A grid of identical-looking tiles. One tile emits a brief "pulse" 
 * (glow). Then another tile pulses. The player must remember the ENTIRE chain 
 * of pulses and replay them in REVERSE order. After each successful reversal, 
 * the chain grows by one more pulse, creating an infinitely scaling reverse-
 * memory test.
 * 
 * The twist: Every 5 levels, the grid ROTATES 90 degrees, forcing the player 
 * to mentally re-map the spatial positions they memorized onto a new orientation.
 * 
 * This has never existed because reverse-recall + spatial rotation has never 
 * been combined in a single game mechanic.
 * 
 * Cognitive Target: Reverse Working Memory + Mental Rotation
 */
export default function EchoMap({ onComplete, onQuit, onHudUpdate }) {
  const GRID_SIZE = 4;
  const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [phase, setPhase] = useState("showing"); // showing | input | rotating | success | fail
  const [activeTile, setActiveTile] = useState(null);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [showingIndex, setShowingIndex] = useState(-1);

  const reactionTimes = useRef([]);
  const inputStartRef = useRef(Date.now());
  const timeoutRef = useRef(null);

  const generateSequence = useCallback((length) => {
    const seq = [];
    for (let i = 0; i < length; i++) {
      let next;
      do {
        next = Math.floor(Math.random() * TOTAL_TILES);
      } while (seq.length > 0 && seq[seq.length - 1] === next);
      seq.push(next);
    }
    return seq;
  }, []);

  const showSequence = useCallback((seq) => {
    setPhase("showing");
    setShowingIndex(-1);
    let i = 0;
    const show = () => {
      if (i < seq.length) {
        setActiveTile(seq[i]);
        setShowingIndex(i);
        timeoutRef.current = setTimeout(() => {
          setActiveTile(null);
          i++;
          timeoutRef.current = setTimeout(show, 300);
        }, 600);
      } else {
        setPhase("input");
        setPlayerInput([]);
        inputStartRef.current = Date.now();
      }
    };
    timeoutRef.current = setTimeout(show, 800);
  }, []);

  useEffect(() => {
    const seq = generateSequence(2);
    setSequence(seq);
    showSequence(seq);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleTileTap = (tileIndex) => {
    if (phase !== "input") return;

    const reversedSequence = [...sequence].reverse();
    const expectedIndex = playerInput.length;
    const expected = reversedSequence[expectedIndex];

    const now = Date.now();
    reactionTimes.current.push(now - inputStartRef.current);
    inputStartRef.current = now;

    const newInput = [...playerInput, tileIndex];
    setPlayerInput(newInput);

    if (tileIndex === expected) {
      setActiveTile(tileIndex);
      setTimeout(() => setActiveTile(null), 200);

      if (newInput.length === reversedSequence.length) {
        // Level complete
        setScore(s => s + 1);
        const nextLevel = level + 1;
        setLevel(nextLevel);

        if (nextLevel % 5 === 0) {
          // Rotation event
          setPhase("rotating");
          setTimeout(() => {
            setRotation(r => (r + 90) % 360);
            setTimeout(() => {
              const newSeq = generateSequence(2 + nextLevel);
              setSequence(newSeq);
              showSequence(newSeq);
            }, 800);
          }, 600);
        } else {
          setPhase("success");
          setTimeout(() => {
            const newSeq = generateSequence(2 + nextLevel);
            setSequence(newSeq);
            showSequence(newSeq);
          }, 800);
        }
      }
    } else {
      // Wrong tile — game over
      setMistakes(m => m + 1);
      setPhase("fail");

      const totalAttempts = score + mistakes + 1;
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
      }, 1200);
    }
  };

  const getTileStyle = (index) => {
    const isActive = activeTile === index;
    const isPlayerTapped = phase === "input" && playerInput.includes(index);
    return {
      width: '100%',
      aspectRatio: '1',
      borderRadius: '12px',
      border: isActive ? '2px solid var(--color-emerald-base)' : '2px solid rgba(255,255,255,0.08)',
      background: isActive
        ? 'var(--color-emerald-base)'
        : isPlayerTapped
          ? 'rgba(52, 211, 153, 0.2)'
          : 'rgba(255,255,255,0.05)',
      cursor: phase === "input" ? 'pointer' : 'default',
      transition: 'all 0.15s ease',
      boxShadow: isActive ? '0 0 25px rgba(52, 211, 153, 0.5)' : 'none',
      transform: isActive ? 'scale(0.92)' : 'scale(1)'
    };
  };

  return (
    <div className="active-game-container">
      <div style={{ textAlign: 'center', margin: '16px 0', minHeight: '28px' }}>
        {phase === "showing" && (
          <span className="animate-pulse" style={{ color: 'var(--color-emerald-base)', fontWeight: 700 }}>
            Memorize the pulse sequence... ({showingIndex + 1}/{sequence.length})
          </span>
        )}
        {phase === "input" && (
          <span style={{ color: 'var(--color-accent-gold)', fontWeight: 700 }}>
            Replay in REVERSE! ({playerInput.length}/{sequence.length})
          </span>
        )}
        {phase === "rotating" && (
          <span className="animate-pulse" style={{ color: '#ec4899', fontWeight: 700, fontSize: '1.2rem' }}>
            GRID ROTATION!
          </span>
        )}
        {phase === "success" && (
          <span style={{ color: 'var(--color-emerald-base)', fontWeight: 700 }}>
            ✓ Perfect Reversal!
          </span>
        )}
        {phase === "fail" && (
          <span style={{ color: 'var(--color-error-coral)', fontWeight: 700, fontSize: '1.2rem' }}>
            Wrong tile. Chain broken.
          </span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gap: '10px',
        maxWidth: '340px',
        margin: '0 auto',
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {Array.from({ length: TOTAL_TILES }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleTileTap(i)}
            style={getTileStyle(i)}
            disabled={phase !== "input"}
          />
        ))}
      </div>

      <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '16px', fontSize: '0.85rem' }}>
        Watch the glowing tiles, then tap them back in REVERSE order. Every 5 levels the grid rotates.
      </p>

      <div className="action-buttons-group" style={{ marginTop: '24px' }}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
