import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, Settings, BrainCircuit, LayoutList } from 'lucide-react';
import { BrandConfig } from '@/config/brand';
import LogoIcon from '@/shared/ui/LogoIcon';
import { supabase } from '@/supabaseClient';
import { getVersion } from '@tauri-apps/api/app';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

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
  const [appVersion, setAppVersion] = React.useState('');
  const [updateInfo, setUpdateInfo] = React.useState(null);
  const [updateStatus, setUpdateStatus] = React.useState('idle');
  const [downloadProgress, setDownloadProgress] = React.useState({ downloaded: 0, total: 0 });

  React.useEffect(() => {
    if (window.__TAURI_INTERNALS__) {
      getVersion().then(v => setAppVersion(v)).catch(console.error);
      check().then(update => {
        if (update) setUpdateInfo(update);
      }).catch(console.error);
    }
  }, []);

  const handleUpdate = async () => {
    if (!updateInfo) return;
    setUpdateStatus('downloading');
    let dl = 0;
    let tot = 0;
    try {
      await updateInfo.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          tot = event.data.contentLength || 0;
          setDownloadProgress({ downloaded: 0, total: tot });
        } else if (event.event === 'Progress') {
          dl += event.data.chunkLength;
          setDownloadProgress({ downloaded: dl, total: tot });
        } else if (event.event === 'Finished') {
          setUpdateStatus('downloaded');
        }
      });
      if (gameState !== 'playing') {
        await relaunch();
      }
    } catch (e) {
      console.error(e);
      setUpdateStatus('error');
    }
  };

  React.useEffect(() => {
    if (updateStatus === 'downloaded' && gameState !== 'playing') {
      if (window.__TAURI_INTERNALS__) relaunch();
    }
  }, [updateStatus, gameState]);

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
        
        {appVersion && (
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            v{appVersion}
            
            {updateInfo && updateStatus === 'idle' && (
              <button onClick={handleUpdate} className="btn-primary" style={{ display: 'block', width: '100%', marginTop: '12px', padding: '8px', fontSize: '0.8rem', borderRadius: '8px' }}>
                Update to v{updateInfo.version}
              </button>
            )}
            
            {updateStatus === 'downloading' && (
              <div style={{ marginTop: '12px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald-base)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Downloading update...</span>
                  <span>{downloadProgress.total ? Math.round((downloadProgress.downloaded / downloadProgress.total) * 100) : 0}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'var(--color-oat)', borderRadius: '4px' }}>
                  <div style={{ width: `${downloadProgress.total ? Math.round((downloadProgress.downloaded / downloadProgress.total) * 100) : 0}%`, height: '100%', background: 'var(--color-emerald-base)', borderRadius: '4px', transition: 'width 0.2s' }}></div>
                </div>
              </div>
            )}
            
            {updateStatus === 'downloaded' && (
              <div style={{ marginTop: '12px', color: 'var(--color-emerald-base)', fontWeight: 'bold' }}>
                Ready to install.<br/>{gameState === 'playing' ? "Will restart after your game." : "Restarting..."}
              </div>
            )}
            
            {updateStatus === 'error' && (
              <div style={{ marginTop: '12px', color: 'var(--color-error-coral)' }}>
                Update failed. <button onClick={handleUpdate} style={{ background: 'none', border: 'none', color: 'var(--color-emerald-base)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Retry</button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
