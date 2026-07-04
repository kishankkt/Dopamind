import React, { useState, useEffect, useRef } from 'react';

export default function CountFlow({ onComplete, onQuit }) {
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [equation, setEquation] = useState("");
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'

  const timerRef = useRef(null);
  const reactionTimes = useRef([]);
  const lastClickTime = useRef(0);

  useEffect(() => {
    generateEquation();
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

  const generateEquation = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, ans;
    if (op === '+') {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      ans = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * a);
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      ans = a * b;
    }

    setEquation(`${a} ${op} ${b}`);
    setCorrectAnswer(ans);

    const opts = [ans];
    while (opts.length < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const fake = ans + (offset === 0 ? 1 : offset);
      if (!opts.includes(fake) && fake >= 0) opts.push(fake);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
    lastClickTime.current = Date.now();
  };

  const handleSelection = (selectedOpt) => {
    const now = Date.now();
    reactionTimes.current.push(now - lastClickTime.current);

    setAttempts(prev => prev + 1);
    
    if (selectedOpt === correctAnswer) {
      setScore(prev => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback(null);
      generateEquation();
    }, 300);
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
      
      <div className={`card-stage-container ${feedback}`}>
        <div className="game-card-display" style={{ padding: '40px', fontSize: '3rem', fontWeight: 'bold' }}>
          {equation} = ?
        </div>
      </div>

      <div className="options-grid" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', maxWidth: '400px', margin: '30px auto'
      }}>
        {options.map((opt, i) => (
          <button 
            key={i} 
            className="btn-action" 
            onClick={() => handleSelection(opt)}
            style={{ padding: '20px', fontSize: '1.5rem', background: 'rgba(255,255,255,0.05)' }}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="action-buttons-group" style={{marginTop: '40px'}}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
