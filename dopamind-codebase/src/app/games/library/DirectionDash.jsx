import React, { useState, useEffect, useRef } from 'react';

const DIRECTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

export default function DirectionDash({ onComplete, onQuit }) {
  const [level, setLevel] = useState(1);
  const [currentArrow, setCurrentArrow] = useState(null); // { dir: 'UP', isReverse: false }
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  const startTime = useRef(0);
  const reactionTimes = useRef([]);

  useEffect(() => {
    generateArrow();
  }, [level]);

  const generateArrow = () => {
    const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    // Reverse probability increases with level (Level 1: 0%, Level 2: 25%, Level 3: 50%)
    const reverseProb = (level - 1) * 0.25;
    const isReverse = Math.random() < reverseProb;
    
    setCurrentArrow({ dir: randomDir, isReverse });
    startTime.current = Date.now();
  };

  const getOpposite = (dir) => {
    if (dir === 'UP') return 'DOWN';
    if (dir === 'DOWN') return 'UP';
    if (dir === 'LEFT') return 'RIGHT';
    if (dir === 'RIGHT') return 'LEFT';
  };

  const handleInput = (inputDir) => {
    if (!currentArrow) return;
    
    const expectedDir = currentArrow.isReverse ? getOpposite(currentArrow.dir) : currentArrow.dir;
    
    if (inputDir === expectedDir) {
      // Correct
      const timeTaken = Date.now() - startTime.current;
      reactionTimes.current.push(timeTaken);
      setScore(prev => prev + 1);
      
      if (score >= 4 && score < 9) setLevel(2);
      if (score >= 9 && score < 14) setLevel(3);
      if (score >= 14 && score < 19) setLevel(4);
      if (score >= 19) {
        endGame();
        return;
      }
      
      generateArrow();
    } else {
      // Mistake
      setMistakes(prev => prev + 1);
      
      // Flash red screen briefly
      const container = document.getElementById('dash-container');
      if (container) {
        container.style.backgroundColor = 'var(--color-error-coral)';
        setTimeout(() => {
          container.style.backgroundColor = 'transparent';
        }, 150);
      }
    }
  };

  const endGame = () => {
    const totalAttempts = score + mistakes;
    const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
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

  const getArrowSymbol = (dir) => {
    if (dir === 'UP') return '⬆️';
    if (dir === 'DOWN') return '⬇️';
    if (dir === 'LEFT') return '⬅️';
    if (dir === 'RIGHT') return '➡️';
  };

  return (
    <div className="game-workspace">
      <div className="game-hud">
        <div className="hud-metric">Level: <strong>{level} / 5</strong></div>
        <div className="hud-metric">Score: <strong>{score} / 20</strong></div>
      </div>
      
      <div className="game-instructions text-highlight" style={{ textAlign: 'center', marginBottom: '20px' }}>
        Tap matching direction. <strong style={{color: 'var(--color-error-coral)'}}>If RED, tap OPPOSITE!</strong>
      </div>

      <div id="dash-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', borderRadius: '24px', transition: 'background-color 0.1s ease' }}>
        
        {currentArrow && (
          <div style={{ 
            fontSize: '6rem', 
            marginBottom: '48px',
            color: currentArrow.isReverse ? 'var(--color-error-coral)' : 'var(--text-main)',
            filter: currentArrow.isReverse ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.4))' : 'none'
          }}>
            {getArrowSymbol(currentArrow.dir)}
          </div>
        )}

        {/* D-Pad Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxWidth: '250px' }}>
          <div></div>
          <button className="btn-action" onClick={() => handleInput('UP')} style={{ height: '70px', fontSize: '2rem', background: 'var(--bg)', border: '1px solid var(--border)' }}>⬆️</button>
          <div></div>
          
          <button className="btn-action" onClick={() => handleInput('LEFT')} style={{ height: '70px', fontSize: '2rem', background: 'var(--bg)', border: '1px solid var(--border)' }}>⬅️</button>
          <button className="btn-action" onClick={() => handleInput('DOWN')} style={{ height: '70px', fontSize: '2rem', background: 'var(--bg)', border: '1px solid var(--border)' }}>⬇️</button>
          <button className="btn-action" onClick={() => handleInput('RIGHT')} style={{ height: '70px', fontSize: '2rem', background: 'var(--bg)', border: '1px solid var(--border)' }}>➡️</button>
        </div>
      </div>

      <div className="action-buttons-group" style={{marginTop: '40px'}}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
