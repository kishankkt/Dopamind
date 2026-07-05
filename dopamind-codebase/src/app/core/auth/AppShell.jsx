import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { BrandConfig } from '@/config/brand';

import AuthModals from './AuthModals';
import SidebarNavigation from '../ui/SidebarNavigation';
import DashboardView from '@/app/features/performance/DashboardView';
import BrainGymView from '@/app/features/ai_spotting/BrainGymView';
import SettingsView from '@/app/core/user/SettingsView';
import ScheduleBuilder from '@/app/features/ai_scheduler/ScheduleBuilder';
import SpeedMatch from '@/app/games/library/SpeedMatch';

import './AppShell.css';

const isDesktop = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;

export default function AppShell() {
  const { username, fingerprint } = useParams();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [session, setSession] = useState(null);
  
  // Game orchestration
  const [gameState, setGameState] = useState("inactive"); // 'inactive' | 'playing' | 'summary'
  const [activeGameId, setActiveGameId] = useState(null);
  const [lastGameStats, setLastGameStats] = useState(null);
  const [streak, setStreak] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [leafTrigger, setLeafTrigger] = useState(0);

  // Modals & UI
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [customConfirmOpen, setCustomConfirmOpen] = useState(false);
  const [customConfirmTitle, setCustomConfirmTitle] = useState("");
  const [customConfirmMessage, setCustomConfirmMessage] = useState("");
  const [customConfirmAction, setCustomConfirmAction] = useState(null);

  const cardTimerRef = useRef(null);
  const roundTimerRef = useRef(null);

  // 1. Authentication Listener
  useEffect(() => {
    if (fingerprint) {
      setSession({ user: { id: fingerprint, email: "Trial Guest", isTrial: true } });
      return;
    }
    if (username) {
      setSession({ user: { id: username, email: `@${username}`, isPublic: true } });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchUserProfile(session.user);
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

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [fingerprint, username]);

  // 2. Fetch Profile State
  const fetchUserProfile = async (user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, last_played_at')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setStreak(data.current_streak || 0);
        setLastPlayed(data.last_played_at);
      }
    } catch (err) {
      console.warn("Failed to fetch profile stats:", err);
    }
  };

  // 3. Game Completion Handler
  const handleGameComplete = async (gameId, stats) => {
    setLastGameStats(stats);
    setGameState("summary");
    setLeafTrigger(`Game completed at ${Date.now()}`);

    if (session?.user && !session.user.isTrial && !session.user.isPublic) {
      try {
        await supabase.from('game_history').insert([{
          user_id: session.user.id,
          game_id: gameId,
          score: stats.score,
          accuracy_percent: stats.accuracy_percent,
          avg_speed_seconds: stats.avg_speed_seconds
        }]);

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
      if (activeGameId === "speedmatch") {
        return <SpeedMatch isActive={true} onGameComplete={(gameId, stats) => handleGameComplete(gameId, stats)} />;
      }
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
        return <DashboardView streak={streak} leafTrigger={leafTrigger} onPlayGame={startSpecificGame} />;
      case "games":
        return <BrainGymView onPlayGame={startSpecificGame} />;
      case "guidance":
        return <ScheduleBuilder />;
      case "settings":
        return <SettingsView session={session} isDesktop={isDesktop} onLoginClick={() => setAuthOpen(true)} />;
      default:
        return <DashboardView streak={streak} leafTrigger={leafTrigger} onPlayGame={startSpecificGame} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Component */}
      <SidebarNavigation 
        session={session}
        activeTab={activeTab}
        gameState={gameState}
        activeGameId={activeGameId}
        setActiveTab={setActiveTab}
        setGameState={setGameState}
        setLeafTrigger={setLeafTrigger}
        triggerConfirm={triggerConfirm}
        cardTimerRef={cardTimerRef}
        roundTimerRef={roundTimerRef}
      />

      {/* Main Viewport */}
      <main className="main-content">
        <header className="mobile-header">
          <div className="logo-area">
            <span className="logo-text" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <img src={BrandConfig.logoUrl} alt="Logo" width="24" height="24" />
              {BrandConfig.name}
            </span>
          </div>
        </header>

        <div className="scrollable-content">
          {renderContent()}
        </div>
      </main>

      {/* Extracted Auth Modals */}
      <AuthModals 
        authOpen={authOpen} 
        setAuthOpen={setAuthOpen} 
        showToast={showToast} 
        isDesktop={isDesktop} 
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
