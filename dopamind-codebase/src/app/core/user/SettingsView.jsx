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
  setAutoGuide,
  onUpdateUsername
}) {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileUsername, setProfileUsername] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [updatingFullName, setUpdatingFullName] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionTimer, setDeletionTimer] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('username, full_name').eq('id', session.user.id).single();
      if (data) {
        setProfileUsername(data.username);
        setEditUsername(data.username);
        setEditFullName(data.full_name || "");
      }
    }
    if (session?.user?.id) loadProfile();
  }, [session]);

  useEffect(() => {
    if (deletionTimer === null) return;
    
    if (deletionTimer <= 0) {
      setDeletionTimer(null);
      setIsDeleting(true);
      (async () => {
        try {
          const { error } = await supabase.rpc('delete_user');
          if (error) throw error;
          
          await supabase.auth.signOut();
          window.location.href = '/';
        } catch (err) {
          alert("Deletion failed: " + err.message);
          setIsDeleting(false);
        }
      })();
      return;
    }

    const timer = setTimeout(() => {
      setDeletionTimer(prev => (prev === null ? null : prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [deletionTimer]);

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

  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div style={{ color: 'var(--color-emerald-base)', fontWeight: 600 }}>Loading settings...</div>
      </div>
    );
  }

  const handleUpdateUsername = async () => {
    if (usernameStatus !== 'available' || !editUsername) return;
    setUpdatingUsername(true);
    try {
      const { error } = await supabase.from('profiles').upsert({ 
        id: session.user.id, 
        username: editUsername 
      });
      if (error) throw error;
      setProfileUsername(editUsername);
      if (onUpdateUsername) onUpdateUsername(editUsername);
      showToast("Username updated successfully!");
    } catch (err) {
      alert("Error updating username: " + err.message);
    } finally {
      setUpdatingUsername(false);
    }
  };

  const handleUpdateFullName = async () => {
    if (!editFullName.trim()) return;
    setUpdatingFullName(true);
    try {
      const { error } = await supabase.from('profiles').upsert({ 
        id: session.user.id, 
        full_name: editFullName.trim()
      });
      if (error) throw error;
      showToast("Full name updated successfully!");
    } catch (err) {
      showToast("Error updating full name: " + err.message);
    } finally {
      setUpdatingFullName(false);
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
                {(session?.user?.email || 'G').charAt(0).toUpperCase()}
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
                <strong style={{ fontSize: '1.2rem' }}>{session?.user?.email || 'Guest Session'}</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', opacity: 0.6 }}>{uploading ? 'Uploading...' : 'Click avatar to change'}</p>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Full Name
                  <span style={{color: 'gray', fontSize: '0.8rem', marginLeft: '8px'}}>Your display name</span>
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={editFullName}
                    placeholder="E.g. John Doe"
                    onChange={(e) => setEditFullName(e.target.value)}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: '1rem' }} 
                  />
                  <button 
                    className="btn-primary" 
                    disabled={updatingFullName || !editFullName.trim()}
                    onClick={handleUpdateFullName}
                  >
                    {updatingFullName ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </div>

              <div>
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
        </div>

        {/* Account Management Card */}
        <div className="glass-panel settings-card" style={{ padding: '32px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 24px 0', color: 'var(--color-error-coral)' }}>
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
                  color: 'var(--color-error-coral)',
                  border: '1px solid var(--color-error-coral)', cursor: 'pointer', fontWeight: 600
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
                  background: darkMode ? 'var(--color-emerald-base)' : 'var(--color-oat-light)',
                  color: darkMode ? 'white' : 'var(--text)',
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

      {showDeleteModal && (
        <div className="auth-modal-overlay">
          <div className="auth-modal animate-pop" style={{ maxWidth: '460px', background: 'var(--color-oat-light)', padding: '40px', borderRadius: '24px' }}>
            <h2 style={{ color: 'var(--color-error-coral)', marginBottom: '16px', fontSize: '2rem' }}>Delete Account?</h2>
            <p style={{ opacity: 0.8, fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5', color: 'var(--text)' }}>
              Your account will be immediately disabled and scheduled for <strong>permanent deletion in 30 days</strong>. 
              <br /><br />
              <em>Changed your mind?</em> Simply log back in within 30 days to automatically cancel the deletion and restore your streak progress.
            </p>
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-emerald-base)', marginBottom: '8px' }}>
                Please type your username <strong style={{ color: 'var(--color-error-coral)' }}>{profileUsername || 'guest'}</strong> to confirm:
              </label>
              <input 
                type="text" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={profileUsername || 'guest'}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  const targetUsername = (profileUsername || 'guest').trim().toLowerCase();
                  if (deleteConfirmText.trim().toLowerCase() !== targetUsername) return;
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setDeletionTimer(10);
                }}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  justifyContent: 'center', 
                  background: deleteConfirmText.trim().toLowerCase() === (profileUsername || 'guest').trim().toLowerCase() ? 'var(--color-error-coral)' : 'transparent',
                  color: deleteConfirmText.trim().toLowerCase() === (profileUsername || 'guest').trim().toLowerCase() ? '#ffffff' : 'var(--color-error-coral)',
                  border: deleteConfirmText.trim().toLowerCase() === (profileUsername || 'guest').trim().toLowerCase() ? 'none' : '1px solid var(--color-error-coral)',
                  cursor: deleteConfirmText.trim().toLowerCase() === (profileUsername || 'guest').trim().toLowerCase() ? 'pointer' : 'not-allowed',
                }}
                disabled={deleteConfirmText.trim().toLowerCase() !== (profileUsername || 'guest').trim().toLowerCase() || isDeleting}
              >
                {isDeleting ? 'Processing...' : 'Schedule Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10-Second Deletion Countdown Toast */}
      {deletionTimer !== null && (
        <div className="toast-notification-banner animate-pop" style={{ display: 'flex', alignItems: 'center', gap: '15px', zIndex: 10000, background: 'var(--color-error-coral)', color: 'white' }}>
          <div>
            <strong>Account Deletion Imminent</strong><br/>
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Permanently scheduled for: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString()}. Signing out in {deletionTimer}s...</span>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeletionTimer(null);
              showToast("Deletion cancelled.");
            }}
            style={{ padding: '8px 16px', borderRadius: '8px', background: 'white', color: 'var(--color-error-coral)', fontWeight: 'bold', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Instant Recover
          </button>
        </div>
      )}
    </>
  );
}
