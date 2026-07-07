// [UGP-PATCHED] HUD removed — managed by UniversalGamePlayer
import React, { useState, useRef } from 'react';

const LEVEL_TARGETS = [3500, 5000, 2200, 7800, 4500]; // ms targets

export default function TimeEstimator({ onComplete, onQuit, onHudUpdate }) {
  const [level, setLevel] = useState(1);
  const [state, setState] = useState("ready"); // ready, holding, result
  const [resultTime, setResultTime] = useState(0);
  const [score, setScore] = useState(0); // number of "perfect" or "good" attempts
  const [mistakes, setMistakes] = useState(0); // completely off attempts
  
  const startTime = useRef(0);
  const reactionTimes = useRef([]);

  const targetMs = LEVEL_TARGETS[level - 1];
  
  const handlePointerDown = (e) => {
    // Prevent default touch actions like text selection or context menus
    if(e.cancelable) e.preventDefault(); 
    
    if (state !== "ready") return;
    setState("holding");
    startTime.current = Date.now();
  };

  const handlePointerUp = (e) => {
    if(e.cancelable) e.preventDefault();
    if (state !== "holding") return;
    
    const timeTaken = Date.now() - startTime.current;
    setResultTime(timeTaken);
    setState("result");
    
    const diff = Math.abs(timeTaken - targetMs);
    const errorMargin = targetMs * 0.15; // 15% error margin is acceptable
    
    if (diff <= errorMargin) {
      setScore(prev => prev + 1);
    } else {
      setMistakes(prev => prev + 1);
    }
    
    reactionTimes.current.push(diff); // Here, "latency" will store their absolute error in ms
    
    setTimeout(() => {
      if (level < 5) {
        setLevel(prev => prev + 1);
        setState("ready");
      } else {
        endGame();
      }
    }, 2500);
  };

  const endGame = () => {
    const totalAttempts = score + mistakes;
    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
    
    // Avg absolute error in seconds
    const avgError = reactionTimes.current.length 
      ? ((reactionTimes.current.reduce((a,b)=>a+b, 0) / reactionTimes.current.length) / 1000).toFixed(2) 
      : 0;

    onComplete({
      score: score,
      attempts: 5,
      accuracy_percent: accuracy,
      avg_speed_seconds: avgError
    });
  };

  const getResultFeedback = () => {
    const diff = resultTime - targetMs;
    const absDiff = Math.abs(diff);
    
    if (absDiff <= 100) return <span style={{color: 'var(--color-emerald-base)'}}>PERFECT! 🎯</span>;
    if (absDiff <= targetMs * 0.15) return <span style={{color: 'var(--color-emerald-base)'}}>Good Timing! ✅</span>;
    if (diff < 0) return <span style={{color: 'var(--color-amber)'}}>Too Early... ⏳</span>;
    return <span style={{color: 'var(--color-error-coral)'}}>Too Late... 🐢</span>;
  };

  return (
    <div className="active-game-container">
      <div className="game-instructions text-highlight" style={{ textAlign: 'center', marginBottom: '20px' }}>
        Estimate exactly <strong>{(targetMs / 1000).toFixed(1)} Seconds</strong>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px' }}>
        
        {/* Giant Hold Button */}
        <button 
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={state === "holding" ? handlePointerUp : undefined}
          style={{
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: state === "holding" ? 'var(--color-accent-gold)' : 'var(--bg)',
            border: state === "holding" ? 'none' : '4px solid var(--border)',
            color: state === "holding" ? '#000' : 'var(--text-main)',
            fontSize: '2rem',
            fontWeight: 'bold',
            cursor: state === "ready" ? 'pointer' : 'default',
            transition: 'all 0.1s ease',
            boxShadow: state === "holding" ? '0 0 50px rgba(234, 179, 8, 0.4)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            touchAction: 'none' // Crucial for mobile pointer events
          }}
        >
          {state === "ready" && "HOLD"}
          {state === "holding" && "..."}
          {state === "result" && (resultTime / 1000).toFixed(2) + "s"}
        </button>

        <div style={{ height: '40px', marginTop: '32px', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {state === "result" && getResultFeedback()}
        </div>
      </div>

      <div className="action-buttons-group" style={{marginTop: '20px'}}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
