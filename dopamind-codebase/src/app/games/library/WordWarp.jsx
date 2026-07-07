// [UGP-PATCHED] HUD removed — managed by UniversalGamePlayer
import React, { useState, useEffect, useRef } from 'react';

const COLORS = [
  { name: 'RED', hex: '#F43F5E' },
  { name: 'BLUE', hex: '#3B82F6' },
  { name: 'GREEN', hex: '#10B981' },
  { name: 'YELLOW', hex: '#EAB308' },
  { name: 'PURPLE', hex: '#C084FC' }
];

export default function WordWarp({ onComplete, onQuit, onHudUpdate }) {
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const [wordText, setWordText] = useState("");
  const [wordColorHex, setWordColorHex] = useState("");
  const [correctAnswerName, setCorrectAnswerName] = useState("");
  const [options, setOptions] = useState([]);
  
  const [feedback, setFeedback] = useState(null);

  const timerRef = useRef(null);
  const reactionTimes = useRef([]);
  const lastClickTime = useRef(0);

  useEffect(() => {
    generateStroop();
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

  const generateStroop = () => {
    // Pick a random word text
    const textObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Pick a random color (often different from the text to force Stroop effect)
    let colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    if (Math.random() < 0.7) { 
      // 70% chance to force a mismatch
      let availableColors = COLORS.filter(c => c.name !== textObj.name);
      colorObj = availableColors[Math.floor(Math.random() * availableColors.length)];
    }

    setWordText(textObj.name);
    setWordColorHex(colorObj.hex);
    setCorrectAnswerName(colorObj.name); // The correct answer is the INK color

    // Generate 4 options (must include the correct answer and the trick answer)
    let opts = [colorObj.name];
    if (textObj.name !== colorObj.name) opts.push(textObj.name);
    
    while (opts.length < 4) {
      const rand = COLORS[Math.floor(Math.random() * COLORS.length)].name;
      if (!opts.includes(rand)) opts.push(rand);
    }
    
    setOptions(opts.sort(() => Math.random() - 0.5));
    lastClickTime.current = Date.now();
  };

  const handleSelection = (selectedName) => {
    const now = Date.now();
    reactionTimes.current.push(now - lastClickTime.current);

    setAttempts(prev => prev + 1);
    
    if (selectedName === correctAnswerName) {
      setScore(prev => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }

    setTimeout(() => {
      setFeedback(null);
      generateStroop();
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
    <div className="active-game-container">
      <div className="game-instructions text-highlight" style={{ textAlign: 'center', marginTop: '10px' }}>
        Select the <strong>INK COLOR</strong>, not the word!
      </div>

      <div className={`card-stage-container ${feedback}`}>
        <div className="game-card-display" style={{ padding: '40px', fontSize: '3.5rem', fontWeight: '900', color: wordColorHex, textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
          {wordText}
        </div>
      </div>

      <div className="options-grid" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', maxWidth: '400px', margin: '30px auto'
      }}>
        {options.map((optName, i) => (
          <button 
            key={i} 
            className="btn-action" 
            onClick={() => handleSelection(optName)}
            style={{ padding: '20px', fontSize: '1.2rem', fontWeight: 'bold', background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            {optName}
          </button>
        ))}
      </div>

      <div className="action-buttons-group" style={{marginTop: '20px'}}>
        <button className="btn-secondary" onClick={onQuit}>Quit to Gym</button>
      </div>
    </div>
  );
}
