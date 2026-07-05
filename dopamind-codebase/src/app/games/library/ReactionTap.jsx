import React, { useState, useEffect, useRef } from 'react';

export default function ReactionTap({ onComplete, onQuit }) {
  const [level, setLevel] = useState(1);
  const [state, setState] = useState("waiting"); // waiting, ready, tapped, false_start
  const [reactionTime, setReactionTime] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  const timerRef = useRef(null);
  const startTime = useRef(0);
  const reactionTimes = useRef([]);

  useEffect(() => {
    startRound();
    return () => clearTimeout(timerRef.current);
  }, [level]);

  const startRound = () => {
    setState("waiting");
    setReactionTime(null);
    const delay = Math.floor(Math.random() * 3000) + 1500; // 1.5s to 4.5s
    
    timerRef.current = setTimeout(() => {
      setState("ready");
      startTime.current = Date.now();
    }, delay);
  };

  const handleTap = () => {
    if (state === "waiting") {
      // False start
      clearTimeout(timerRef.current);
      setState("false_start");
      setMistakes(prev => prev + 1);
      setTimeout(() => startRound(), 1500);
    } else if (state === "ready") {
      // Successful tap
      const endTime = Date.now();
      const timeTaken = endTime - startTime.current;
      setReactionTime(timeTaken);
      reactionTimes.current.push(timeTaken);
      setState("tapped");
      setScore(prev => prev + 1);

      if (level < 5) {
        setTimeout(() => {
          setLevel(prev => prev + 1);
        }, 1500);
      } else {
        setTimeout(() => endGame(), 1500);
      }
    }
  };

  const endGame = () => {
    const totalClicks = score + mistakes;
    const accuracy = totalClicks > 0 ? Math.round((score / totalClicks) * 100) : 0;
    const avgLatency = reactionTimes.current.length 
      ? ((reactionTimes.current.reduce((a,b)=>a+b, 0) / reactionTimes.current.length) / 1000).toFixed(3) 
      : 0;

    onComplete({
      score: score,
      attempts: 5,
      accuracy_percent: accuracy,
      avg_speed_seconds: avgLatency
    });
  };

  return (
    <div className="game-workspace">
      <div className="game-hud">
        <div className="hud-metric">Level: <strong>{level} / 5</strong></div>
        <div className="hud-metric">Score: <strong>{score}</strong></div>
      </div>
      
      <div className="card-stage-container" style={{ height: '350px' }}>
        <div 
          onClick={handleTap}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.1s ease',
            backgroundColor: 
              state === "waiting" ? 'var(--color-error-coral)' : 
              state === "ready" ? 'var(--color-emerald-base)' : 
              state === "false_start" ? 'var(--color-amber)' : 'var(--bg)',
            border: state === "tapped" ? '2px solid var(--border)' : 'none',
            color: state === "tapped" ? 'var(--text-main)' : 'var(--color-white)',
            boxShadow: state === "ready" ? '0 0 40px rgba(16, 185, 129, 0.4)' : 'none'
          }}
        >
          <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '800' }}>
            {state === "waiting" && "Wait for Green..."}
            {state === "ready" && "TAP NOW!"}
            {state === "false_start" && "Too Early!"}
            {state === "tapped" && `${reactionTime} ms`}
          </h2>
          {state === "tapped" && <p style={{ opacity: 0.7, marginTop: '8px' }}>Great reflex!</p>}
        </div>
      </div>

      <div className="action-buttons-group" style={{marginTop: '40px'}}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
