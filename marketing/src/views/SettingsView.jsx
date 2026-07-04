import React, { useState } from 'react';
import { Sun, Moon, Bell, Volume2, Shield, Settings, Sparkles, MessageSquare } from 'lucide-react';

export default function SettingsView({ 
  session, 
  showToast, 
  darkMode, 
  setDarkMode, 
  aiWidgetSize, 
  setAiWidgetSize, 
  autoGuide, 
  setAutoGuide 
}) {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  return (
    <>
      <header className="tab-header">
        <h1>Settings</h1>
        <p>Manage your account configurations and profile connections.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', maxWidth: '900px' }}>
        
        {/* Profile Card */}
        <div className="glass-panel settings-card" style={{ padding: '32px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 24px 0' }}>
            <Shield size={24} color="var(--color-emerald-base)" /> User Profile
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-emerald-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}>
                {session.user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, opacity: 0.7 }}>Account Email</p>
                <strong style={{ fontSize: '1.2rem' }}>{session.user.email}</strong>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Username</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  defaultValue={session.user.email.split('@')[0]} 
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: '1rem' }} 
                />
                <button className="btn-primary" onClick={() => showToast("Profile updated successfully!")}>Update</button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="glass-panel settings-card" style={{ padding: '32px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 24px 0' }}>
            <Settings size={24} color="var(--color-emerald-base)" /> App Preferences
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Theme Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Theme Mode</strong>
                <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Switch between Light and Dark aesthetics.</span>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '12px',
                  background: darkMode ? 'var(--color-emerald-base)' : 'var(--color-white)',
                  color: darkMode ? 'white' : 'var(--color-emerald-deep)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600
                }}
              >
                {darkMode ? <><Moon size={18} /> Dark</> : <><Sun size={18} /> Light</>}
              </button>
            </div>

            {/* AI Assistant Layout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>AI Layout (Mobile Friendly)</strong>
                <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Choose standard chat window or compact banner notifications.</span>
              </div>
              <button 
                onClick={() => {
                  const targetSize = aiWidgetSize === 'standard' ? 'compact' : 'standard';
                  setAiWidgetSize(targetSize);
                  showToast(`AI size set to ${targetSize === 'compact' ? 'Compact' : 'Standard'}`);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '12px',
                  background: aiWidgetSize === 'compact' ? 'var(--color-emerald-base)' : 'transparent',
                  color: aiWidgetSize === 'compact' ? 'white' : 'var(--text)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600
                }}
              >
                <MessageSquare size={18} /> {aiWidgetSize === 'compact' ? 'Compact' : 'Standard'}
              </button>
            </div>

            {/* AI Explainer / Onboarding */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>AI Auto Explainer</strong>
                <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Automatically pop up guide prompts on visiting pages.</span>
              </div>
              <button 
                onClick={() => {
                  setAutoGuide(!autoGuide);
                  showToast(autoGuide ? "Auto Guide disabled!" : "Auto Guide enabled!");
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '12px',
                  background: autoGuide ? 'var(--color-emerald-base)' : 'transparent',
                  color: autoGuide ? 'white' : 'var(--text)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600
                }}
              >
                <Sparkles size={18} /> {autoGuide ? 'On Visit' : 'Manual'}
              </button>
            </div>

            {/* Sound Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Sound Effects</strong>
                <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Enable pentatonic chimes during games.</span>
              </div>
              <button 
                onClick={() => setSound(!sound)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '12px',
                  background: sound ? 'var(--color-emerald-base)' : 'transparent',
                  color: sound ? 'white' : 'var(--text)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600
                }}
              >
                <Volume2 size={18} /> {sound ? 'On' : 'Off'}
              </button>
            </div>

            {/* Notifications Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Push Notifications</strong>
                <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Get daily streak reminders and brain gym alerts.</span>
              </div>
              <button 
                onClick={() => {
                  setNotifications(!notifications);
                  if(!notifications) showToast("Notifications enabled!");
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '12px',
                  background: notifications ? 'var(--color-emerald-base)' : 'transparent',
                  color: notifications ? 'white' : 'var(--text)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600
                }}
              >
                <Bell size={18} /> {notifications ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
