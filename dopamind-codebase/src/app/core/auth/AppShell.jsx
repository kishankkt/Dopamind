import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const gameToPlay = searchParams.get('play');

  useEffect(() => {
    if (gameToPlay) {
      setActiveTab("games");
    } else {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, gameToPlay]);
  const [session, setSession] = useState(null);
  
  // Game orchestration
  const [gameState, setGameState] = useState("inactive"); // 'inactive' | 'playing' | 'summary'
  const [activeGameId, setActiveGameId] = useState(null);
  const [lastGameStats, setLastGameStats] = useState(null);
  const [streak, setStreak] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [leafTrigger, setLeafTrigger] = useState(0);
  const [profileUsername, setProfileUsername] = useState(null);
  const [profileFullName, setProfileFullName] = useState(null);

  // Settings State
  const [aiWidgetSize, setAiWidgetSize] = useState('standard');
  const [autoGuide, setAutoGuide] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (gameToPlay) {
      setGameState("playing");
      setActiveGameId(gameToPlay);
    }
  }, [gameToPlay]);

  // Modals & UI
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [customConfirmOpen, setCustomConfirmOpen] = useState(false);
  const [customConfirmTitle, setCustomConfirmTitle] = useState("");
  const [customConfirmMessage, setCustomConfirmMessage] = useState("");
  const [customConfirmAction, setCustomConfirmAction] = useState(null);
  
  const [pendingRecovery, setPendingRecovery] = useState(null);

  const cardTimerRef = useRef(null);
  const roundTimerRef = useRef(null);

  // 2. Fetch Profile State
  const fetchUserProfile = async (user) => {
    try {
      console.log("Fetching profile for user:", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('streak_count, last_played_at, username, full_name, restored_at, deleted_at')
        .eq('id', user.id)
        .single();
      
      console.log("Profile Data:", data);
      console.log("Profile Error:", error);

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setStreak(data.streak_count || 0);
        setLastPlayed(data.last_played_at);
        setProfileUsername(data.username);
        setProfileFullName(data.full_name || "");
        
        if (data.deleted_at) {
          const searchParams = new URLSearchParams(window.location.search);
          if (searchParams.get('recover') === 'true') {
            await supabase.from('profiles').update({ deleted_at: null, restored_at: new Date().toISOString() }).eq('id', user.id);
            setPendingRecovery(null);
            showToast("Welcome back! Your account has been securely recovered.");
            navigate(`/${data.username}/${activeTab}`, { replace: true });
            return;
          }

          const deleteTime = new Date(data.deleted_at).getTime();
          const daysPassed = Math.floor((Date.now() - deleteTime) / (1000 * 60 * 60 * 24));
          const daysLeft = Math.max(0, 30 - daysPassed);
          console.log("Setting pending recovery with daysLeft:", daysLeft);
          setPendingRecovery({ daysLeft });
          return; // Stop further processing until recovered
        }
        
        if (data.restored_at) {
          const restoredTime = new Date(data.restored_at).getTime();
          const now = Date.now();
          if (now - restoredTime < 5 * 60 * 1000) { // 5 minutes
            showToast("Welcome back! Your account deletion has been cancelled.");
          }
        }
        
        if (data.username && username && data.username !== username && !fingerprint) {
          navigate(`/${data.username}/${activeTab}`, { replace: true });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch profile stats:", err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // 1. Authentication Listener
  useEffect(() => {
    if (fingerprint) {
      setSession({ user: { id: fingerprint, email: "Trial Guest", isTrial: true } });
      setIsProfileLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user);
      } else {
        setIsProfileLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setIsProfileLoading(true);
        fetchUserProfile(newSession.user);
      } else {
        setStreak(0);
        setLastPlayed(null);
        setIsProfileLoading(false);
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
        return <DashboardView streak={streak} onEnterGym={() => navigate(`${basePath}/braingym`)} session={session} profileUsername={profileUsername || username} />;
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
            profileUsername={profileUsername}
            setProfileUsername={setProfileUsername}
            profileFullName={profileFullName}
            setProfileFullName={setProfileFullName}
            showToast={setToastMessage}
            onUpdateUsername={(newUsername) => {
              setProfileUsername(newUsername);
              navigate(`/${newUsername}/settings`, { replace: true });
            }}
          />
        );
      default:
        return <DashboardView streak={streak} setActiveTab={setActiveTab} session={session} profileUsername={profileUsername || username} />;
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

  if (isProfileLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-emerald-light)', borderTopColor: 'var(--color-emerald-deep)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {!pendingRecovery && (
        <>
          <SidebarNavigation 
            session={session}
            profileUsername={profileUsername || username}
            activeTab={activeTab}
            basePath={basePath}
            gameState={gameState}
            activeGameId={activeGameId}
            setGameState={setGameState}
            setLeafTrigger={setLeafTrigger}
            triggerConfirm={triggerConfirm}
            cardTimerRef={cardTimerRef}
            roundTimerRef={roundTimerRef}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
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
        </>
      )}

      {/* Account Recovery Prompt */}
      {pendingRecovery && (
        <div className="custom-confirm-overlay" style={{ zIndex: 9999 }}>
          <div className="custom-confirm-modal glass-panel" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ color: 'var(--color-error-coral)', marginBottom: '16px' }}>Account Pending Deletion</h2>
            <p style={{ opacity: 0.8, marginBottom: '24px', lineHeight: '1.5' }}>
              Your account is currently scheduled for permanent deletion. You have <strong>{pendingRecovery.daysLeft} days</strong> out of 30 left to recover it.
            </p>
            <div className="confirm-btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={async () => {
                const { error } = await supabase.auth.signInWithOtp({
                  email: session.user.email,
                  options: {
                    shouldCreateUser: false,
                    emailRedirectTo: `${window.location.origin}/dashboard?recover=true`
                  }
                });
                if (error) {
                  showToast("Failed to send email: " + error.message);
                } else {
                  showToast("Recovery email sent to " + session.user.email + ". Please click the link to restore your account.");
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }
              }}>
                Send Recovery Email
              </button>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}>
                Sign Out (Keep Deleting)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
