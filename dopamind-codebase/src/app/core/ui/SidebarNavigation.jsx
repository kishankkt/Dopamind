import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, Settings, BrainCircuit, LayoutList } from 'lucide-react';
import { BrandConfig } from '@/config/brand';
import LogoIcon from '@/shared/ui/LogoIcon';
import { supabase } from '@/supabaseClient';

export default function SidebarNavigation({ 
  session, 
  profileUsername,
  activeTab, 
  basePath,
  gameState, 
  activeGameId, 
  setGameState, 
  setLeafTrigger,
  triggerConfirm,
  cardTimerRef,
  roundTimerRef,
  darkMode,
  setDarkMode
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNav = (tab, triggerMsg) => {
    if (gameState === "playing") {
      triggerConfirm("Quit workout?", "Your active score and latency metrics for this round will be discarded.", () => {
        if (cardTimerRef?.current) clearInterval(cardTimerRef.current);
        if (roundTimerRef?.current) clearInterval(roundTimerRef.current);
        setGameState("inactive");
        navigate(`${basePath}/${tab}`);
        setLeafTrigger(`User quit playing ${activeGameId} and navigated to ${tab} at ${Date.now()}`);
      });
    } else {
      setGameState("inactive");
      navigate(`${basePath}/${tab}`);
      setLeafTrigger(triggerMsg);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand-group">
        <div className="sidebar-logo">
          <span className="logo-text" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <LogoIcon width={24} height={24} />
            {BrandConfig.name}
          </span>
        </div>
        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === "dashboard" || gameState === "playing" || gameState === "summary" ? "active" : ""}`}
            onClick={() => handleNav("dashboard", `User navigated to dashboard at ${Date.now()}`)}
          >
            <span><LayoutDashboard size={20} /></span> Dashboard
          </button>
          <button 
            className={`menu-item ${activeTab === "games" || activeTab === "braingym" ? "active" : ""}`}
            onClick={() => handleNav("braingym", `User navigated to Brain Gym at ${Date.now()}`)}
          >
            <span><Gamepad2 size={20} /></span> Brain Gym
          </button>
          <button 
            className={`menu-item ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => handleNav('sessions', `User navigated to Sessions at ${Date.now()}`)}
          >
            <span><LayoutList size={20} /></span> Your Sessions
          </button>
          <button 
            className={`menu-item ${activeTab === "coaches" ? "active" : ""}`}
            onClick={() => handleNav("coaches", `User navigated to Coaches at ${Date.now()}`)}
          >
            <span><BrainCircuit size={20} /></span> Your Coaches
          </button>
          <button 
            className={`menu-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => handleNav("settings", `User navigated to Settings at ${Date.now()}`)}
          >
            <span><Settings size={20} /></span> Settings
          </button>
        </nav>
      </div>
      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '16px' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem' }}>Logged in as: <br /><strong style={{ wordBreak: 'break-all' }}>{profileUsername ? `@${profileUsername}` : (session?.user?.email || "Guest")}</strong></p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {session?.user && (
            <button 
              onClick={handleLogout}
              className="logout-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 16px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: 'none',
                borderRadius: '12px',
                color: '#f87171',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'background 0.2s',
                justifyContent: 'center'
              }}
            >
              🚪 Sign Out
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
