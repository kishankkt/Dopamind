import React, { useState, useEffect, useRef } from 'react';

const SHAPE_PAIRS = [
  { normal: 'O', odd: '0' },
  { normal: 'l', odd: '1' },
  { normal: 'I', odd: 'l' },
  { normal: 'p', odd: 'q' },
  { normal: 'b', odd: 'd' },
  { normal: ':', odd: ';' },
  { normal: 'B', odd: '8' },
  { normal: 'Z', odd: '2' },
  { normal: 'S', odd: '5' }
];

export default function PatternPulse({ onComplete, onQuit }) {
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const [items, setItems] = useState([]);
  const [oddIndex, setOddIndex] = useState(-1);
  const [feedback, setFeedback] = useState(null);

  const timerRef = useRef(null);
  const reactionTimes = useRef([]);
  const lastClickTime = useRef(0);

  useEffect(() => {
    generateGrid();
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

  const generateGrid = () => {
    const pair = SHAPE_PAIRS[Math.floor(Math.random() * SHAPE_PAIRS.length)];
    const numItems = 9; // 3x3 grid
    const targetIdx = Math.floor(Math.random() * numItems);
    
    let newItems = Array(numItems).fill(pair.normal);
    newItems[targetIdx] = pair.odd;
    
    setItems(newItems);
    setOddIndex(targetIdx);
    lastClickTime.current = Date.now();
  };

  const handleSelection = (index) => {
    const now = Date.now();
    reactionTimes.current.push(now - lastClickTime.current);

    setAttempts(prev => prev + 1);
    
    if (index === oddIndex) {
      setScore(prev => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback(null);
      generateGrid();
    }, 250);
  };

  const endGame = () => {
    const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
    const avgLatency = reactionTimes.current.length 
      ? ((reactionTimes.current.reduce((a,b)=>a+b, 0) / reactionTimes.current.length) / 1000).toFixed(2) 
      : 0;

    onComplete({
      score: score,
      attempts: attempts, 
      accuracy_percent: accuracy,
      avg_speed_seconds: avgLatency
    });
  };

  return (
    <div className="game-workspace">
      <div className="game-hud">
        <div className="hud-metric">Timer: <strong>{timeLeft}s</strong></div>
        <div className="hud-metric">Score: <strong>{score}</strong></div>
      </div>
      
      <div className="game-instructions text-highlight" style={{ textAlign: 'center', marginTop: '10px' }}>
        Find the odd one out!
      </div>

      <div className={`pattern-grid ${feedback}`} style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', maxWidth: '300px', margin: '30px auto'
      }}>
        {items.map((char, i) => (
          <div 
            key={i} 
            onClick={() => handleSelection(i)}
            style={{ 
              padding: '20px', 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'background-color 0.2s'
            }}
          >
            {char}
          </div>
        ))}
      </div>

      <div className="action-buttons-group" style={{marginTop: '20px'}}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
