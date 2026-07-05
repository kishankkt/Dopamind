import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import InteractiveGame from './InteractiveGame';
import FocusGrid from './games/FocusGrid';
import CountFlow from './games/CountFlow';
import WordWarp from './games/WordWarp';
import PatternPulse from './games/PatternPulse';
import ReactionTap from './games/ReactionTap';
import NumberCascade from './games/NumberCascade';
import SymbolMatch from './games/SymbolMatch';
import DirectionDash from './games/DirectionDash';
import TimeEstimator from './games/TimeEstimator';
import GravitySort from './games/GravitySort';
import EchoMap from './games/EchoMap';
import PhaseLock from './games/PhaseLock';
import ChromaShift from './games/ChromaShift';
import WeightGuess from './games/WeightGuess';
import { logGameSession } from './utils/gameEngine';
import { LayoutDashboard, Gamepad2, Settings, LogOut, Sun, Moon, Zap, Grid, Hash, Palette, Search, MousePointerClick, ListOrdered, Copy, Move, Clock, Flame, BrainCircuit, Leaf, ArrowDownUp, Undo2, Target, Pipette, Scale } from 'lucide-react';
import { SeedIcon, SproutIcon, HerbIcon, SageIcon, FlowerIcon } from './components/PlantIcons';
import PerformanceChart from './components/PerformanceChart';
import Leaderboard from './components/Leaderboard';
import InteractiveLeaf from './components/InteractiveLeaf';
import ScheduleBuilder from './components/ScheduleBuilder';
import DashboardView from './views/DashboardView';
import BrainGymView from './views/BrainGymView';
import SettingsView from './views/SettingsView';
import { BrandConfig } from './config/brand';

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

const isDesktop = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;

