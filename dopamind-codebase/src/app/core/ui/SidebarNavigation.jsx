import React from 'react';
import { LayoutDashboard, Gamepad2, Settings, BrainCircuit } from 'lucide-react';
import { BrandConfig } from '@/config/brand';

export default function SidebarNavigation({ 
  session, 
  activeTab, 
  gameState, 
  activeGameId, 
  setActiveTab, 
  setGameState, 
  setLeafTrigger,
  triggerConfirm,
  cardTimerRef,
  roundTimerRef
}) {

  const handleNav = (tab, triggerMsg) => {
    if (gameState === "playing") {
      triggerConfirm("Quit workout?", "Your active score and latency metrics for this round will be discarded.", () => {
        if (cardTimerRef?.current) clearInterval(cardTimerRef.current);
        if (roundTimerRef?.current) clearInterval(roundTimerRef.current);
        setGameState("inactive");
        setActiveTab(tab);
        setLeafTrigger(`User quit playing ${activeGameId} and navigated to ${tab} at ${Date.now()}`);
      });
    } else {
      setGameState("inactive");
      setActiveTab(tab);
      setLeafTrigger(triggerMsg);
    }
  };

  return (
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
            onClick={() => handleNav("dashboard", `User navigated to dashboard at ${Date.now()}`)}
          >
            <span><LayoutDashboard size={20} /></span> Dashboard
          </button>
          <button 
            className={`menu-item ${activeTab === "games" ? "active" : ""}`}
            onClick={() => handleNav("games", `User navigated to Brain Gym at ${Date.now()}`)}
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
        <p>Logged in as: <br /><strong>{session?.user?.email || "Guest"}</strong></p>
      </div>
    </aside>
  );
}
