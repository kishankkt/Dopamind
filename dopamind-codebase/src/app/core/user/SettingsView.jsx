import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Shield, Settings, Sparkles, MessageSquare, Sun, Moon, Bell, Volume2, UserX } from 'lucide-react';

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
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileUsername, setProfileUsername] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [updatingUsername, setUpdatingUsername] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
      if (data) {
        setProfileUsername(data.username);
        setEditUsername(data.username);
      }
    }
    if (session?.user?.id) loadProfile();
  }, [session]);

  useEffect(() => {
    if (!editUsername || editUsername === profileUsername) {
      setUsernameStatus(null);
      return;
    }
    const checkUsername = async () => {
      setUsernameStatus('checking');
      if (!/^[a-zA-Z0-9_]+$/.test(editUsername)) {
        setUsernameStatus('invalid');
        return;
      }
      const { data, error } = await supabase.from('profiles').select('username').eq('username', editUsername).single();
      if (error && error.code === 'PGRST116') setUsernameStatus('available');
      else if (data) setUsernameStatus('taken');
    };
    const delayDebounceFn = setTimeout(() => checkUsername(), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [editUsername, profileUsername]);

  const handleUpdateUsername = async () => {
    if (usernameStatus !== 'available' || !editUsername) return;
    setUpdatingUsername(true);
    try {
      const { error } = await supabase.from('profiles').update({ username: editUsername }).eq('id', session.user.id);
      if (error) throw error;
      setProfileUsername(editUsername);
      showToast("Username updated successfully!");
    } catch (err) {
      alert("Error updating username: " + err.message);
    } finally {
      setUpdatingUsername(false);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', session.user.id);
      if (updateError) throw updateError;
      
      showToast('Avatar updated successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would call a secure edge function to delete the user.
    // For now, we sign them out to simulate the effect.
    await supabase.auth.signOut();
    window.location.href = '/';
  };

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
              <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-emerald-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 'bold', overflow: 'hidden' }}>
                {session.user.email.charAt(0).toUpperCase()}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={uploadAvatar}
                  disabled={uploading}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
              </div>
              <div>
                <p style={{ margin: 0, opacity: 0.7 }}>Account Email</p>
                <strong style={{ fontSize: '1.2rem' }}>{session.user.email}</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', opacity: 0.6 }}>{uploading ? 'Uploading...' : 'Click avatar to change'}</p>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Username
                {usernameStatus === 'available' && <span style={{color: 'var(--color-emerald-base)', fontSize: '0.8rem', marginLeft: '8px'}}>Available ✅</span>}
                {usernameStatus === 'taken' && <span style={{color: 'red', fontSize: '0.8rem', marginLeft: '8px'}}>Taken ❌</span>}
                {usernameStatus === 'invalid' && <span style={{color: 'red', fontSize: '0.8rem', marginLeft: '8px'}}>Letters/numbers/_ only</span>}
                {usernameStatus === 'checking' && <span style={{color: 'gray', fontSize: '0.8rem', marginLeft: '8px'}}>Checking...</span>}
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase())}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid', borderColor: usernameStatus === 'taken' ? 'red' : usernameStatus === 'available' ? 'var(--color-emerald-base)' : 'var(--border)', background: 'transparent', color: 'var(--text)', fontSize: '1rem' }} 
                />
                <button 
                  className="btn-primary" 
                  disabled={updatingUsername || usernameStatus !== 'available'}
                  onClick={handleUpdateUsername}
                >
                  {updatingUsername ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Management Card */}
        <div className="glass-panel settings-card" style={{ padding: '32px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 24px 0', color: 'var(--color-error)' }}>
            <UserX size={24} /> Account Management
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Delete Account</strong>
                <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Permanently remove all data.</span>
              </div>
              <button 
                onClick={() => setShowDeleteModal(true)}
                style={{
                  padding: '10px 16px', borderRadius: '12px',
                  background: 'transparent',
                  color: 'var(--color-error)',
                  border: '1px solid var(--color-error)', cursor: 'pointer', fontWeight: 600
                }}
              >
                Delete
              </button>
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
