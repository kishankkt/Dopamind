import React, { useState, useEffect, useRef } from 'react';

const SHAPES = ['✦', '●', '▲', '■', '◆'];
const COLORS = [
  '#284D36', // Deep Emerald
  '#C084FC', // Purple accent
  '#EAB308', // Gold accent
  '#3B82F6', // Blue accent
  '#F43F5E'  // Rose
];

export default function InteractiveGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentShape, setCurrentShape] = useState('');
  const [previousShape, setPreviousShape] = useState('');
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
  
  const reactionTimes = useRef([]);
  const lastInteractionTime = useRef(0);
  const timerRef = useRef(null);

  // Start the 15-second game preview
  const startGame = () => {
    setIsPlaying(true);
    setIsFinished(false);
    setScore(0);
    setAttempts(0);
    setTimeLeft(15);
    reactionTimes.current = [];
    
    // Choose initial shapes
    const shape1 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    let shape2 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    // Ensure first evaluation is a mix
    setPreviousShape(shape1);
    setCurrentShape(shape2);
    setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    
    lastInteractionTime.current = Date.now();
  };

  // Timer ticker
  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, timeLeft]);

  // Handle user's decision (Match or No Match)
  const handleDecision = (userSelectedMatch) => {
    if (!isPlaying || isFinished) return;

    // Track latency
    const now = Date.now();
    const latency = now - lastInteractionTime.current;
    reactionTimes.current.push(latency);
    lastInteractionTime.current = now;

    // Evaluate response
    const isActualMatch = (currentShape === previousShape);
    const isCorrect = (userSelectedMatch === isActualMatch);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
    setAttempts((prev) => prev + 1);

    // Reset feedback animation shortly after
    setTimeout(() => setFeedback(null), 250);

    // Roll new shapes
    setPreviousShape(currentShape);
    // 35% chance to force a match, otherwise random
    const forceMatch = Math.random() < 0.35;
    if (forceMatch) {
      setCurrentShape(currentShape);
    } else {
      let nextShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      setCurrentShape(nextShape);
    }
    setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  // Bind Keyboard arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || isFinished) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDecision(true); // Left Arrow = Match
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleDecision(false); // Right Arrow = No Match
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFinished, currentShape, previousShape]);

  // Calculate final statistics
  const getAverageLatency = () => {
    if (reactionTimes.current.length === 0) return 0;
    const sum = reactionTimes.current.reduce((a, b) => a + b, 0);
    return ((sum / reactionTimes.current.length) / 1000).toFixed(2);
  };

  return (
    <div className="glass-panel game-preview-box">
      {!isPlaying && !isFinished && (
        <div className="game-intro">
          <div className="brain-badge animate-bounce">🧠</div>
          <h3>Test Your Focus Speed</h3>
          <p>Compare the shape shown in the center with the one immediately before it.</p>
          <div className="game-legend">
            <span><strong>Left Arrow (←)</strong> = Match</span>
            <span><strong>Right Arrow (→)</strong> = No Match</span>
          </div>
          <button className="btn-primary" onClick={startGame}>
            Start 15s Trial
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="game-active">
          <div className="game-header">
            <span className="game-timer">⏰ {timeLeft}s</span>
            <span className="game-score">Score: {score}</span>
          </div>

          <div 
            className={`shape-display ${feedback === 'correct' ? 'scale-up' : ''} ${feedback === 'incorrect' ? 'shake-red' : ''}`}
            style={{ color: currentColor }}
          >
            {currentShape}
          </div>

          <div className="game-controls">
            <button className="btn-secondary" onClick={() => handleDecision(true)}>
              Match (←)
            </button>
            <button className="btn-secondary" onClick={() => handleDecision(false)}>
              No Match (→)
            </button>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="game-results animate-pop">
          <h3>Trial Complete! 🎉</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{attempts > 0 ? Math.round((score / attempts) * 100) : 0}%</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg Speed</span>
              <span className="stat-value">{getAverageLatency()}s</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Answers</span>
              <span className="stat-value">{attempts}</span>
            </div>
          </div>

          <p className="results-cta">
            {score >= 8 
              ? "Incredible focus speed! You have a flow index in the top 15%." 
              : "Not bad, but screen fatigue might be slowing your reaction speed."}
          </p>
          
          <div className="results-actions">
            <a href="#download" className="btn-primary">
              Download App to Start Streak
            </a>
            <button className="btn-secondary" onClick={startGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
