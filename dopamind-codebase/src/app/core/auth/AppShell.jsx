import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { BrandConfig } from '@/config/brand';
import LogoIcon from '@/shared/ui/LogoIcon';
import InteractiveLeaf from '@/app/games/library/InteractiveLeaf';

import AuthModals from './AuthModals';
import SidebarNavigation from '../ui/SidebarNavigation';
import DashboardView from '@/app/features/performance/DashboardView';
import BrainGymView from '@/app/features/ai_spotting/BrainGymView';
import SettingsView from '@/app/core/user/SettingsView';
import ScheduleBuilder from '@/app/features/ai_scheduler/ScheduleBuilder';
import SpeedMatch from '@/app/games/library/SpeedMatch';
import ChromaShift from '@/app/games/library/ChromaShift';
import CountFlow from '@/app/games/library/CountFlow';
import DirectionDash from '@/app/games/library/DirectionDash';
import EchoMap from '@/app/games/library/EchoMap';
import FocusGrid from '@/app/games/library/FocusGrid';
import GravitySort from '@/app/games/library/GravitySort';
import NumberCascade from '@/app/games/library/NumberCascade';
import PatternPulse from '@/app/games/library/PatternPulse';
import PhaseLock from '@/app/games/library/PhaseLock';
import ReactionTap from '@/app/games/library/ReactionTap';
import SymbolMatch from '@/app/games/library/SymbolMatch';
import TimeEstimator from '@/app/games/library/TimeEstimator';
import WeightGuess from '@/app/games/library/WeightGuess';
import WordWarp from '@/app/games/library/WordWarp';

import './AppShell.css';

const isDesktop = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;

