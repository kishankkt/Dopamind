import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Shield, Settings, Sparkles, MessageSquare, Sun, Moon, Bell, Volume2, UserX } from 'lucide-react';
import NotificationEngine from '@/app/core/engagement/NotificationEngine';

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
  const [notifPrefs, setNotifPrefs] = useState(null);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

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
    async function loadNotifPrefs() {
      const prefs = await NotificationEngine.loadPreferences(session?.user?.id);
      if (prefs) setNotifPrefs(prefs);
    }
    if (session?.user?.id) {
      loadProfile();
      loadNotifPrefs();
    }
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

        {/* Notifications Card */}
        <div className="glass-panel settings-card" style={{ padding: '32px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 24px 0' }}>
            <Bell size={24} color="var(--color-emerald-base)" /> Notifications
          </h2>

          {/* Permission Status */}
          <div style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Browser Notifications</strong>
                <span style={{ fontSize: '0.82rem', opacity: 0.65 }}>
                  {notifPermission === 'granted' ? 'Enabled — notifications will appear on your desktop.' :
                   notifPermission === 'denied'  ? 'Blocked — enable in your browser settings.' :
                   'Not yet requested.'}
                </span>
              </div>
              {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                <button
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                  onClick={async () => {
                    const granted = await NotificationEngine.requestPermission();
                    setNotifPermission(Notification.permission);
                    if (granted) showToast('Notifications enabled!');
                    else showToast('Permission denied by browser.');
                  }}
                >
                  Enable
                </button>
              )}
              {notifPermission === 'granted' && (
                <span style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.15)', color: 'var(--color-emerald-base)', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700 }}>Active</span>
              )}
            </div>
          </div>

          {/* Per-type toggles */}
          {notifPrefs && notifPermission === 'granted' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Streak Reminders', key: 'streak_reminder_enabled', desc: `Daily reminder at ${notifPrefs.streak_reminder_time?.slice(0,5) || '20:00'}` },
                { label: 'Badge Unlocks',    key: 'badge_notifications',     desc: 'Notify when you earn a new badge' },
                { label: 'Level Ups',        key: 'level_up_notifications',  desc: 'Celebrate new level achievements' },
                { label: 'Personal Bests',   key: 'personal_best_notifications', desc: 'Notify on new all-time records' },
                { label: 'Weekly Summary',   key: 'weekly_summary_enabled',  desc: 'Weekly performance digest' },
              ].map(({ label, key, desc }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{label}</strong>
                    <span style={{ fontSize: '0.78rem', opacity: 0.6 }}>{desc}</span>
                  </div>
                  <button
                    onClick={async () => {
                      const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
                      setNotifPrefs(updated);
                      await NotificationEngine.savePreferences(session.user.id, { [key]: updated[key] });
                    }}
                    style={{
                      width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                      background: notifPrefs[key] ? 'var(--color-emerald-base)' : 'var(--border)',
                      position: 'relative', transition: 'background 0.2s',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '3px', borderRadius: '50%', width: '18px', height: '18px',
                      background: 'white', transition: 'left 0.2s',
                      left: notifPrefs[key] ? '23px' : '3px',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
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

            {/* Hide Bubbles Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Floating Bubbles</strong>
                <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Show the Theme and Chatbot bubbles.</span>
              </div>
              <button 
                onClick={() => {
                  const current = localStorage.getItem('dopamind_bubbles_visible') !== 'false';
                  const next = !current;
                  localStorage.setItem('dopamind_bubbles_visible', next);
                  window.dispatchEvent(new CustomEvent('toggle-bubbles', { detail: { visible: next } }));
                  showToast(next ? "Bubbles shown" : "Bubbles hidden");
                }}
                style={{
                  padding: '10px 16px', borderRadius: '12px',
                  background: 'transparent',
                  color: 'var(--text)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600
                }}
              >
                Toggle Visibility
              </button>
            </div>

            {/* Reset Bubble Position */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Reset Floating Bubbles</strong>
                <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>Snap the Chat and Theme bubbles back to default.</span>
              </div>
              <button 
                onClick={() => {
                  window.dispatchEvent(new Event('reset-bubble'));
                  showToast("Bubble position reset!");
                }}
                style={{
                  padding: '10px 16px', borderRadius: '12px',
                  background: 'transparent',
                  color: 'var(--text)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600
                }}
              >
                Reset Position
              </button>
            </div>
          </div>
        </div>

        {/* 💰 Subscription / Plan Card */}
        <div className="glass-panel settings-card" style={{ padding: '32px', gridColumn: '1 / -1' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 24px 0' }}>
            <Sparkles size={24} color="var(--color-emerald-base)" /> DopaMind Plan
          </h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { name: 'Free', price: '$0 / mo', features: ['15 brain games', '5-min daily sessions', 'Progress tracking', 'Adaptive difficulty'], current: true, badge: 'Your Plan' },
              { name: 'Growth', price: '$7 / mo', features: ['Everything in Free', 'AI Coach sessions', 'Advanced analytics', 'Priority support'], current: false, badge: 'Coming v2' },
              { name: 'Team', price: '$15 / mo', features: ['Everything in Growth', 'Team dashboards', 'Bulk coaching', 'Custom reports'], current: false, badge: 'Coming v2' },
            ].map(plan => (
              <div key={plan.name} style={{
                flex: '1 1 220px',
                padding: '24px',
                borderRadius: 20,
                border: `2px solid ${plan.current ? 'var(--color-emerald-base)' : 'var(--border)'}`,
                background: plan.current ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: -10, right: 16, background: plan.current ? 'var(--color-emerald-base)' : '#374151', color: 'white', borderRadius: 20, padding: '3px 12px', fontSize: '0.7rem', fontWeight: 800 }}>
                  {plan.badge}
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-emerald-base)', marginBottom: 12 }}>{plan.price}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {plan.features.map(f => <li key={f} style={{ fontSize: '0.82rem', opacity: 0.8 }}>✓ {f}</li>)}
                </ul>
                {!plan.current && (
                  <button disabled style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'not-allowed', fontWeight: 700, opacity: 0.6 }}>
                    Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 📡 Engagement Channel Cards (v2 Coming Soon) */}
        <div className="glass-panel settings-card" style={{ padding: '32px', gridColumn: '1 / -1' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 8px 0' }}>
            <MessageSquare size={24} color="var(--color-emerald-base)" /> Engagement Channels
          </h2>
          <p style={{ opacity: 0.6, fontSize: '0.85rem', marginBottom: 24 }}>Connect DopaMind to your preferred channels for reminders and insights.</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { icon: '✉️', name: 'Email Digest', desc: 'Weekly brain gym summary & streak reminders', v2: true },
              { icon: '💬', name: 'WhatsApp Bot', desc: 'Daily nudges and streak alerts on WhatsApp', v2: true },
              { icon: '📱', name: 'Push Notifications', desc: 'Browser & mobile push (active)', v2: false, active: true },
              { icon: '🔔', name: 'Slack Reminders', desc: 'Team-level brain gym reminders', v2: true },
            ].map(ch => (
              <div key={ch.name} style={{ flex: '1 1 200px', padding: '20px', borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', position: 'relative', opacity: ch.v2 ? 0.7 : 1 }}>
                {ch.v2 && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#374151', color: '#9ca3af', borderRadius: 20, padding: '2px 10px', fontSize: '0.65rem', fontWeight: 800 }}>v2</div>
                )}
                {ch.active && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--color-emerald-base)', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: '0.65rem', fontWeight: 800 }}>Active</div>
                )}
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{ch.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{ch.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{ch.desc}</div>
              </div>
            ))}
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
