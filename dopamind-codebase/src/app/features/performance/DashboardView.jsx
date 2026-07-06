import React from 'react';
import { Flame } from 'lucide-react';
import PerformanceChart from '@/app/features/performance/PerformanceChart';
import Leaderboard from '@/app/features/performance/Leaderboard';

export default function DashboardView({ streak, onEnterGym, session, profileUsername }) {
  const getPlantStage = (streakDays) => {
    if (streakDays >= 30) return { icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--color-accent-gold)"><path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.5-6.3-4.8-6.3 4.8 2.3-7.5-6-4.6h7.6z"/></svg>, label: 'Golden Bloom' };
    if (streakDays >= 7) return { icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--color-emerald-base)"><path d="M12 22s8-4 8-12a8 8 0 00-16 0c0 8 8 12 8 12z"/></svg>, label: 'Sage Branch' };
    if (streakDays >= 3) return { icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--color-emerald-deep)"><path d="M12 22s5-3 5-9a5 5 0 00-10 0c0 6 5 9 5 9z"/></svg>, label: 'Sturdy Sprout' };
    if (streakDays >= 1) return { icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--color-emerald-light)"><circle cx="12" cy="18" r="4"/></svg>, label: 'Seedling' };
    return { icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="transparent" stroke="var(--border)"><circle cx="12" cy="18" r="4"/></svg>, label: 'Empty Pot (Play to Plant)' };
  };
  const plant = getPlantStage(streak || 0);

  return (
    <>
      <header className="tab-header" style={{ marginBottom: '24px' }}>
        <h1>Welcome Back, {profileUsername || 'Guest'}</h1>
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
          <button className="btn-primary" onClick={onEnterGym}>
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
