import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { BrandConfig } from '@/config/brand';
import LogoIcon from '@/shared/ui/LogoIcon';
// InteractiveLeaf is now globally managed

import AuthModals from './AuthModals';
import SidebarNavigation from '../ui/SidebarNavigation';
import AutoUpdater from '../ui/AutoUpdater';
import DashboardView from '@/app/features/performance/DashboardView';
import BrainGymView from '@/app/features/ai_spotting/BrainGymView';
import SettingsView from '@/app/core/user/SettingsView';
import CoachesPage from '@/app/features/ai_scheduler/CoachesPage';
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

// New engines
import { logGameSession } from '@/app/games/core_engine/gameEngine';
import SessionTracker from '@/app/core/engagement/SessionTracker';
import NotificationEngine from '@/app/core/engagement/NotificationEngine';
import WorkoutSessionsView from '@/app/features/sessions/WorkoutSessionsView';
import UniversalGamePlayer from '@/app/games/core_engine/UniversalGamePlayer';
import { getGame, GAME_REGISTRY } from '@/app/games/core_engine/gameRegistry';
import { getDifficultyValue } from '@/app/core/engagement/AdaptiveEngine';

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
  const [gameState,       setGameState]       = useState('inactive');
  const [activeGameId,    setActiveGameId]     = useState(null);
  const [lastGameStats,   setLastGameStats]    = useState(null);
  const [engagementResult,setEngagementResult] = useState(null);
  const [isProcessing,    setIsProcessing]     = useState(false);
  const [streak,          setStreak]           = useState(0);
  const [lastPlayed,      setLastPlayed]       = useState(null);
  const [leafTrigger,     setLeafTrigger]      = useState(0);
  const [profileUsername, setProfileUsername]  = useState(null);
  const [profileFullName, setProfileFullName]  = useState(null);
  const [profileData,     setProfileData]      = useState({});
  const [currentLevel,    setCurrentLevel]     = useState(1);    // adaptive level for active game
  const [allGameLevels,   setAllGameLevels]    = useState({});   // { gameId: level } loaded once

  // Settings State
  const [aiWidgetSize, setAiWidgetSize] = useState('standard');
  const [autoGuide, setAutoGuide] = useState(false);
  // darkMode is now globally managed by InteractiveLeaf
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (gameToPlay) {
      setGameState("playing");
      setActiveGameId(gameToPlay);
    }
  }, [gameToPlay]);

  // Modals & UI
  const [authOpen, setAuthOpen] = useState(searchParams.get('auth') === 'true');
  const [toastMessage, setToastMessage] = useState("");
  const [customConfirmOpen, setCustomConfirmOpen] = useState(false);
  const [customConfirmTitle, setCustomConfirmTitle] = useState("");
  const [customConfirmMessage, setCustomConfirmMessage] = useState("");
  const [customConfirmAction, setCustomConfirmAction] = useState(null);
  
  const [pendingRecovery, setPendingRecovery] = useState(null);

  const cardTimerRef = useRef(null);
  const roundTimerRef = useRef(null);
  const currentUserIdRef = useRef(null);
  const toastTimerRef = useRef(null);

  // 2. Fetch Profile State
  const fetchUserProfile = async (user) => {
    try {
      console.log("Fetching profile for user:", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('streak_count, last_played_at, plant_stage, xp_total, level, total_games_played, total_focus_minutes, username, full_name, restored_at, deleted_at')
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
        setProfileData(data);
        
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

  // 1. Authentication Listener + Session Tracker
  useEffect(() => {
    if (fingerprint) {
      setSession({ user: { id: fingerprint, email: "Trial Guest", isTrial: true } });
      setIsProfileLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        currentUserIdRef.current = currentSession.user.id;
        fetchUserProfile(currentSession.user);
        SessionTracker.start(currentSession.user.id);
      } else {
        setIsProfileLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const isInitialOrDifferentUser = currentUserIdRef.current !== newSession?.user?.id;
      setSession(newSession);
      
      if (newSession?.user) {
        currentUserIdRef.current = newSession.user.id;
        if (isInitialOrDifferentUser) setIsProfileLoading(true);
        fetchUserProfile(newSession.user);
        if (isInitialOrDifferentUser) SessionTracker.start(newSession.user.id);
      } else {
        currentUserIdRef.current = null;
        setStreak(0);
        setLastPlayed(null);
        setIsProfileLoading(false);
        SessionTracker.end();
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
      SessionTracker.end();
    };
  }, [fingerprint, username]);

  // Route back to personalized dashboard after generic login (like /desktop-login)
  useEffect(() => {
    if (session?.user && profileUsername && !username && !fingerprint) {
      navigate(`/${profileUsername}/${activeTab}`, { replace: true });
    }
  }, [session, profileUsername, username, fingerprint, activeTab, navigate]);

  // 3. Game Completion Handler — delegates to gameEngine (which handles all DB + XP)
  const handleGameComplete = async (gameId, stats) => {
    setLastGameStats(stats);
    setEngagementResult(null);
    setIsProcessing(true);
    setLeafTrigger(`Game completed at ${Date.now()}`);

    if (session?.user && !session.user.isTrial) {
      await logGameSession(
        gameId,
        stats,
        session,
        profileData,
        (updatedProfile, result) => {
          // Update local state from DB result
          setStreak(updatedProfile.streak_count || 0);
          setLastPlayed(updatedProfile.last_played_at);
          setProfileData(updatedProfile);
          setEngagementResult(result);
          setIsProcessing(false);

          if (result.isFirstGameToday) {
            showToast(`🔥 Streak saved! Day ${updatedProfile.streak_count} locked in.`);
          }
          if (result.leveledUp) {
            showToast(`🎉 Level Up! You reached Level ${result.newLevel}!`);
          }
          result.newBadges?.forEach(b => showToast(`${b.icon} Badge: ${b.name} (+${b.xp} XP)`));
        }
      );
    } else {
      setIsProcessing(false);
    }
  };

  // 4. Global UI Helpers
  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(""), 4000);
  };

  const triggerConfirm = (title, message, action) => {
    setCustomConfirmTitle(title);
    setCustomConfirmMessage(message);
    setCustomConfirmAction(() => action);
    setCustomConfirmOpen(true);
  };

  const [totalTimePlayed, setTotalTimePlayed] = useState(0);

  const startSpecificGame = async (gameId) => {
    setActiveGameId(gameId);
    setEngagementResult(null);
    // Load this game's adaptive level and total time from cache or DB
    if (allGameLevels[gameId] !== undefined) {
      setCurrentLevel(allGameLevels[gameId]);
    } else if (session?.user && !session.user.isTrial) {
      try {
        const { data } = await supabase
          .from('user_game_levels')
          .select('level')
          .eq('user_id', session.user.id)
          .eq('game_id', gameId)
          .maybeSingle();
        const lv = data?.level || 1;
        setCurrentLevel(lv);
        setAllGameLevels(prev => ({ ...prev, [gameId]: lv }));
      } catch { setCurrentLevel(1); }
    } else {
      setCurrentLevel(1);
    }
    
    // Fetch total time played
    if (session?.user && !session.user.isTrial) {
      try {
        const { data } = await supabase
          .from('game_history')
          .select('duration_seconds')
          .eq('user_id', session.user.id)
          .eq('game_id', gameId);
        const secs = data ? data.reduce((acc, row) => acc + (row.duration_seconds || 0), 0) : 0;
        setTotalTimePlayed(secs);
      } catch { setTotalTimePlayed(0); }
    } else {
      setTotalTimePlayed(0);
    }

    setGameState('playing');
    setActiveTab('games');
  };

  // Grow — pick next game in weakest category not yet played today
  const handleGrow = () => {
    const categories = GAME_REGISTRY.map(g => g.category);
    const unique = [...new Set(categories)];
    // Simple: cycle to next game that isn't the current one
    const others = GAME_REGISTRY.filter(g => g.id !== activeGameId && g.status === 'active');
    const next   = others[Math.floor(Math.random() * others.length)];
    if (next) startSpecificGame(next.id);
    else setGameState('inactive');
  };



  const renderContent = () => {
    if (gameState === 'playing' && activeGameId) {
      const gameInfo = getGame(activeGameId);
      const difficultyValue = gameInfo ? getDifficultyValue(gameInfo, currentLevel) : null;

      // AppShell only provides identity/completion props.
      // UGP injects: isActive, onHudUpdate, soundEnabled, sessionSeconds via React.cloneElement
      const gameProps = {
        onComplete:  (stats) => handleGameComplete(activeGameId, stats),
        onQuit:      () => setGameState('inactive'),
        difficultyValue,
        level: currentLevel,
      };

      const GAME_MAP = {
        speedmatch:    <SpeedMatch    {...gameProps} />,
        chromashift:   <ChromaShift   {...gameProps} />,
        countflow:     <CountFlow     {...gameProps} />,
        directiondash: <DirectionDash {...gameProps} />,
        echomap:       <EchoMap       {...gameProps} />,
        focusgrid:     <FocusGrid     {...gameProps} />,
        gravitysort:   <GravitySort   {...gameProps} />,
        numbercascade: <NumberCascade {...gameProps} />,
        patternpulse:  <PatternPulse  {...gameProps} />,
        phaselock:     <PhaseLock     {...gameProps} />,
        reactiontap:   <ReactionTap   {...gameProps} />,
        symbolmatch:   <SymbolMatch   {...gameProps} />,
        timeestimator: <TimeEstimator {...gameProps} />,
        weightguess:   <WeightGuess   {...gameProps} />,
        wordwarp:      <WordWarp      {...gameProps} />,
      };

      const gameComponent = GAME_MAP[activeGameId] ?? (
        <div className="active-game-container">
          <div className="game-stage">
            <h2>{activeGameId}</h2>
            <p>Game not found.</p>
            <button className="btn-secondary" onClick={() => setGameState('inactive')}>Exit</button>
          </div>
        </div>
      );

      return (
        <UniversalGamePlayer
          key={activeGameId}
          gameId={activeGameId}
          currentLevel={currentLevel}
          totalTimePlayed={totalTimePlayed}
          onGameComplete={handleGameComplete}
          onExitToGym={() => setGameState('inactive')}
          onGrow={handleGrow}
          engagementResult={engagementResult}
          isProcessing={isProcessing}
        >
          {gameComponent}
        </UniversalGamePlayer>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardView streak={streak} onEnterGym={() => navigate(`${basePath}/braingym`)} session={session} profileUsername={profileUsername || username} />;
      case "games":
        return <BrainGymView onPlayGame={startSpecificGame} />;
      case 'sessions':
        return <WorkoutSessionsView session={session} onStartGame={startSpecificGame} />;
      case 'coaches':
        return <CoachesPage onStartGame={(schedule) => { setGameState('playing'); }} />;
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

  // (Theme persistence is handled globally by InteractiveLeaf)

  if (isProfileLoading) {
    return (
      <div className="app-container" style={{ 
        display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(135deg, var(--color-sage-light), var(--bg))', position: 'relative', overflow: 'hidden'
      }}>
        {/* Glowing orb background */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--color-emerald-base)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.15, animation: 'pulse 3s infinite alternate' }}></div>
        
        {/* Glassy card loader */}
        <div className="glass-panel animate-pop" style={{ 
          padding: '40px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', 
          border: '1px solid rgba(40,77,54,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.05), inset 0 0 20px rgba(255,255,255,0.5)', zIndex: 1
        }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px' }}>
            {/* Sleek Conic Gradient Spinner */}
            <div style={{ 
              position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
              background: 'conic-gradient(from 0deg, transparent 0%, transparent 20%, var(--color-emerald-base) 100%)',
              animation: 'spin 1s linear infinite',
              maskImage: 'radial-gradient(transparent 56%, black 57%)',
              WebkitMaskImage: 'radial-gradient(transparent 56%, black 57%)'
            }}></div>
            {/* Leaf inside */}
            <div style={{ position: 'absolute', fontSize: '2.2rem', animation: 'pulse 2s infinite' }}>🌿</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-header)', color: 'var(--color-emerald-deep)', letterSpacing: '1px' }}>DopaMind</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-emerald-base)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>Awakening Profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      <AutoUpdater />
      {/* 🌿 Global Nature Glass Background Layer + Giant Leaves */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
        // Giant Leaves Background Effect - Configurable Density/Visibility
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150' opacity='0.85'%3E%3Cpath d='M0,0 Q60,10 130,130' fill='none' stroke='%233f6212' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M20,5 Q70,40 100,70' fill='none' stroke='%234d7c0f' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M5,20 Q40,70 70,100' fill='none' stroke='%234d7c0f' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M10,2 Q25,-5 35,5 Q20,10 10,2' fill='%2365a30d'/%3E%3Cpath d='M45,10 Q60,0 70,15 Q55,25 45,10' fill='%234d7c0f'/%3E%3Cpath d='M80,25 Q100,15 105,35 Q85,45 80,25' fill='%2384cc16'/%3E%3Cpath d='M100,60 Q120,55 120,80 Q100,85 100,60' fill='%2365a30d'/%3E%3Cpath d='M55,25 Q70,15 80,30 Q65,40 55,25' fill='%234d7c0f' opacity='0.8'/%3E%3Cpath d='M85,45 Q100,35 110,50 Q95,60 85,45' fill='%2384cc16' opacity='0.9'/%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150' opacity='0.85'%3E%3Cg transform='scale(-1, 1) translate(-150, 0)'%3E%3Cpath d='M0,0 Q60,10 130,130' fill='none' stroke='%233f6212' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M20,5 Q70,40 100,70' fill='none' stroke='%234d7c0f' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M5,20 Q40,70 70,100' fill='none' stroke='%234d7c0f' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M10,2 Q25,-5 35,5 Q20,10 10,2' fill='%2365a30d'/%3E%3Cpath d='M45,10 Q60,0 70,15 Q55,25 45,10' fill='%234d7c0f'/%3E%3Cpath d='M80,25 Q100,15 105,35 Q85,45 80,25' fill='%2384cc16'/%3E%3Cpath d='M100,60 Q120,55 120,80 Q100,85 100,60' fill='%2365a30d'/%3E%3Cpath d='M55,25 Q70,15 80,30 Q65,40 55,25' fill='%234d7c0f' opacity='0.8'/%3E%3Cpath d='M85,45 Q100,35 110,50 Q95,60 85,45' fill='%2384cc16' opacity='0.9'/%3E%3C/g%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150' opacity='0.85'%3E%3Cg transform='scale(1, -1) translate(0, -150)'%3E%3Cpath d='M0,0 Q60,10 130,130' fill='none' stroke='%233f6212' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M20,5 Q70,40 100,70' fill='none' stroke='%234d7c0f' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M5,20 Q40,70 70,100' fill='none' stroke='%234d7c0f' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M10,2 Q25,-5 35,5 Q20,10 10,2' fill='%2365a30d'/%3E%3Cpath d='M45,10 Q60,0 70,15 Q55,25 45,10' fill='%234d7c0f'/%3E%3Cpath d='M80,25 Q100,15 105,35 Q85,45 80,25' fill='%2384cc16'/%3E%3Cpath d='M100,60 Q120,55 120,80 Q100,85 100,60' fill='%2365a30d'/%3E%3Cpath d='M55,25 Q70,15 80,30 Q65,40 55,25' fill='%234d7c0f' opacity='0.8'/%3E%3Cpath d='M85,45 Q100,35 110,50 Q95,60 85,45' fill='%2384cc16' opacity='0.9'/%3E%3C/g%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150' opacity='0.85'%3E%3Cg transform='scale(-1, -1) translate(-150, -150)'%3E%3Cpath d='M0,0 Q60,10 130,130' fill='none' stroke='%233f6212' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M20,5 Q70,40 100,70' fill='none' stroke='%234d7c0f' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M5,20 Q40,70 70,100' fill='none' stroke='%234d7c0f' stroke-width='1' stroke-linecap='round'/%3E%3Cpath d='M10,2 Q25,-5 35,5 Q20,10 10,2' fill='%2365a30d'/%3E%3Cpath d='M45,10 Q60,0 70,15 Q55,25 45,10' fill='%234d7c0f'/%3E%3Cpath d='M80,25 Q100,15 105,35 Q85,45 80,25' fill='%2384cc16'/%3E%3Cpath d='M100,60 Q120,55 120,80 Q100,85 100,60' fill='%2365a30d'/%3E%3Cpath d='M55,25 Q70,15 80,30 Q65,40 55,25' fill='%234d7c0f' opacity='0.8'/%3E%3Cpath d='M85,45 Q100,35 110,50 Q95,60 85,45' fill='%2384cc16' opacity='0.9'/%3E%3C/g%3E%3C/svg%3E")
        `,
        backgroundPosition: 'top -5% left -5%, top -5% right -5%, bottom -5% left -5%, bottom -5% right -5%',
        backgroundRepeat: 'no-repeat',
        // DENSITY/SIZE CONTROL:
        backgroundSize: '600px 600px', // Increased size drastically!
        opacity: 0.12, // VISIBILITY CONTROL: Adjust this to make it more or less visible (0.05 to 0.3)
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60vw', height: '60vw', background: 'var(--color-emerald-light)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15, animation: 'pulse 8s infinite alternate' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '70vw', height: '70vw', background: 'var(--color-sage-light)', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.1, animation: 'pulse 10s infinite alternate-reverse' }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backdropFilter: 'blur(15px)', background: 'rgba(255, 255, 255, 0.05)' }}></div>
      </div>

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

          />

          {/* Main Viewport */}
          <main className="content-panel" style={{ position: 'relative', zIndex: 1 }}>
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
