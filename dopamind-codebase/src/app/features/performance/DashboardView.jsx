import React from 'react';
import { Flame } from 'lucide-react';
import PerformanceChart from '@/app/features/performance/PerformanceChart';
import Leaderboard from '@/app/features/performance/Leaderboard';

export default function DashboardView({ streak, plant, setActiveTab, session }) {
  return (
    <>
      <header className="tab-header">
        <h1>Welcome Back, Focus Gymnast</h1>
        <p>Build your cognitive attention span using zero-bloat game exercises.</p>
      </header>

      <div className="dashboard-grid">
        <div className="glass-panel streak-card">
          <h2>Daily Streak Progress</h2>
          <div className="streak-status-badge" style={{display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center'}}>
            <Flame size={18} style={{color: '#f97316'}} /> {streak} {streak === 1 ? "Day Streak" : "Days Streak"}
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
            <div className="plant-icon-main animate-wiggle" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {plant.icon}
            </div>
            <div className="plant-pot-base" style={{width: '50px', height: '30px', background: 'var(--color-emerald-deep)', borderRadius: '4px 4px 16px 16px', borderTop: '6px solid var(--color-emerald-base)', marginTop: '-10px', zIndex: 1}}></div>
          </div>
          <p className="plant-label">Current: <strong>{plant.label}</strong></p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px' }}>
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column' }}>
          <PerformanceChart session={session} />
        </div>
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
          <Leaderboard />
        </div>
      </div>
    </>
  );
}