export default function AppShell({ defaultTab = "dashboard" }) {
  const { username, fingerprint } = useParams();
  const navigate = useNavigate();
  const basePath = username ? `/${username}` : (fingerprint ? `/guest/${fingerprint}` : '');

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [session, setSession] = useState(null);
  
  // Game orchestration
  const [gameState, setGameState] = useState("inactive"); // 'inactive' | 'playing' | 'summary'
  const [activeGameId, setActiveGameId] = useState(null);
  const [lastGameStats, setLastGameStats] = useState(null);
  const [streak, setStreak] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [leafTrigger, setLeafTrigger] = useState(0);
  const [profileUsername, setProfileUsername] = useState(null);

  // Settings State
  const [aiWidgetSize, setAiWidgetSize] = useState('standard');
  const [autoGuide, setAutoGuide] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Modals & UI
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [customConfirmOpen, setCustomConfirmOpen] = useState(false);
  const [customConfirmTitle, setCustomConfirmTitle] = useState("");
  const [customConfirmMessage, setCustomConfirmMessage] = useState("");
  const [customConfirmAction, setCustomConfirmAction] = useState(null);

  const cardTimerRef = useRef(null);
  const roundTimerRef = useRef(null);

  // 2. Fetch Profile State
  const fetchUserProfile = async (user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, last_played_at, username')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setStreak(data.current_streak || 0);
        setLastPlayed(data.last_played_at);
        setProfileUsername(data.username);
      }
    } catch (err) {
      console.warn("Failed to fetch profile stats:", err);
    }
  };

  // 1. Authentication Listener
  useEffect(() => {
    if (fingerprint) {
      setSession({ user: { id: fingerprint, email: "Trial Guest", isTrial: true } });
      return;
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) fetchUserProfile(currentSession.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchUserProfile(newSession.user);
      } else {
        setStreak(0);
        setLastPlayed(null);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fingerprint, username]);

  // 3. Game Completion Handler
  const handleGameComplete = async (gameId, stats) => {
    setLastGameStats(stats);
    setGameState("summary");
    setLeafTrigger(`Game completed at ${Date.now()}`);

    if (session?.user && !session.user.isTrial && !session.user.isPublic) {
      try {
        // Log to game-specific table (e.g. speedmatch_history)
        const specificTable = `${gameId.toLowerCase()}_history`;
        await supabase.from(specificTable).insert([{
          user_id: session.user.id,
          score: stats.score,
          accuracy_percent: stats.accuracy_percent,
          avg_speed_seconds: stats.avg_speed_seconds
        }]);
      } catch (specificErr) {
        console.warn(`Failed to log to specific table for ${gameId}:`, specificErr);
      }

      try {
        // Log to global game_history table
        await supabase.from('game_history').insert([{
          user_id: session.user.id,
          game_id: gameId,
          score: stats.score,
          accuracy_percent: stats.accuracy_percent,
          avg_speed_seconds: stats.avg_speed_seconds
        }]);
      } catch (globalErr) {
        console.warn(`Failed to log to global game_history:`, globalErr);
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        let newStreak = streak;

        if (lastPlayed !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastPlayed === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          
          setStreak(newStreak);
          setLastPlayed(today);
          await supabase.from('profiles').upsert({
            id: session.user.id,
            current_streak: newStreak,
            last_played_at: today
          });
          showToast(`Streak protected! You are on a ${newStreak} day roll.`);
        }
      } catch (err) {
        console.error("Failed to sync game results:", err);
      }
    }
  };

  // 4. Global UI Helpers
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const triggerConfirm = (title, message, action) => {
    setCustomConfirmTitle(title);
    setCustomConfirmMessage(message);
    setCustomConfirmAction(() => action);
    setCustomConfirmOpen(true);
  };

  const startSpecificGame = (gameId) => {
    setActiveGameId(gameId);
    setGameState("playing");
    setActiveTab("games");
  };

  // 5. Main Render Router
  const renderContent = () => {
    if (gameState === "playing") {
      const gameProps = {
        onComplete: (stats) => handleGameComplete(activeGameId, stats),
        onQuit: () => setGameState("inactive")
      };

      switch (activeGameId) {
        case "speedmatch":
          return <SpeedMatch isActive={true} onGameComplete={(gameId, stats) => handleGameComplete(gameId, stats)} />;
        case "chromashift":
          return <ChromaShift {...gameProps} />;
        case "countflow":
          return <CountFlow {...gameProps} />;
        case "directiondash":
          return <DirectionDash {...gameProps} />;
        case "echomap":
          return <EchoMap {...gameProps} />;
        case "focusgrid":
          return <FocusGrid {...gameProps} />;
        case "gravitysort":
          return <GravitySort {...gameProps} />;
        case "numbercascade":
          return <NumberCascade {...gameProps} />;
        case "patternpulse":
          return <PatternPulse {...gameProps} />;
        case "phaselock":
          return <PhaseLock {...gameProps} />;
        case "reactiontap":
          return <ReactionTap {...gameProps} />;
        case "symbolmatch":
          return <SymbolMatch {...gameProps} />;
        case "timeestimator":
          return <TimeEstimator {...gameProps} />;
        case "weightguess":
          return <WeightGuess {...gameProps} />;
        case "wordwarp":
          return <WordWarp {...gameProps} />;
        default:
          return (
            <div className="active-game-container">
              <div className="game-stage">
                <h2 style={{color: 'var(--text-color)'}}>{activeGameId} Engine</h2>
                <p className="instruction-text">This game module is currently compiling.</p>
                <button className="btn-secondary" onClick={() => setGameState("inactive")} style={{marginTop: '20px'}}>Exit Module</button>
              </div>
            </div>
          );
      }
    }
    if (gameState === "summary") {
      return (
        <div className="summary-container glass-card animate-pop">
          <h2>Workout Complete 🌿</h2>
          <div className="summary-stats">
            <div className="stat-box"><span>Score</span><strong>{lastGameStats?.score}</strong></div>
            <div className="stat-box"><span>Accuracy</span><strong>{lastGameStats?.accuracy_percent}%</strong></div>
            <div className="stat-box"><span>Avg Latency</span><strong>{lastGameStats?.avg_speed_seconds}s</strong></div>
          </div>
          <p className="summary-feedback" style={{textAlign: 'center', marginTop: '16px', opacity: 0.8}}>
            {lastGameStats?.accuracy_percent > 85 ? "Excellent focus! You maintained a solid cognitive flow." : "Good effort. Try to reduce errors to improve neuroplasticity."}
          </p>
          <div className="summary-actions" style={{display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px'}}>
            <button className="btn-primary" onClick={() => setGameState("playing")}>Play Again</button>
            <button className="btn-secondary" onClick={() => setGameState("inactive")}>Back to Gym</button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardView streak={streak} onEnterGym={() => navigate(`${basePath}/braingym`)} session={session} profileUsername={profileUsername} />;
      case "games":
        return <BrainGymView onPlayGame={startSpecificGame} />;
      case "guidance":
        return <ScheduleBuilder />;
      case "settings":
        return (
          <SettingsView 
            session={session} 
            isDesktop={isDesktop} 
            onLoginClick={() => setAuthOpen(true)}
            aiWidgetSize={aiWidgetSize}
            setAiWidgetSize={setAiWidgetSize}
            autoGuide={autoGuide}
            setAutoGuide={setAutoGuide}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            showToast={setToastMessage}
          />
        );
      default:
        return <DashboardView streak={streak} setActiveTab={setActiveTab} session={session} profileUsername={profileUsername} />;
    }
  };

  // 4. Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="app-container">
      <SidebarNavigation 
        session={session}
        profileUsername={profileUsername}
        activeTab={activeTab}
        basePath={basePath}
        gameState={gameState}
        activeGameId={activeGameId}
        setGameState={setGameState}
        setLeafTrigger={setLeafTrigger}
        triggerConfirm={triggerConfirm}
        cardTimerRef={cardTimerRef}
        roundTimerRef={roundTimerRef}
      />

      {/* Main Viewport */}
      <main className="content-panel">
        {renderContent()}
      </main>

      {/* Extracted Auth Modals */}
      <AuthModals 
        authOpen={authOpen} 
        setAuthOpen={setAuthOpen} 
        showToast={showToast} 
        isDesktop={isDesktop} 
      />

      {/* Floating AI Guide */}
      <InteractiveLeaf 
        contextTrigger={leafTrigger} 
        aiWidgetSize={aiWidgetSize} 
        autoGuide={autoGuide} 
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification-banner animate-pop">
          🌿 {toastMessage}
        </div>
      )}

      {/* Custom Global Confirm */}
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
