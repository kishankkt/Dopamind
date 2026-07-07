// [UGP-PATCHED] HUD removed — managed by UniversalGamePlayer
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound, playAscendingArpeggio } from '@/app/core/audio/SynthEngine';

const SHAPES = ["✦", "●", "▲", "■", "◆"];

export default function SpeedMatch({ 
  isActive,
  onGameComplete,
  onQuit,
  onHudUpdate,
}) {
  const gameStartTime = useRef(Date.now());
  const [isFirstCard, setIsFirstCard] = useState(true);
  const [currentShape, setCurrentShape] = useState("");
  const [previousShape, setPreviousShape] = useState("");
  const [gameScore, setGameScore] = useState(0);
  const [gameAttempts, setGameAttempts] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(45);
  const [currentSpeedLimit, setCurrentSpeedLimit] = useState(2.5); // seconds per card
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'

  const cardTimerRef = useRef(null);
  const roundTimerRef = useRef(null);
  const cardTimeRemainingRef = useRef(2.5);
  const latencyRecords = useRef([]);
  const cardStartTimestamp = useRef(0);

  // Initialize on mount or when activated
  useEffect(() => {
    if (isActive) {
      startSpeedMatch();
    } else {
      clearTimers();
    }
    return () => clearTimers();
  }, [isActive]);

  const clearTimers = () => {
    if (cardTimerRef.current) clearInterval(cardTimerRef.current);
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);
  };

  const startSpeedMatch = () => {
    setIsFirstCard(true);
    setGameScore(0);
    setGameAttempts(0);
    setGameTimeLeft(45);
    setCurrentSpeedLimit(2.5);
    setConsecutiveCorrect(0);
    setConsecutiveIncorrect(0);
    latencyRecords.current = [];
    gameStartTime.current = Date.now();

    const firstShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setCurrentShape(firstShape);
    setPreviousShape("");
  };

  const transitionFromFirstCard = () => {
    setIsFirstCard(false);
    setPreviousShape(currentShape);
    
    // Choose next shape (35% match chance)
    if (Math.random() < 0.35) {
      setCurrentShape(currentShape);
    } else {
      const nextShapes = SHAPES.filter(s => s !== currentShape);
      setCurrentShape(nextShapes[Math.floor(Math.random() * nextShapes.length)]);
    }

    cardTimeRemainingRef.current = 2.5;
    cardStartTimestamp.current = Date.now();

    roundTimerRef.current = setInterval(() => {
      setGameTimeLeft((prev) => {
        const next = prev - 1;
        if (onHudUpdate) onHudUpdate({ score: gameScore, timeLeft: next });
        if (next <= 1) {
          endGameRound();
          return 0;
        }
        return next;
      });
    }, 1000);

    resetCardTimer(2.5);
  };

  const resetCardTimer = (duration) => {
    if (cardTimerRef.current) clearInterval(cardTimerRef.current);
    cardTimeRemainingRef.current = duration;
    cardStartTimestamp.current = Date.now();

    cardTimerRef.current = setInterval(() => {
      cardTimeRemainingRef.current -= 0.1;
      if (cardTimeRemainingRef.current <= 0) {
        handleDecision(null);
      }
    }, 100);
  };

  const handleDecision = (userChoice) => {
    if (!isActive) return;

    const now = Date.now();
    const latency = now - cardStartTimestamp.current;
    latencyRecords.current.push(latency);

    const isMatch = currentShape === previousShape;
    const isCorrect = userChoice !== null && userChoice === isMatch;

    if (isCorrect) {
      setGameScore((prev) => {
        const next = prev + 1;
        if (onHudUpdate) onHudUpdate({ score: next });
        return next;
      });
      setFeedback("correct");

      const newConsecutiveCorrect = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutiveCorrect);
      setConsecutiveIncorrect(0);

      if (newConsecutiveCorrect > 0 && newConsecutiveCorrect % 10 === 0) {
        playAscendingArpeggio();
      } else {
        playChime(newConsecutiveCorrect - 1);
      }

      if (newConsecutiveCorrect > 0 && newConsecutiveCorrect % 3 === 0) {
        const nextSpeed = Math.max(0.8, Number((currentSpeedLimit - 0.2).toFixed(1)));
        setCurrentSpeedLimit(nextSpeed);
        resetCardTimer(nextSpeed);
      } else {
        resetCardTimer(currentSpeedLimit);
      }
    } else {
      setFeedback("incorrect");
      playErrorSound();

      setConsecutiveCorrect(0);
      const newConsecutiveIncorrect = consecutiveIncorrect + 1;
      setConsecutiveIncorrect(newConsecutiveIncorrect);

      if (newConsecutiveIncorrect >= 2) {
        setCurrentSpeedLimit(2.2);
        setConsecutiveIncorrect(0);
        resetCardTimer(2.2);
        setPreviousShape(currentShape);
        resetObviousMatchCard();
        return;
      } else {
        resetCardTimer(currentSpeedLimit);
      }
    }

    setGameAttempts((prev) => prev + 1);
    setTimeout(() => setFeedback(null), 250);

    setPreviousShape(currentShape);
    if (Math.random() < 0.35) {
      setCurrentShape(currentShape);
    } else {
      setCurrentShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    }
  };

  const resetObviousMatchCard = () => {
    setCurrentShape(currentShape);
    setTimeout(() => setFeedback(null), 250);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isActive) return;
      if (isFirstCard) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          transitionFromFirstCard();
        }
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleDecision(true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleDecision(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, currentShape, previousShape, consecutiveCorrect, consecutiveIncorrect, currentSpeedLimit, isFirstCard]);

  const endGameRound = () => {
    clearTimers();
    const avgSpeed = getAverageLatency();
    const accuracy = gameAttempts > 0 ? Math.round((gameScore / gameAttempts) * 100) : 0;
    const durationSeconds = Math.round((Date.now() - gameStartTime.current) / 1000);
    const stats = {
      score:             gameScore,
      attempts:          gameAttempts,
      accuracy_percent:  accuracy,
      avg_speed_seconds: avgSpeed,
      level_reached:     1,
      duration_seconds:  durationSeconds,
      streak_in_game:    consecutiveCorrect,
      perfect_rounds:    0,
      game_specific: { speed_limit_reached: currentSpeedLimit },
    };
    
    if (onGameComplete) {
      onGameComplete('speedmatch', stats);
    }
  };

  const getAverageLatency = () => {
    if (latencyRecords.current.length === 0) return 0;
    const sum = latencyRecords.current.reduce((a, b) => a + b, 0);
    return ((sum / latencyRecords.current.length) / 1000).toFixed(2);
  };

  if (!isActive) return null;

  return (
    <div className="active-game-container">
      <div className="game-stage">
        {isFirstCard ? (
          <div className="first-card-prompt">
            <div className={`card-shape ${feedback ? `feedback-${feedback}` : ''}`}>
              {currentShape}
            </div>
            <p className="instruction-text">This is the first shape.<br/>Remember it.</p>
            <button className="btn-primary start-round-btn" onClick={transitionFromFirstCard}>
              Start Match (Press Space)
            </button>
          </div>
        ) : (
          <div className="card-comparison-area">
            <div className="card-drop-zone">
              <div className={`card-shape ${feedback ? `feedback-${feedback}` : ''}`}>
                {currentShape}
              </div>
            </div>
            <p className="instruction-text">Does this match the PREVIOUS shape?</p>
            <div className="decision-buttons">
              <button className="btn-secondary" onClick={() => handleDecision(true)}>
                <kbd>←</kbd> YES
              </button>
              <button className="btn-secondary" onClick={() => handleDecision(false)}>
                NO <kbd>→</kbd>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="game-footer">
        <div className="difficulty-meter">
          Speed Limit: {currentSpeedLimit.toFixed(1)}s
        </div>
        {onQuit && (
          <button className="btn-secondary" onClick={onQuit} style={{ marginTop: '12px', fontSize: '0.8rem' }}>
            Quit to Gym
          </button>
        )}
      </div>
    </div>
  );
}
