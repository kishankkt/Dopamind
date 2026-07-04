import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// 🧮 Frequencies for the Ascending Pentatonic Scale
const PENTATONIC_SCALE = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00  // A5
];

const SHAPES = ["✦", "●", "▲", "■", "◆"];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [streak, setStreak] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);
  
  // 🕹️ SpeedMatch Active Game States
  const [gameState, setGameState] = useState("inactive"); // 'inactive' | 'playing' | 'summary'
  const [currentShape, setCurrentShape] = useState("");
  const [previousShape, setPreviousShape] = useState("");
  const [gameScore, setGameScore] = useState(0);
  const [gameAttempts, setGameAttempts] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(45);
  
  // 🧠 Adaptive Difficulty Engine Variables
  const [currentSpeedLimit, setCurrentSpeedLimit] = useState(2.5); // seconds per card
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'

  const audioCtxRef = useRef(null);
  const cardTimerRef = useRef(null);
  const roundTimerRef = useRef(null);
  const cardTimeRemainingRef = useRef(2.5);
  const latencyRecords = useRef([]);
  const cardStartTimestamp = useRef(0);

  // Initialize LocalStorage parameters
  useEffect(() => {
    const savedStreak = localStorage.getItem("dopamind_streak");
    const savedLastPlayed = localStorage.getItem("dopamind_last_played");
    
    if (savedStreak) setStreak(parseInt(savedStreak, 10));
    if (savedLastPlayed) setLastPlayed(savedLastPlayed);
  }, []);

  // Web Audio Synth Engine
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playChime = (index) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Triangle wave sounds soft, organic, and retro
      osc.type = "triangle";
      osc.frequency.setValueAtTime(PENTATONIC_SCALE[index % PENTATONIC_SCALE.length], ctx.currentTime);

      gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context failed to play chime:", e);
    }
  };

  const playErrorSound = () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      // Slide pitch down to sound like a bubble deflate
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio Context failed to play error sound:", e);
    }
  };

  const playAscendingArpeggio = () => {
    const notes = [0, 2, 4, 5, 7, 9]; // Ascending C-E-G-A-C-D
    notes.forEach((noteIdx, order) => {
      setTimeout(() => {
        playChime(noteIdx);
      }, order * 75);
    });
  };

  // Start SpeedMatch game round
  const startSpeedMatch = () => {
    setGameState("playing");
    setGameScore(0);
    setGameAttempts(0);
    setGameTimeLeft(45);
    setCurrentSpeedLimit(2.5);
    setConsecutiveCorrect(0);
    setConsecutiveIncorrect(0);
    latencyRecords.current = [];

    // Choose initial shapes
    const shape1 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    let shape2 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setPreviousShape(shape1);
    setCurrentShape(shape2);

    cardTimeRemainingRef.current = 2.5;
    cardStartTimestamp.current = Date.now();

    // Start 45-second round clock
    roundTimerRef.current = setInterval(() => {
      setGameTimeLeft((prev) => {
        if (prev <= 1) {
          endGameRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start active card interval
    resetCardTimer(2.5);
  };

  // Resets the timer ticker for matching current shape
  const resetCardTimer = (duration) => {
    if (cardTimerRef.current) clearInterval(cardTimerRef.current);
    cardTimeRemainingRef.current = duration;
    cardStartTimestamp.current = Date.now();

    cardTimerRef.current = setInterval(() => {
      cardTimeRemainingRef.current -= 0.1;
      if (cardTimeRemainingRef.current <= 0) {
        // Auto-skip card on timeout (counted as incorrect)
        handleDecision(null);
      }
    }, 100);
  };

  // Processes user decision
  const handleDecision = (userChoice) => {
    if (gameState !== "playing") return;

    // Save reaction speed latency
    const now = Date.now();
    const latency = now - cardStartTimestamp.current;
    latencyRecords.current.push(latency);

    // Evaluate response correctness
    const isMatch = currentShape === previousShape;
    const isCorrect = userChoice !== null && userChoice === isMatch;

    if (isCorrect) {
      setGameScore((prev) => prev + 1);
      setFeedback("correct");

      const newConsecutiveCorrect = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutiveCorrect);
      setConsecutiveIncorrect(0);

      // Play Pentatonic audio scale node
      if (newConsecutiveCorrect > 0 && newConsecutiveCorrect % 10 === 0) {
        playAscendingArpeggio();
      } else {
        playChime(newConsecutiveCorrect - 1);
      }

      // Adaptive difficulty scaling (acceleration)
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

      // Adaptive difficulty scaling (cortisol rescue slowdown)
      if (newConsecutiveIncorrect >= 2) {
        setCurrentSpeedLimit(2.2);
        setConsecutiveIncorrect(0);
        resetCardTimer(2.2);
        
        // Feed an obvious match next to rescue focus state
        setPreviousShape(currentShape);
        resetObviousMatchCard();
        return;
      } else {
        resetCardTimer(currentSpeedLimit);
      }
    }

    setGameAttempts((prev) => prev + 1);

    setTimeout(() => setFeedback(null), 250);

    // Roll next shapes
    setPreviousShape(currentShape);
    // 35% chance to force a match
    if (Math.random() < 0.35) {
      setCurrentShape(currentShape);
    } else {
      setCurrentShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    }
  };

  const resetObviousMatchCard = () => {
    // Pick the same shape to force an easy success match
    setCurrentShape(currentShape);
    setTimeout(() => setFeedback(null), 250);
  };

  // Keyboard Arrow Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== "playing") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleDecision(true); // Left Arrow = Match
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleDecision(false); // Right Arrow = No Match
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, currentShape, previousShape, consecutiveCorrect, consecutiveIncorrect, currentSpeedLimit]);

  // Clean end of 45-second round
  const endGameRound = () => {
    if (cardTimerRef.current) clearInterval(cardTimerRef.current);
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);

    setGameState("summary");
    
    // Streak calculations
    const today = new Date().toDateString();
    if (lastPlayed !== today) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLastPlayed(today);
      localStorage.setItem("dopamind_streak", newStreak);
      localStorage.setItem("dopamind_last_played", today);
      playAscendingArpeggio();
    }
  };

  // Helper stats calculation
  const getAverageLatency = () => {
    if (latencyRecords.current.length === 0) return 0;
    const sum = latencyRecords.current.reduce((a, b) => a + b, 0);
    return ((sum / latencyRecords.current.length) / 1000).toFixed(2);
  };

  // Render SVG / Emoji pixels reflecting Streak Plant state
  const getPlantGraphic = () => {
    if (streak === 0) return { emoji: "🪴", label: "Seed Pot Ready" };
    if (streak <= 2) return { emoji: "🌱", label: "Seedling Sprout" };
    if (streak <= 6) return { emoji: "🌿", label: "Thriving Herb" };
    if (streak <= 29) return { emoji: "🪴", label: "Sage Shrub" };
    return { emoji: "🌸", label: "Gold Flower Bloom!" };
  };

  // Hard Reset Streak Data
  const resetStreakData = () => {
    if (window.confirm("Are you sure you want to reset your daily streak plant and start over?")) {
      localStorage.removeItem("dopamind_streak");
      localStorage.removeItem("dopamind_last_played");
      setStreak(0);
      setLastPlayed(null);
    }
  };

  return (
    <div className="app-container">
      {/* 🧭 Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand-group">
          <div className="sidebar-logo">
            <svg className="logo-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" style={{ width: '36px', height: '36px' }}>
              <path d="M50 12 C20 18 15 62 50 88 C85 62 80 18 50 12 Z" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M50 88 V28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M50 78 C38 72 28 66 28 54 C28 42 38 42 50 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M50 62 C32 56 22 50 22 38 C22 26 32 26 50 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M50 40 C40 34 32 28 32 22 C32 16 40 16 50 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M50 78 C62 72 72 66 72 54 C72 42 62 42 50 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M50 62 C68 56 78 50 78 38 C78 26 68 26 50 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M50 40 C60 34 68 28 68 22 C68 16 60 16 50 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="12" r="3.5" fill="#EAB308" />
            </svg>
            <span className="logo-text">DopaMind</span>
          </div>
          <nav className="sidebar-menu">
            <button 
              className={`menu-item ${activeTab === "dashboard" || gameState === "playing" || gameState === "summary" ? "active" : ""}`}
              onClick={() => {
                if (gameState === "playing") {
                  if (confirm("Quit game in progress?")) {
                    clearInterval(cardTimerRef.current);
                    clearInterval(roundTimerRef.current);
                    setGameState("inactive");
                    setActiveTab("dashboard");
                  }
                } else {
                  setGameState("inactive");
                  setActiveTab("dashboard");
                }
              }}
            >
              <span>🪴</span> Dashboard
            </button>
            <button 
              className={`menu-item ${activeTab === "games" ? "active" : ""}`}
              onClick={() => {
                setGameState("inactive");
                setActiveTab("games");
              }}
            >
              <span>🕹️</span> Games Gym
            </button>
            <button 
              className={`menu-item ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => {
                setGameState("inactive");
                setActiveTab("analytics");
              }}
            >
              <span>📊</span> Analytics
            </button>
            <button 
              className={`menu-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => {
                setGameState("inactive");
                setActiveTab("settings");
              }}
            >
              <span>⚙️</span> Settings
            </button>
          </nav>
        </div>
        <div className="sidebar-footer">
          <p>DopaMind App v1.0.0</p>
        </div>
      </aside>

      {/* 💻 Main Content panel */}
      <main className="content-panel">
        
        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === "dashboard" && gameState === "inactive" && (
          <>
            <header className="tab-header">
              <h1>Welcome to the Gym</h1>
              <p>Rebuild your focus and attention span using short, mindful game loops.</p>
            </header>

            <div className="dashboard-grid">
              <div className="glass-panel streak-card">
                <h2>Daily Streak Progress</h2>
                <div className="streak-status-badge">
                  🔥 {streak} {streak === 1 ? "Day Streak" : "Days Streak"}
                </div>
                <p className="streak-details">
                  {streak > 0 
                    ? `Great job! Your plant is getting watered. Keep playing every day to make it bloom.`
                    : "No streak active. Play a round in the focus gym to plant your first seed."}
                </p>
                <button className="btn-primary" onClick={() => { setActiveTab("games"); }}>
                  Enter Gym
                </button>
              </div>

              <div className="glass-panel plant-card">
                <span className="plant-stage-label">{getPlantGraphic().label}</span>
                <div className="plant-box">
                  <div className="plant-graphic animate-bounce">
                    {getPlantGraphic().emoji}
                  </div>
                  <div className="pot-graphic">🏺</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== GAMES TAB ==================== */}
        {activeTab === "games" && gameState === "inactive" && (
          <>
            <header className="tab-header">
              <h1>Select Focus Exercise</h1>
              <p>Choose an exercise to stimulate your brain and maintain your daily streak.</p>
            </header>

            <div className="games-grid">
              <div className="game-card" onClick={startSpeedMatch}>
                <span className="game-card-icon">⚡</span>
                <h3>1. SpeedMatch</h3>
                <span className="game-focus">Focus & Processing Speed</span>
                <p>Compare symbols to the previous one as fast as you can. Accelerates on success; slows down on error.</p>
              </div>
              <div className="game-card locked">
                <span className="lock-badge">🔒 Locked</span>
                <span className="game-card-icon">⏹️</span>
                <h3>2. FocusGrid</h3>
                <span className="game-focus">Working Memory</span>
                <p>A spatial memory sequence game. Replicate sequences of tiles flashed on the board grid.</p>
              </div>
              <div className="game-card locked">
                <span className="lock-badge">🔒 Locked</span>
                <span className="game-card-icon">🧮</span>
                <h3>3. CountFlow</h3>
                <span className="game-focus">Mental Math Agility</span>
                <p>Solve falling math equations. Choose true/false before they hit the bottom floor.</p>
              </div>
            </div>
          </>
        )}

        {/* ==================== ACTIVE GAMEPLAY SCREEN ==================== */}
        {gameState === "playing" && (
          <div className="game-container glass-panel animate-pop">
            <div className="game-top-bar">
              <span>⚡ SpeedMatch Focus Round</span>
              <span>⏰ {gameTimeLeft}s</span>
            </div>

            <div className="time-bar-bg">
              <div 
                className="time-bar-fill"
                style={{ width: `${(gameTimeLeft / 45) * 100}%` }}
              ></div>
            </div>

            <div className="game-stats-row game-top-bar">
              <span>Score: {gameScore}</span>
              <span>Speed: {currentSpeedLimit}s</span>
            </div>

            <div 
              className={`shape-display-panel ${feedback === "correct" ? "scale-up" : ""} ${feedback === "incorrect" ? "shake-red" : ""}`}
            >
              {currentShape}
            </div>

            <div className="streak-meter-box">
              <span className="streak-meter-label">Consecutive Streak: {consecutiveCorrect}</span>
              <div className="chimes-dots">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`chime-dot ${consecutiveCorrect > idx ? (idx === 9 ? "highlight" : "active") : ""}`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="controls-row">
              <button className="btn-secondary" onClick={() => handleDecision(true)}>
                Match (←)
              </button>
              <button className="btn-secondary" onClick={() => handleDecision(false)}>
                No Match (→)
              </button>
            </div>
          </div>
        )}

        {/* ==================== GAME SUMMARY SCREEN ==================== */}
        {gameState === "summary" && (
          <div className="game-container glass-panel game-summary-box animate-pop">
            <h2>Round Complete! 🎉</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Accuracy</span>
                <span className="stat-val">{gameAttempts > 0 ? Math.round((gameScore / gameAttempts) * 100) : 0}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Speed</span>
                <span className="stat-val">{getAverageLatency()}s</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Score</span>
                <span className="stat-val">{gameScore}</span>
              </div>
            </div>

            <p className="summary-message">
              Great round! Your daily streak has been updated. You can check the dashboard to see your pixel plant's growth.
            </p>

            <div className="summary-actions">
              <button className="btn-primary" onClick={() => { setGameState("inactive"); setActiveTab("dashboard"); }}>
                View Dashboard
              </button>
              <button className="btn-secondary" onClick={startSpeedMatch}>
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* ==================== ANALYTICS TAB ==================== */}
        {activeTab === "analytics" && (
          <>
            <header className="tab-header">
              <h1>Focus Analytics</h1>
              <p>Review metrics of your spatial focus, latency, and consistency.</p>
            </header>

            <div className="glass-panel streak-card">
              <h2>Attention Dashboard</h2>
              <div style={{ padding: "40px 0", textAlign: "center", opacity: 0.6 }}>
                📊 Charting metrics will activate after more cognitive sessions. Keep up your daily streak!
              </div>
            </div>
          </>
        )}

        {/* ==================== SETTINGS TAB ==================== */}
        {activeTab === "settings" && (
          <>
            <header className="tab-header">
              <h1>Settings</h1>
              <p>Manage local data storage, audio, and platform preferences.</p>
            </header>

            <div className="settings-list">
              <div className="glass-panel settings-card">
                <div className="settings-card-label">
                  <h3>Reset Account Data</h3>
                  <p>Permanently deletes your local daily streak plant and starts over.</p>
                </div>
                <button className="btn-secondary" style={{ color: "var(--color-error-coral)" }} onClick={resetStreakData}>
                  Reset Data
                </button>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
