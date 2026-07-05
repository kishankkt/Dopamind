import React, { useState, useEffect, useRef } from 'react';

export default function FocusGrid({ onComplete, onQuit }) {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [level, setLevel] = useState(1);
  const [isShowingSequence, setIsShowingSequence] = useState(true);
  const [activeTile, setActiveTile] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  const timerRef = useRef(null);
  const reactionTimes = useRef([]);
  const lastClickTime = useRef(0);

  useEffect(() => {
    generateSequence(1);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const generateSequence = (currentLevel) => {
    const newSeq = Array.from({ length: currentLevel + 2 }, () => Math.floor(Math.random() * 9));
    setSequence(newSeq);
    setUserSequence([]);
    setIsShowingSequence(true);
    playSequence(newSeq);
  };

  const playSequence = (seq) => {
    let step = 0;
    const interval = setInterval(() => {
      setActiveTile(seq[step]);
      setTimeout(() => setActiveTile(null), 300);
      step++;
      if (step >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsShowingSequence(false);
          lastClickTime.current = Date.now();
        }, 400);
      }
    }, 600);
  };

  const handleTileClick = (index) => {
    if (isShowingSequence) return;

    const now = Date.now();
    reactionTimes.current.push(now - lastClickTime.current);
    lastClickTime.current = now;

    const expectedIndex = sequence[userSequence.length];
    
    if (index === expectedIndex) {
      const newUserSeq = [...userSequence, index];
      setUserSequence(newUserSeq);
      setScore(prev => prev + 1);

      if (newUserSeq.length === sequence.length) {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setIsShowingSequence(true);
        setTimeout(() => generateSequence(nextLevel), 800);
      }
    } else {
      setMistakes(prev => prev + 1);
      setIsShowingSequence(true);
      setTimeout(() => playSequence(sequence), 800);
    }
  };

  const endGame = () => {
    const totalClicks = score + mistakes;
    const accuracy = totalClicks > 0 ? Math.round((score / totalClicks) * 100) : 0;
    const avgLatency = reactionTimes.current.length 
      ? ((reactionTimes.current.reduce((a,b)=>a+b, 0) / reactionTimes.current.length) / 1000).toFixed(2) 
      : 0;

    onComplete({
      score: score,
      attempts: level, 
      accuracy_percent: accuracy,
      avg_speed_seconds: avgLatency
    });
  };

  return (
    <div className="game-workspace">
      <div className="game-hud">
        <div className="hud-metric">Timer: <strong>{timeLeft}s</strong></div>
        <div className="hud-metric">Score: <strong>{score}</strong></div>
        <div className="hud-metric">Level: <strong>{level}</strong></div>
      </div>
      
      <div className="focusgrid-board" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '12px', margin: '40px auto', justifyContent: 'center'
      }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div 
            key={i}
            onClick={() => handleTileClick(i)}
            style={{
              width: '100px', height: '100px', 
              backgroundColor: activeTile === i ? 'var(--color-emerald-base)' : 'var(--bg)',
              border: '2px solid var(--border)',
              borderRadius: '16px', 
              cursor: isShowingSequence ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTile === i ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          />
        ))}
      </div>

      <div className="game-instructions text-highlight" style={{ textAlign: 'center', marginTop: '20px' }}>
        {isShowingSequence ? "Memorize the pattern..." : "Repeat the sequence!"}
      </div>

      <div className="action-buttons-group" style={{marginTop: '40px'}}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
