import React, { useState, useEffect, useRef } from 'react';

const SYMBOLS = ['▲', '▼', '◆', '●', '■', '★', '✚', '✖', '✱', '♥', '♦', '♣', '♠', '✿', '❀', '❃', '❂', '✺', '✵', '✷'];

export default function SymbolMatch({ onComplete, onQuit }) {
  const [level, setLevel] = useState(1);
  const [gridA, setGridA] = useState([]);
  const [gridB, setGridB] = useState([]);
  const [targetSymbol, setTargetSymbol] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  const startTime = useRef(0);
  const reactionTimes = useRef([]);

  useEffect(() => {
    generateRound();
  }, [level]);

  const generateRound = () => {
    // Generate two random subsets of symbols
    const numSymbols = Math.min(6 + level * 2, 16); // Level 1 = 8 symbols per grid
    
    // Shuffle all symbols
    const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
    
    // Pick the match
    const match = shuffled[0];
    setTargetSymbol(match);
    
    // Pick other unique symbols for A and B
    const othersA = shuffled.slice(1, numSymbols);
    const othersB = shuffled.slice(numSymbols, numSymbols * 2 - 1);
    
    // Construct grids and shuffle positions
    const newGridA = [...othersA, match].sort(() => Math.random() - 0.5);
    const newGridB = [...othersB, match].sort(() => Math.random() - 0.5);
    
    setGridA(newGridA);
    setGridB(newGridB);
    startTime.current = Date.now();
  };

  const handleSelection = (symbol) => {
    if (symbol === targetSymbol) {
      // Correct
      const timeTaken = Date.now() - startTime.current;
      reactionTimes.current.push(timeTaken);
      setScore(prev => prev + 1);
      
      if (level < 5) {
        setLevel(prev => prev + 1);
      } else {
        endGame();
      }
    } else {
      // Mistake
      setMistakes(prev => prev + 1);
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
      
      <div className="game-instructions text-highlight" style={{ textAlign: 'center', marginBottom: '20px' }}>
        Find the ONE symbol that exists in BOTH grids!
      </div>

      <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', alignItems: 'center' }}>
        {/* Grid A */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(gridA.length))}, 1fr)`, 
          gap: '8px',
          background: 'var(--bg)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          {gridA.map((sym, idx) => (
            <button 
              key={`a-${idx}`} 
              onClick={() => handleSelection(sym)}
              style={{ width: '45px', height: '45px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              {sym}
            </button>
          ))}
        </div>

        <h3 style={{ opacity: 0.5 }}>VS</h3>

        {/* Grid B */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(gridB.length))}, 1fr)`, 
          gap: '8px',
          background: 'var(--bg)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          {gridB.map((sym, idx) => (
            <button 
              key={`b-${idx}`} 
              onClick={() => handleSelection(sym)}
              style={{ width: '45px', height: '45px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      <div className="action-buttons-group" style={{marginTop: '40px'}}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
