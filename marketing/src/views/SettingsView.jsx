import React from 'react';

export default function SettingsView({ session, showToast }) {
  return (
    <>
      <header className="tab-header">
        <h1>Settings</h1>
        <p>Manage your account configurations and profile connections.</p>
      </header>
      <div className="glass-panel settings-card" style={{ maxWidth: '600px' }}>
        <h2>User Profile</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
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
              <button className="btn-primary" onClick={() => showToast("Profile updated successfully!")}>Update Profile</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
