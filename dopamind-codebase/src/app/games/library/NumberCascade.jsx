// [UGP-PATCHED] HUD removed — managed by UniversalGamePlayer
import React, { useState, useEffect, useRef } from 'react';

export default function NumberCascade({ onComplete, onQuit, onHudUpdate }) {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [state, setState] = useState("memorize"); // memorize, input, success, fail
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  const startTime = useRef(0);
  const reactionTimes = useRef([]);

  useEffect(() => {
    generateSequence(level);
  }, [level]);

  const generateSequence = (currentLevel) => {
    const length = currentLevel + 2;
    let newSeq = "";
    for (let i = 0; i < length; i++) {
      newSeq += Math.floor(Math.random() * 10).toString();
    }
    setSequence(newSeq);
    setUserInput("");
    setState("memorize");

    // Show for (length * 1000) ms
    setTimeout(() => {
      setState("input");
      startTime.current = Date.now();
    }, length * 800);
  };

  const handleInput = (num) => {
    if (state !== "input") return;
    
    const nextInput = userInput + num;
    setUserInput(nextInput);

    // Check if the current input prefix matches the reversed sequence
    const reversedSequence = sequence.split('').reverse().join('');
    
    if (reversedSequence.startsWith(nextInput)) {
      if (nextInput === reversedSequence) {
        // Full match
        const timeTaken = Date.now() - startTime.current;
        reactionTimes.current.push(timeTaken);
        setState("success");
        setScore(prev => prev + 1);

        if (level < 5) {
          setTimeout(() => setLevel(prev => prev + 1), 1000);
        } else {
          setTimeout(() => endGame(), 1000);
        }
      }
    } else {
      // Mistake
      setState("fail");
      setMistakes(prev => prev + 1);
      setTimeout(() => generateSequence(level), 1500);
    }
  };

  const handleDelete = () => {
    if (state !== "input" || userInput.length === 0) return;
    setUserInput(prev => prev.slice(0, -1));
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
    <div className="active-game-container">
      <div className="card-stage-container" style={{ height: '200px', flexDirection: 'column' }}>
        {state === "memorize" && (
          <>
            <h2 style={{ fontSize: '3rem', letterSpacing: '8px', margin: '0' }}>{sequence}</h2>
            <p style={{ opacity: 0.6, marginTop: '16px' }}>Memorize the sequence...</p>
          </>
        )}

        {state === "input" && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {sequence.split('').map((_, idx) => (
                <div 
                  key={idx} 
                  style={{
                    width: '40px', height: '50px',
                    borderBottom: '3px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', fontWeight: 'bold'
                  }}
                >
                  {userInput[idx] || ""}
                </div>
              ))}
            </div>
            <p style={{ opacity: 0.6, margin: '0', color: 'var(--color-emerald-base)', fontWeight: 'bold' }}>Type it in REVERSE order!</p>
          </>
        )}

        {state === "success" && <h2 style={{ color: 'var(--color-emerald-base)' }}>Correct!</h2>}
        {state === "fail" && <h2 style={{ color: 'var(--color-error-coral)' }}>Incorrect... Retrying</h2>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '300px', margin: '24px auto' }}>
        {[1,2,3,4,5,6,7,8,9].map(num => (
          <button 
            key={num} 
            className="btn-action" 
            onClick={() => handleInput(num.toString())}
            style={{ padding: '16px', fontSize: '1.2rem', background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            {num}
          </button>
        ))}
        <button className="btn-action" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}></button>
        <button 
          className="btn-action" 
          onClick={() => handleInput("0")}
          style={{ padding: '16px', fontSize: '1.2rem', background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          0
        </button>
        <button 
          className="btn-action" 
          onClick={handleDelete}
          style={{ padding: '16px', fontSize: '1.2rem', background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          ⌫
        </button>
      </div>

      <div className="action-buttons-group" style={{marginTop: '20px'}}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
