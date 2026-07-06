import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, Settings, BrainCircuit } from 'lucide-react';
import { BrandConfig } from '@/config/brand';
import LogoIcon from '@/shared/ui/LogoIcon';

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
  roundTimerRef
}) {
  const navigate = useNavigate();

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
            className={`menu-item ${activeTab === "guidance" ? "active" : ""}`}
            onClick={() => handleNav("guidance", `User navigated to AI Guidance at ${Date.now()}`)}
          >
            <span><BrainCircuit size={20} /></span> AI Guidance
          </button>
          <button 
            className={`menu-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => handleNav("settings", `User navigated to Settings at ${Date.now()}`)}
          >
            <span><Settings size={20} /></span> Settings
          </button>
        </nav>
      </div>
      <div className="sidebar-footer">
        <p>Logged in as: <br /><strong>{profileUsername ? `@${profileUsername}` : (session?.user?.email || "Guest")}</strong></p>
      </div>
    </aside>
  );
}