export default function App() {
  // Navigation & User Info
  const [activeFaq, setActiveFaq] = useState(null);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'games' | 'settings'
  const [streak, setStreak] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [leafTrigger, setLeafTrigger] = useState(null);
  const [aiWidgetSize, setAiWidgetSize] = useState(() => localStorage.getItem('dopamind_ai_widget_size') || 'standard');
  const [autoGuide, setAutoGuide] = useState(() => localStorage.getItem('dopamind_auto_guide') !== 'false');

  useEffect(() => {
    if (isDesktop) {
      import('@tauri-apps/plugin-deep-link').then(({ onOpenUrl }) => {
        onOpenUrl(async (urls) => {
          for (const url of urls) {
            if (url.includes('access_token') || url.includes('refresh_token')) {
              // Extract the hash part from the deep link
              const hashIndex = url.indexOf('#');
              if (hashIndex !== -1) {
                // Set the window hash so Supabase's built-in listener can pick it up
                window.location.hash = url.substring(hashIndex);
              }
            }
          }
        }).catch(console.error);
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dopamind_ai_widget_size', aiWidgetSize);
  }, [aiWidgetSize]);

  useEffect(() => {
    localStorage.setItem('dopamind_auto_guide', autoGuide.toString());
  }, [autoGuide]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Authentication State
  const [authOpen, setAuthOpen] = useState(isDesktop);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Custom Toast, Confirm & Legal Dialog States
  const [toastMessage, setToastMessage] = useState("");
  const [customConfirmOpen, setCustomConfirmOpen] = useState(false);
  const [customConfirmTitle, setCustomConfirmTitle] = useState("");
  const [customConfirmMessage, setCustomConfirmMessage] = useState("");
  const [customConfirmAction, setCustomConfirmAction] = useState(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState("privacy"); // 'privacy' | 'terms'
  const [authSuccessMessage, setAuthSuccessMessage] = useState("");
  const [isFirstCard, setIsFirstCard] = useState(true);

  // 🕹️ SpeedMatch Active Game States
  const [gameState, setGameState] = useState("inactive"); // 'inactive' | 'playing' | 'summary' | 'interstitial'
  const [activeGameId, setActiveGameId] = useState("speedmatch");
  
  // 🤖 Orchestration Engine State
  const [workoutQueue, setWorkoutQueue] = useState([]);
  const [workoutCurrentIndex, setWorkoutCurrentIndex] = useState(0);
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  const [summaryStats, setSummaryStats] = useState(null);
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

  // Toast message trigger helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Custom Confirm trigger helper
  const triggerConfirm = (title, message, action) => {
    setCustomConfirmTitle(title);
    setCustomConfirmMessage(message);
    setCustomConfirmAction(() => action);
    setCustomConfirmOpen(true);
  };

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
        showToast("Welcome back! Dashboard synchronized.");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              username: authEmail.split('@')[0]
            }
          }
        });
        if (error) throw error;
        
        if (data?.user && !data.session) {
          setAuthSuccessMessage("A verification link has been sent to " + authEmail + ". Please check your inbox and click the confirmation link to activate your account.");
        } else {
          showToast("Registration successful! You are now logged in.");
          setAuthOpen(false);
        }
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
      if (isDesktop) {
        const { open } = await import('@tauri-apps/plugin-shell');
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'dopamind://auth',
            skipBrowserRedirect: true
          }
        });
        if (error) throw error;
        if (data?.url) {
          await open(data.url);
        }
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err.message || "Failed to start Google sign-in.");
    }
  };

  const handleLogout = () => {
    triggerConfirm("Log Out?", "Are you sure you want to sign out of DopaMind?", async () => {
      await supabase.auth.signOut();
      setSession(null);
      setActiveTab("dashboard");
      setGameState("inactive");
      showToast("Signed out successfully.");
    });
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

  // Start game router
  const startGame = (gameId) => {
    setActiveGameId(gameId);
    setSummaryStats(null);
    setLeafTrigger(`User started playing ${gameId} at ${Date.now()}`);
    if (gameId === 'speedmatch') {
      startSpeedMatch();
    } else {
      setGameState("playing");
    }
  };

  const advanceOrchestration = () => {
    if (workoutCurrentIndex + 1 < workoutQueue.length) {
      const nextIndex = workoutCurrentIndex + 1;
      setWorkoutCurrentIndex(nextIndex);
      startGame(workoutQueue[nextIndex].game.toLowerCase());
    } else {
      setIsOrchestrating(false);
      showToast("AI Workout Complete! Neural pathways upgraded.");
      setGameState("inactive");
      setActiveTab("dashboard");
    }
  };

  const handleStartOrchestration = (queue) => {
    if (queue && queue.length > 0) {
      setWorkoutQueue(queue);
      setWorkoutCurrentIndex(0);
      setIsOrchestrating(true);
      setActiveTab("games");
      startGame(queue[0].game.toLowerCase());
    }
  };

  // Start SpeedMatch game round
  const startSpeedMatch = () => {
    setGameState("playing");
    setIsFirstCard(true);
    setGameScore(0);
    setGameAttempts(0);
    setGameTimeLeft(45);
    setCurrentSpeedLimit(2.5);
    setConsecutiveCorrect(0);
    setConsecutiveIncorrect(0);
    latencyRecords.current = [];

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
  }, [gameState, currentShape, previousShape, consecutiveCorrect, consecutiveIncorrect, currentSpeedLimit, isFirstCard]);

  // Generic Game Completion Handler
  const handleGameComplete = async (gameId, stats) => {
    setGameState("summary");
    setSummaryStats(stats);
    setLeafTrigger(`User completed ${gameId} with score ${stats.score}, accuracy ${stats.accuracy_percent}%, speed ${stats.avg_speed_seconds}s at ${Date.now()}`);
    await logGameSession(gameId, stats, session, streak, lastPlayed, (newStreak, today) => {
      setStreak(newStreak);
      setLastPlayed(today);
      playAscendingArpeggio();
      showToast("Focus Workout Logged! Streak plant watered.");
    });
  };

  const handleQuitGame = () => {
    setGameState("inactive");
    setActiveTab("games");
    setLeafTrigger(`User quit playing ${activeGameId} at ${Date.now()}`);
  };

  // Clean end of 45-second round for SpeedMatch
  const endGameRound = async () => {
    if (cardTimerRef.current) clearInterval(cardTimerRef.current);
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);

    const avgSpeed = getAverageLatency();
    const accuracy = gameAttempts > 0 ? Math.round((gameScore / gameAttempts) * 100) : 0;
    const stats = { score: gameScore, attempts: gameAttempts, accuracy_percent: accuracy, avg_speed_seconds: avgSpeed };
    
    await handleGameComplete('speedmatch', stats);
  };

  const getAverageLatency = () => {
    if (latencyRecords.current.length === 0) return 0;
    const sum = latencyRecords.current.reduce((a, b) => a + b, 0);
    return ((sum / latencyRecords.current.length) / 1000).toFixed(2);
  };

  const getPlantGraphic = () => {
    if (streak === 0) return { icon: <SeedIcon size={48} />, label: "Seed Pot Ready" };
    if (streak <= 2) return { icon: <SproutIcon size={48} />, label: "Seedling Sprout" };
    if (streak <= 6) return { icon: <HerbIcon size={48} />, label: "Thriving Herb" };
    if (streak <= 29) return { icon: <SageIcon size={48} />, label: "Sage Shrub" };
    return { icon: <FlowerIcon size={48} />, label: "Gold Flower Bloom!" };
  };

  const gamesList = [
    {
      id: 'speedmatch',
      name: '1. SpeedMatch',
      focus: 'Processing Speed & Focus',
      description: 'Compare current symbols with the previous ones under adaptive speed shifts. Trains fast decision loops and focus lock.',
      icon: <Zap size={28} />
    },
    {
      id: 'focusgrid',
      name: '2. FocusGrid',
      focus: 'Spatial Sequence Memory',
      description: 'Flashes patterns of tiles on a grid to replicate. Strengthens working memory and spatial tracking skills.',
      icon: <Grid size={28} />
    },
    {
      id: 'countflow',
      name: '3. CountFlow',
      focus: 'Mental Math & Agility',
      description: 'Solve falling arithmetic equations in a Tetris-like environment. Heightens numerical agility under cognitive stress.',
      icon: <Hash size={28} />
    },
    {
      id: 'wordwarp',
      name: '4. WordWarp',
      focus: 'Cognitive Flexibility',
      description: 'The Stroop test: identify mismatching word colors under timing pressure. Calibrates inhibitory control filters.',
      icon: <Palette size={28} />
    },
    {
      id: 'patternpulse',
      name: '5. PatternPulse',
      focus: 'Pattern Recognition',
      description: 'Locate subtle anomalies and differences in complex, changing designs. Sharpens visual search speed.',
      icon: <Search size={28} />
    },
    {
      id: 'reactiontap',
      name: '6. ReactionTap',
      focus: 'Reflex Latency',
      description: 'Pure visual-motor reflex test. Tap instantly when the screen flashes green.',
      icon: <MousePointerClick size={28} />
    },
    {
      id: 'numbercascade',
      name: '7. NumberCascade',
      focus: 'Working Memory',
      description: 'Memorize and reverse number sequences under time pressure.',
      icon: <ListOrdered size={28} />
    },
    {
      id: 'symbolmatch',
      name: '8. SymbolMatch',
      focus: 'Visual Processing',
      description: 'Find the single matching symbol between grids. Strengthens visual scanning.',
      icon: <Copy size={28} />
    },
    {
      id: 'directiondash',
      name: '9. DirectionDash',
      focus: 'Inhibitory Control',
      description: 'Match directions, but quickly reverse your input if the arrow turns red.',
      icon: <Move size={28} />
    },
    {
      id: 'timeestimator',
      name: '10. TimeEstimator',
      focus: 'Temporal Perception',
      description: 'Hold and release precisely on time. Calibrates your internal biological clock.',
      icon: <Clock size={28} />
    },
    {
      id: 'gravitysort',
      name: '11. GravitySort',
      focus: 'Executive Prioritization',
      description: 'Numbered orbs fall at different speeds. Tap them in ascending order before any hits the floor. Higher numbers fall faster.',
      icon: <ArrowDownUp size={28} />
    },
    {
      id: 'echomap',
      name: '12. EchoMap',
      focus: 'Reverse Working Memory',
      description: 'Memorize a chain of tile pulses, then replay them in REVERSE. Every 5 levels the grid rotates 90°.',
      icon: <Undo2 size={28} />
    },
    {
      id: 'phaselock',
      name: '13. PhaseLock',
      focus: 'Temporal Synchronization',
      description: 'Rotating rings with gates. Tap LOCK only when all gates align. A third ring appears at level 4.',
      icon: <Target size={28} />
    },
    {
      id: 'chromashift',
      name: '14. ChromaShift',
      focus: 'Visual Color Memory',
      description: 'A color flashes briefly. Reproduce it from memory using a slider. Gradients become more subtle each level.',
      icon: <Pipette size={28} />
    },
    {
      id: 'weightguess',
      name: '15. WeightGuess',
      focus: 'Cognitive Conflict Resolution',
      description: 'Shapes have hidden weights. Numbers inside are decoys. Pick the heavier side while ignoring misleading numbers.',
      icon: <Scale size={28} />
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
              <span className="logo-text" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <img src={BrandConfig.logoUrl} alt="Logo" width="24" height="24" />
                {BrandConfig.name}
              </span>
            </div>
            <nav className="sidebar-menu">
              <button 
                className={`menu-item ${activeTab === "dashboard" || gameState === "playing" || gameState === "summary" ? "active" : ""}`}
                onClick={() => {
                  if (gameState === "playing") {
                    triggerConfirm("Quit workout?", "Your active score and latency metrics for this round will be discarded.", () => {
                      clearInterval(cardTimerRef.current);
                      clearInterval(roundTimerRef.current);
                      setGameState("inactive");
                      setActiveTab("dashboard");
                      setLeafTrigger(`User quit playing ${activeGameId} and navigated to dashboard at ${Date.now()}`);
                    });
                  } else {
                    setGameState("inactive");
                    setActiveTab("dashboard");
                    setLeafTrigger(`User navigated to dashboard at ${Date.now()}`);
                  }
                }}
              >
                <span><LayoutDashboard size={20} /></span> Dashboard
              </button>
              <button 
                className={`menu-item ${activeTab === "games" ? "active" : ""}`}
                onClick={() => {
                  if (gameState === "playing") {
                    triggerConfirm("Quit workout?", "Your active score and latency metrics for this round will be discarded.", () => {
                      clearInterval(cardTimerRef.current);
                      clearInterval(roundTimerRef.current);
                      setGameState("inactive");
                      setActiveTab("games");
                      setLeafTrigger(`User quit playing ${activeGameId} and navigated to Brain Gym at ${Date.now()}`);
                    });
                  } else {
                    setGameState("inactive");
                    setActiveTab("games");
                    setLeafTrigger(`User navigated to Brain Gym at ${Date.now()}`);
                  }
                }}
              >
                <span><Gamepad2 size={20} /></span> Brain Gym
              </button>
              <button 
                className={`menu-item ${activeTab === "guidance" ? "active" : ""}`}
                onClick={() => {
                  if (gameState === "playing") {
                    setCustomConfirmOpen(true);
                  } else {
                    setActiveTab("guidance");
                    setLeafTrigger(`User navigated to AI Guidance at ${Date.now()}`);
                  }
                }}
              >
                <span><BrainCircuit size={20} /></span> AI Guidance
              </button>
              <button 
                className={`menu-item ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => {
                  if (gameState === "playing") {
                    triggerConfirm("Quit workout?", "Your active score and latency metrics for this round will be discarded.", () => {
                      clearInterval(cardTimerRef.current);
                      clearInterval(roundTimerRef.current);
                      setGameState("inactive");
                      setActiveTab("settings");
                      setLeafTrigger(`User quit playing ${activeGameId} and navigated to Settings at ${Date.now()}`);
                    });
                  } else {
                    setGameState("inactive");
                    setActiveTab("settings");
                    setLeafTrigger(`User navigated to Settings at ${Date.now()}`);
                  }
                }}
              >
                <span><Settings size={20} /></span> Settings
              </button>
            </nav>
          </div>
          <div className="sidebar-footer">
            <p>Logged in as: <br /><strong>{session.user.email}</strong></p>
            <button className="sidebar-logout-btn" style={{marginTop: '10px', background: 'transparent', color: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(255, 255, 255, 0.2)'}} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
            </button>
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </aside>

        {/* 💻 Main Content Panel */}
        <main className="content-panel">
          {activeTab === "dashboard" && gameState === "inactive" && (
            <DashboardView streak={streak} plant={plant} setActiveTab={setActiveTab} session={session} />
          )}

          {activeTab === "games" && gameState === "inactive" && (
            <BrainGymView gamesList={gamesList} startGame={startGame} />
          )}

          {/* ⚡ Game Playing Mode */}
          {gameState === "playing" && activeGameId === "speedmatch" && (
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

              {isFirstCard ? (
                <>
                  <div className="game-instructions text-highlight animate-pulse" style={{ color: 'var(--color-emerald-base)', fontWeight: '700' }}>
                    Memorize this first shape. The comparison starts on the next card!
                  </div>
                  <div className="action-buttons-group">
                    <button className="btn-primary start-comparison-btn" style={{ width: '100%', padding: '14px', borderRadius: '12px' }} onClick={transitionFromFirstCard}>
                      Start Comparison (Enter / Space)
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="game-instructions">
                    Is this shape the same as the one shown directly before?
                  </div>
                  <div className="action-buttons-group">
                    <button className="btn-action match-no" onClick={() => handleDecision(false)}>
                      No Match (Right Key)
                    </button>
                    <button className="btn-action match-yes" onClick={() => handleDecision(true)}>
                      Match (Left Key)
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {gameState === "playing" && activeGameId === "focusgrid" && <FocusGrid onComplete={(s) => handleGameComplete("focusgrid", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "countflow" && <CountFlow onComplete={(s) => handleGameComplete("countflow", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "wordwarp" && <WordWarp onComplete={(s) => handleGameComplete("wordwarp", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "patternpulse" && <PatternPulse onComplete={(s) => handleGameComplete("patternpulse", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "reactiontap" && <ReactionTap onComplete={(s) => handleGameComplete("reactiontap", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "numbercascade" && <NumberCascade onComplete={(s) => handleGameComplete("numbercascade", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "symbolmatch" && <SymbolMatch onComplete={(s) => handleGameComplete("symbolmatch", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "directiondash" && <DirectionDash onComplete={(s) => handleGameComplete("directiondash", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "timeestimator" && <TimeEstimator onComplete={(s) => handleGameComplete("timeestimator", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "gravitysort" && <GravitySort onComplete={(s) => handleGameComplete("gravitysort", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "echomap" && <EchoMap onComplete={(s) => handleGameComplete("echomap", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "phaselock" && <PhaseLock onComplete={(s) => handleGameComplete("phaselock", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "chromashift" && <ChromaShift onComplete={(s) => handleGameComplete("chromashift", s)} onQuit={handleQuitGame} />}
          {gameState === "playing" && activeGameId === "weightguess" && <WeightGuess onComplete={(s) => handleGameComplete("weightguess", s)} onQuit={handleQuitGame} />}

          {/* 📊 Game Summary Mode */}
          {gameState === "summary" && summaryStats && (
            <div className="summary-workspace glass-panel">
              <h2>workout complete!</h2>
              <p>Your attention and response latency calculations are compiled below.</p>
              <div className="metrics-summary-grid">
                <div className="summary-metric-item">
                  <strong>{summaryStats.score}</strong>
                  <span>{activeGameId === 'countflow' ? 'Equations Solved' : activeGameId === 'wordwarp' ? 'Words Matched' : 'Correct Matches'}</span>
                </div>
                <div className="summary-metric-item">
                  <strong>{summaryStats.accuracy_percent}%</strong>
                  <span>Total Accuracy</span>
                </div>
                <div className="summary-metric-item">
                  <strong>{summaryStats.avg_speed_seconds}s</strong>
                  <span>Avg Latency</span>
                </div>
              </div>
              <div className="summary-actions">
                {isOrchestrating ? (
                  <button className="btn-primary animate-pulse" onClick={advanceOrchestration}>
                    Next Workout in Sequence
                  </button>
                ) : (
                  <>
                    <button className="btn-primary" onClick={() => { setGameState("inactive"); setActiveTab("dashboard"); }}>
                      Return to Dashboard
                    </button>
                    <button className="btn-secondary" onClick={() => startGame(activeGameId)}>
                      Start Another Session
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && gameState === "inactive" && (
            <SettingsView 
              session={session} 
              showToast={showToast} 
              darkMode={darkMode} 
              setDarkMode={setDarkMode} 
              aiWidgetSize={aiWidgetSize}
              setAiWidgetSize={setAiWidgetSize}
              autoGuide={autoGuide}
              setAutoGuide={setAutoGuide}
            />
          )}
          {activeTab === "guidance" && (
            <ScheduleBuilder onStartGame={handleStartOrchestration} />
          )}

        </main>

        {/* 🍃 Magical Interactive Leaf Companion */}
        <InteractiveLeaf contextTrigger={leafTrigger} aiWidgetSize={aiWidgetSize} autoGuide={autoGuide} />

        {/* 🔔 Toast Notification Banner */}
        {toastMessage && (
          <div className="toast-notification-banner animate-pop" style={{display: 'flex', alignItems: 'center'}}>
            <SproutIcon size={20} style={{marginRight: '8px'}} /> {toastMessage}
          </div>
        )}

        {/* ⚠️ Custom Confirmation Modal Overlay */}
        {customConfirmOpen && (
          <div className="custom-confirm-overlay" onClick={() => setCustomConfirmOpen(false)}>
            <div className="custom-confirm-modal glass-panel" onClick={(e) => e.stopPropagation()}>
              <h3>{customConfirmTitle}</h3>
              <p>{customConfirmMessage}</p>
              <div className="confirm-btn-group">
                <button className="btn-secondary" onClick={() => setCustomConfirmOpen(false)}>Cancel</button>
                <button className="btn-danger" onClick={() => {
                  if (customConfirmAction) customConfirmAction();
                  setCustomConfirmOpen(false);
                }}>Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

}
