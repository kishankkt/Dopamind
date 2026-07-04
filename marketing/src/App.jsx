import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import InteractiveGame from './InteractiveGame';
import './App.css';

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
  // Navigation & User Info
  const [activeFaq, setActiveFaq] = useState(null);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'games' | 'settings'
  const [streak, setStreak] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);

  // Authentication State
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

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

  // Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setStreak(0);
        setLastPlayed(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profiles table data
  const fetchUserProfile = async (user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('streak_count, last_played_at')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setStreak(data.streak_count || 0);
        setLastPlayed(data.last_played_at ? new Date(data.last_played_at).toDateString() : null);
      }
    } catch (err) {
      console.warn("Failed to retrieve Supabase profile:", err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        setAuthOpen(false);
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              username: authEmail.split('@')[0]
            }
          }
        });
        if (error) throw error;
        alert("Registration successful! Check your email for confirmation (if required). You can now log in!");
        setAuthMode("login");
      }
    } catch (err) {
      setAuthError(err.message || "An authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message || "Failed to start Google sign-in.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setActiveTab("dashboard");
    setGameState("inactive");
  };

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
    const notes = [0, 2, 4, 5, 7, 9];
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

    const shape1 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    let shape2 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setPreviousShape(shape1);
    setCurrentShape(shape2);

    cardTimeRemainingRef.current = 2.5;
    cardStartTimestamp.current = Date.now();

    roundTimerRef.current = setInterval(() => {
      setGameTimeLeft((prev) => {
        if (prev <= 1) {
          endGameRound();
          return 0;
        }
        return prev - 1;
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
    if (gameState !== "playing") return;

    const now = Date.now();
    const latency = now - cardStartTimestamp.current;
    latencyRecords.current.push(latency);

    const isMatch = currentShape === previousShape;
    const isCorrect = userChoice !== null && userChoice === isMatch;

    if (isCorrect) {
      setGameScore((prev) => prev + 1);
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
      if (gameState !== "playing") return;
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
  }, [gameState, currentShape, previousShape, consecutiveCorrect, consecutiveIncorrect, currentSpeedLimit]);

  // Clean end of 45-second round
  const endGameRound = async () => {
    if (cardTimerRef.current) clearInterval(cardTimerRef.current);
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);

    setGameState("summary");
    
    const today = new Date().toDateString();
    const avgSpeed = getAverageLatency();
    const accuracy = gameAttempts > 0 ? Math.round((gameScore / gameAttempts) * 100) : 0;

    // 1. Sync game record in DB
    if (session?.user) {
      try {
        await supabase
          .from('speedmatch_history')
          .insert({
            user_id: session.user.id,
            score: gameScore,
            attempts: gameAttempts,
            accuracy_percent: accuracy,
            avg_speed_seconds: parseFloat(avgSpeed)
          });
      } catch (err) {
        console.warn("Failed to log game score to database:", err);
      }

      // 2. Water / Update Streak plant
      if (lastPlayed !== today) {
        try {
          const newStreak = streak + 1;
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              streak_count: newStreak,
              last_played_at: new Date().toISOString(),
              plant_stage: newStreak >= 30 ? 3 : newStreak >= 7 ? 2 : newStreak >= 3 ? 1 : 0
            });
          if (!error) {
            setStreak(newStreak);
            setLastPlayed(today);
            playAscendingArpeggio();
          }
        } catch (err) {
          console.warn("Failed to water plant:", err);
        }
      }
    } else {
      // Offline fallback
      if (lastPlayed !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setLastPlayed(today);
        playAscendingArpeggio();
      }
    }
  };

  const getAverageLatency = () => {
    if (latencyRecords.current.length === 0) return 0;
    const sum = latencyRecords.current.reduce((a, b) => a + b, 0);
    return ((sum / latencyRecords.current.length) / 1000).toFixed(2);
  };

  const getPlantGraphic = () => {
    if (streak === 0) return { emoji: "🪴", label: "Seed Pot Ready" };
    if (streak <= 2) return { emoji: "🌱", label: "Seedling Sprout" };
    if (streak <= 6) return { emoji: "🌿", label: "Thriving Herb" };
    if (streak <= 29) return { emoji: "🪴", label: "Sage Shrub" };
    return { emoji: "🌸", label: "Gold Flower Bloom!" };
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const gamesList = [
    {
      id: 'speedmatch',
      name: '1. SpeedMatch',
      focus: 'Processing Speed & Focus',
      description: 'Compare current symbols with the previous ones under adaptive speed shifts. Trains fast decision loops and focus lock.',
      icon: '⚡'
    },
    {
      id: 'focusgrid',
      name: '2. FocusGrid',
      focus: 'Spatial Sequence Memory',
      description: 'Flashes patterns of tiles on a grid to replicate. Strengthens working memory and spatial tracking skills.',
      icon: '⏹️'
    },
    {
      id: 'countflow',
      name: '3. CountFlow',
      focus: 'Mental Math & Agility',
      description: 'Solve falling arithmetic equations in a Tetris-like environment. Heightens numerical agility under cognitive stress.',
      icon: '🧮'
    },
    {
      id: 'wordwarp',
      name: '4. WordWarp',
      focus: 'Cognitive Flexibility',
      description: 'The Stroop test: identify mismatching word colors under timing pressure. Calibrates inhibitory control filters.',
      icon: '🎨'
    },
    {
      id: 'patternpulse',
      name: '5. PatternPulse',
      focus: 'Pattern Recognition',
      description: 'Locate subtle anomalies and differences in complex, changing designs. Sharpens visual search speed.',
      icon: '👁️'
    }
  ];

  const faqs = [
    {
      question: "How does the 'Cortisol Rescue' difficulty work?",
      answer: "Traditional games punish errors with harsh Game Over screens, leading to frustration and exit. DopaMind monitors your performance: if you hit 2 errors in a row, the difficulty temporarily drops back, serving simplified matches to reset your confidence, release relief hormones, and protect your focus loop from fatigue."
    },
    {
      question: "Can I use DopaMind entirely on the Web?",
      answer: "Yes! Since the Web site is now our main application shell, you can log in, play the full 45-second SpeedMatch game, and sync your daily streak statistics in the cloud without downloading anything."
    },
    {
      question: "How do I secure my daily streak in the cloud?",
      answer: "Create an account or click Google Login. Once logged in, completing focus sessions instantly updates your user profile in the database, securing your streak plant state."
    }
  ];

  // ==========================================
  // RENDER APP SHELL FOR LOGGED IN MEMBER
  // ==========================================
  if (session) {
    const plant = getPlantGraphic();
    return (
      <div className="app-container">
        {/* 🧭 Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-brand-group">
            <div className="sidebar-logo">
              <svg className="logo-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" style={{ width: '32px', height: '32px' }}>
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
            <p>Logged in as: <br /><strong>{session.user.email}</strong></p>
          </div>
        </aside>

        {/* 💻 Main Content Panel */}
        <main className="content-panel">
          {activeTab === "dashboard" && gameState === "inactive" && (
            <>
              <header className="tab-header">
                <h1>Welcome Back, Focus Gymnast</h1>
                <p>Build your cognitive attention span using zero-bloat game exercises.</p>
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

                <div className="glass-panel plant-visualizer-card">
                  <h2>Streak Plant Stage</h2>
                  <div className="plant-wrapper">
                    <div className="plant-icon-main animate-wiggle">
                      {plant.emoji}
                    </div>
                    <div className="plant-pot-base">🏺</div>
                  </div>
                  <p className="plant-label">Current: <strong>{plant.label}</strong></p>
                </div>
              </div>
            </>
          )}

          {activeTab === "games" && gameState === "inactive" && (
            <>
              <header className="tab-header">
                <h1>Focus Games Gym</h1>
                <p>Choose a game loop to begin. Playing waters your streak plant.</p>
              </header>
              <div className="games-inner-grid">
                <div className="glass-panel play-game-card">
                  <span className="game-icon">⚡</span>
                  <h2>SpeedMatch</h2>
                  <p>Determine if the shape matches the one shown before as speed adapts to your accuracy.</p>
                  <button className="btn-primary" onClick={startSpeedMatch}>
                    Start 45s Focus Workout
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ⚡ Game Playing Mode */}
          {gameState === "playing" && (
            <div className="game-workspace">
              <div className="game-hud">
                <div className="hud-metric">
                  Timer: <strong>{gameTimeLeft}s</strong>
                </div>
                <div className="hud-metric">
                  Score: <strong>{gameScore}</strong>
                </div>
                <div className="hud-metric">
                  Speed Limit: <strong>{currentSpeedLimit}s</strong>
                </div>
              </div>

              <div className="card-stage-container">
                <div className={`game-card-display ${feedback}`}>
                  <span className="card-symbol">{currentShape}</span>
                </div>
              </div>

              <div className="game-instructions">
                Is this shape the same as the one shown directly before?
              </div>

              <div className="action-buttons-group">
                <button className="btn-action match-no" onClick={() => handleDecision(false)}>
                  No Match (➡️ Key)
                </button>
                <button className="btn-action match-yes" onClick={() => handleDecision(true)}>
                  Match (⬅️ Key)
                </button>
              </div>
            </div>
          )}

          {/* 📊 Game Summary Mode */}
          {gameState === "summary" && (
            <div className="summary-workspace glass-panel">
              <h2>workout complete!</h2>
              <p>Your attention and response latency calculations are compiled below.</p>
              <div className="metrics-summary-grid">
                <div className="summary-metric-item">
                  <strong>{gameScore}</strong>
                  <span>Correct Matches</span>
                </div>
                <div className="summary-metric-item">
                  <strong>{gameAttempts > 0 ? Math.round((gameScore / gameAttempts) * 100) : 0}%</strong>
                  <span>Total Accuracy</span>
                </div>
                <div className="summary-metric-item">
                  <strong>{getAverageLatency()}s</strong>
                  <span>Avg Latency</span>
                </div>
              </div>
              <div className="summary-actions">
                <button className="btn-primary" onClick={() => setGameState("inactive")}>
                  Return to Dashboard
                </button>
                <button className="btn-secondary" onClick={startSpeedMatch}>
                  Start Another Session
                </button>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <>
              <header className="tab-header">
                <h1>Settings</h1>
                <p>Manage your account configurations and profile connections.</p>
              </header>
              <div className="glass-panel settings-card">
                <h2>User Profile</h2>
                <p>Account Email: <strong>{session.user.email}</strong></p>
                <button className="btn-danger" onClick={handleLogout}>
                  Log Out / Sign Out
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // ==========================================
  // RENDER VISITOR LANDING VIEW
  // ==========================================
  return (
    <div className="landing-container">
      {/* 🚀 Header */}
      <header className="site-header glass-panel">
        <div className="logo-area">
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
        <nav className="header-nav">
          <a href="#games">Games</a>
          <a href="#streak">Daily Streak</a>
          <a href="#faq">FAQ</a>
          <button className="btn-secondary nav-cta" onClick={() => setAuthOpen(true)}>Log In / Sign Up</button>
        </nav>
      </header>

      {/* ⚡ Hero Section */}
      <section className="hero-section">
        <div className="hero-info">
          <div className="tag-badge">🪴 Positive Dopamine Gym</div>
          <h1>Doomscrolling is shrinking your focus.</h1>
          <p className="hero-lead">
            Rebuild your attention span in 45 seconds a day. DopaMind uses short, gamified cognitive loops to train focus and spatial memory—free of social feed triggers.
          </p>
          <div className="hero-stats">
            <div className="hero-stat-item">
              <strong>100%</strong>
              <span>Web-Based / Instant</span>
            </div>
            <div className="hero-stat-item">
              <strong>100%</strong>
              <span>Privacy / Ad-Free</span>
            </div>
            <div className="hero-stat-item">
              <strong>0%</strong>
              <span>Chromium Bloat</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setAuthOpen(true)}>Access Gym Room</button>
            <a href="#games" className="btn-secondary">Explore 5 Game Modes</a>
          </div>
        </div>

        {/* Interactive Game Widget (15s trial) */}
        <div className="hero-widget">
          <InteractiveGame />
        </div>
      </section>

      {/* 🕹️ Games Roadmap Grid */}
      <section id="games" className="games-section">
        <h2 className="section-title">The Cognitive Training Toolkit</h2>
        <p className="section-subtitle">
          Five specialized mini-games designed to stimulate positive focus feedback loops and keep you in a Flow State.
        </p>

        <div className="games-grid">
          {gamesList.map((game) => (
            <div key={game.id} className="glass-card game-card">
              <span className="game-card-icon">{game.icon}</span>
              <h3>{game.name}</h3>
              <span className="game-card-badge">{game.focus}</span>
              <p>{game.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🪴 Streak Plant Section */}
      <section id="streak" className="streak-section glass-panel">
        <div className="streak-content">
          <h2>Grow Your Daily Streak Pixel Plant</h2>
          <p>
            Every day you complete a 45-second focus gym session, you water your digital pixel plant. Watch it grow from a single seed into a full-bloom flower. Protect your streak in the cloud using cloud backups to keep your streak alive.
          </p>
          <ul className="streak-bullets">
            <li>🌱 <strong>Day 1-2:</strong> Seed sprouts into a green leaf.</li>
            <li>🌿 <strong>Day 3-6:</strong> Leaves expand into a robust Sage branch.</li>
            <li>🌸 <strong>Day 30:</strong> Golden petals bloom, rewarding your attention consistency.</li>
          </ul>
        </div>
        <div className="streak-artwork">
          <div className="pixel-pot">
            <div className="pixel-plant-leaves animate-bounce">
              🌱
            </div>
            <div className="pixel-pot-base">🏺</div>
          </div>
        </div>
      </section>

      {/* ❓ FAQ Section */}
      <section id="faq" className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-accordion">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item glass-card ${activeFaq === index ? 'active' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question">
                <span>{faq.question}</span>
                <span className="faq-arrow">{activeFaq === index ? '▲' : '▼'}</span>
              </div>
              {activeFaq === index && (
                <div className="faq-answer animate-pop">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 📇 Footer */}
      <footer className="site-footer">
        <p>© 2026 DopaMind. Built for positive focus habits.</p>
      </footer>

      {/* 🔑 Authentication Modal Overlay */}
      {authOpen && (
        <div className="auth-modal-overlay" onClick={() => setAuthOpen(false)}>
          <div className="auth-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setAuthOpen(false)}>×</button>
            <h2>{authMode === "login" ? "Welcome to DopaMind" : "Create Account"}</h2>
            <p className="auth-sub">Keep your streak watered in the database</p>

            <form onSubmit={handleAuthSubmit} className="auth-form">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="your@email.com" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />

              <label>Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />

              {authError && <p className="auth-error-msg">⚠️ {authError}</p>}

              <button type="submit" className="btn-primary auth-submit-btn" disabled={authLoading}>
                {authLoading ? "Processing..." : authMode === "login" ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button className="google-auth-btn" onClick={handleGoogleLogin}>
              <svg viewBox="0 0 48 48" width="20px" height="20px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.422-5.189l-6.196-5.239C29.21,35.154,26.685,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.196,5.239C36.983,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="auth-toggle">
              {authMode === "login" ? "New to DopaMind?" : "Already have an account?"}
              <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                {authMode === "login" ? "Create Account" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
