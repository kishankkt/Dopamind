// [UGP-PATCHED] HUD removed — managed by UniversalGamePlayer
import React, { useState, useEffect, useRef } from 'react';

/**
 * ChromaShift — Original DopaMind Game
 * 
 * Concept: The screen shows a color swatch that continuously morphs between two 
 * colors over several seconds. The player has a slider that controls WHERE on the 
 * gradient the swatch is. At random intervals, a TARGET color flashes briefly. 
 * The player must drag the slider to reproduce that exact target color from memory.
 * 
 * The closer the slider's color is to the target, the more points. As levels 
 * progress, the gradient becomes more subtle (e.g., very similar shades of blue),
 * and the target flash becomes shorter, demanding increasingly precise color memory.
 * 
 * This has never existed because no game has combined real-time gradient manipulation
 * with visual color memory recall as a scoring mechanic.
 * 
 * Cognitive Target: Visual Color Memory & Perceptual Precision
 */
export default function ChromaShift({ onComplete, onQuit, onHudUpdate }) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("flash"); // flash | recall | result
  const [sliderValue, setSliderValue] = useState(50);
  const [targetValue, setTargetValue] = useState(30);
  const [feedback, setFeedback] = useState(null);
  const [totalRounds, setTotalRounds] = useState(0);
  const [hueRange, setHueRange] = useState([120, 280]);
  const [flashDuration, setFlashDuration] = useState(1500);
  const [gameOver, setGameOver] = useState(false);
  const [consecutiveBad, setConsecutiveBad] = useState(0);

  const reactionTimes = useRef([]);
  const recallStart = useRef(Date.now());
  const timeoutRef = useRef(null);

  const getColorFromValue = (val) => {
    const hue = hueRange[0] + (val / 100) * (hueRange[1] - hueRange[0]);
    return `hsl(${hue}, 75%, 55%)`;
  };

  const startFlash = () => {
    const target = 10 + Math.floor(Math.random() * 80);
    setTargetValue(target);
    setSliderValue(50);
    setPhase("flash");
    setFeedback(null);

    timeoutRef.current = setTimeout(() => {
      setPhase("recall");
      recallStart.current = Date.now();
    }, flashDuration);
  };

  useEffect(() => {
    startFlash();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleSubmit = () => {
    if (phase !== "recall") return;

    const now = Date.now();
    reactionTimes.current.push(now - recallStart.current);

    const diff = Math.abs(sliderValue - targetValue);
    const accuracy = Math.max(0, 100 - diff * 2);
    const points = Math.round(accuracy / 10);

    setFeedback({ diff, accuracy, points });
    setScore(s => s + points);
    setTotalRounds(t => t + 1);
    setPhase("result");

    if (accuracy < 30) {
      setConsecutiveBad(prev => {
        const newVal = prev + 1;
        if (newVal >= 3) {
          setGameOver(true);
          const total = totalRounds + 1;
          const avgSpeed = reactionTimes.current.length > 0
            ? (reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length / 1000).toFixed(3)
            : 0;
          setTimeout(() => {
            onComplete({
              score: score + points,
              attempts: total,
              accuracy_percent: Math.round(((score + points) / (total * 10)) * 100),
              avg_speed_seconds: avgSpeed
            });
          }, 1200);
        }
        return newVal;
      });
    } else {
      setConsecutiveBad(0);
    }

    if (!gameOver) {
      timeoutRef.current = setTimeout(() => {
        const newRound = round + 1;
        setRound(newRound);
        if (newRound % 3 === 0) {
          const newLevel = level + 1;
          setLevel(newLevel);
          // Make gradient more subtle and flash shorter
          const range = Math.max(30, (hueRange[1] - hueRange[0]) - 15);
          const base = hueRange[0] + Math.random() * 60;
          setHueRange([base, base + range]);
          setFlashDuration(Math.max(400, flashDuration - 100));
        }
        startFlash();
      }, 1800);
    }
  };

  return (
    <div className="active-game-container">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        marginTop: '24px'
      }}>
        {/* Target Display */}
        <div style={{
          width: '180px',
          height: '180px',
          borderRadius: '24px',
          background: phase === "flash" || phase === "result"
            ? getColorFromValue(targetValue)
            : 'rgba(255,255,255,0.05)',
          border: '3px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s',
          boxShadow: phase === "flash" ? `0 0 40px ${getColorFromValue(targetValue)}` : 'none'
        }}>
          <span style={{
            color: 'white',
            fontWeight: 800,
            fontSize: '1rem',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            opacity: phase === "recall" ? 0 : 1
          }}>
            {phase === "flash" ? "MEMORIZE" : phase === "result" ? "TARGET" : "?"}
          </span>
        </div>

        {/* Player's color */}
        {(phase === "recall" || phase === "result") && (
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '16px',
            background: getColorFromValue(sliderValue),
            border: feedback && feedback.accuracy >= 70 ? '3px solid var(--color-emerald-base)' : '3px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.05s'
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              YOUR PICK
            </span>
          </div>
        )}

        {/* Slider */}
        {phase === "recall" && (
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{
              height: '12px',
              borderRadius: '6px',
              background: `linear-gradient(to right, ${getColorFromValue(0)}, ${getColorFromValue(50)}, ${getColorFromValue(100)})`,
              marginBottom: '12px'
            }} />
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <button
              className="btn-primary"
              onClick={handleSubmit}
              style={{ width: '100%', padding: '16px', marginTop: '16px', fontSize: '1.1rem', fontWeight: 700 }}
            >
              Lock Color
            </button>
          </div>
        )}

        {/* Feedback */}
        {phase === "result" && feedback && (
          <div className="animate-pop" style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: feedback.accuracy >= 70 ? 'var(--color-emerald-base)' : feedback.accuracy >= 40 ? 'var(--color-amber)' : 'var(--color-error-coral)',
              margin: 0
            }}>
              {feedback.accuracy}% Match
            </p>
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
              +{feedback.points} pts • Off by {feedback.diff} units
            </p>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px', fontSize: '0.85rem' }}>
        A color flashes. Reproduce it with the slider from memory. 3 bad matches in a row = game over.
      </p>

      <div className="action-buttons-group" style={{ marginTop: '16px' }}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
