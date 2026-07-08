// FILE: DownloadsPage.jsx
// PURPOSE: Dedicated download page — the /downloads route
// FEATURES:
//   - Auto-detect user's OS and architecture (navigator.userAgent)
//   - Highlight recommended download and pre-select the appropriate architecture dropdown
//   - Grid of ALL platforms: Windows, macOS, Linux, Android, iOS
//   - Download links point to GitHub Releases or App Stores

import React, { useEffect, useState } from 'react';
import PublicLayout from '@/shared/ui/PublicLayout';

const Icons = {
  Windows: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.557l7.357-1.015v7.098H3V5.557zM3 12.383h7.357v7.098L3 18.466v-6.083zM11.143 4.31l9.857-1.36v8.69h-9.857V4.31zM11.143 12.383h9.857v8.69l-9.857-1.36v-7.33z"/></svg>,
  Mac: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M16.36 10.37c-.01-3.3 2.7-4.88 2.82-4.96-1.54-2.25-3.92-2.55-4.78-2.6-2.02-.2-3.95 1.19-4.97 1.19-1.02 0-2.61-1.15-4.27-1.12-2.15.03-4.14 1.25-5.26 3.19-2.27 3.93-.58 9.74 1.63 12.93 1.08 1.56 2.34 3.32 4.02 3.25 1.62-.07 2.25-1.05 4.22-1.05 1.95 0 2.54 1.05 4.22 1.02 1.74-.03 2.85-1.63 3.92-3.19 1.24-1.81 1.75-3.57 1.77-3.66-.04-.01-3.41-1.31-3.42-5.01zm-3.12-6.52c.89-1.07 1.49-2.57 1.33-4.06-1.28.05-2.85.85-3.76 1.92-.81.95-1.5 2.49-1.31 3.95 1.43.11 2.85-.75 3.74-1.81z"/></svg>,
  Linux: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>,
  Android: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341c-.551 0-.999-.448-.999-.999s.448-.999.999-.999c.551 0 .999.448.999.999.001.551-.448.999-.999.999m-11.046 0c-.551 0-.999-.448-.999-.999s.448-.999.999-.999.999.448.999.999-.448.999-.999.999m11.405-6.02l1.997-3.459a.416.416 0 00-.152-.568.416.416 0 00-.568.152l-2.022 3.503c-1.436-.648-3.133-1.009-4.966-1.009-1.833 0-3.53.361-4.966 1.009l-2.022-3.503a.416.416 0 00-.568-.152.416.416 0 00-.152.568l1.997 3.459C2.689 11.164.344 14.659 0 18.761h24c-.344-4.102-2.689-7.597-6.118-9.44"/></svg>
};

const BASE_DL = '/downloads'; // served from public/downloads/

const OS_DATA = {
  windows: {
    name: 'Windows', icon: <Icons.Windows />, archs: [
      { id: 'x64_exe', label: 'Windows x64 (.exe)', file: 'DopaMind_0.0.9_x64_en-US.msi' },
      { id: 'x64_msi', label: 'Windows x64 (.msi)', file: 'DopaMind_0.0.9_x64_en-US.msi' },
      { id: 'arm64',   label: 'Windows ARM64 (.msi)', file: 'DopaMind_arm64_Setup.msi', comingSoon: true },
    ]
  },
  mac: {
    name: 'macOS', icon: <Icons.Mac />, archs: [
      { id: 'silicon', label: 'Apple Silicon (.dmg)',  file: 'DopaMind_0.1.0_aarch64.dmg' },
      { id: 'intel',   label: 'Intel Mac (.dmg)',      file: 'DopaMind_0.1.0_x64.dmg' },
    ]
  },
  linux: {
    name: 'Linux', icon: <Icons.Linux />, archs: [
      { id: 'appimage', label: 'Linux x64 (.AppImage)', file: 'dopamind_0.1.0_amd64.AppImage' },
      { id: 'deb',      label: 'Debian/Ubuntu (.deb)',  file: 'dopamind_0.1.0_amd64.deb' },
    ]
  },
  ios: {
    name: 'iOS / iPadOS', icon: <Icons.Mac />, archs: [
      { id: 'appstore', label: 'Apple App Store', comingSoon: true }
    ]
  },
  android: {
    name: 'Android', icon: <Icons.Android />, archs: [
      { id: 'playstore', label: 'Google Play Store', comingSoon: true },
      { id: 'apk',       label: 'Direct APK (.apk)', file: 'DopaMind_0.1.0.apk' },
    ]
  }
};

const OsCard = ({ data, recommended, defaultArch }) => {
  const [selectedArch, setSelectedArch] = useState(defaultArch || data.archs[0].id);

  // Sync state if auto-detection finishes after render
  useEffect(() => {
    if (recommended && defaultArch) {
      setSelectedArch(defaultArch);
    }
  }, [recommended, defaultArch]);

  const currentArch = data.archs.find(a => a.id === selectedArch) || data.archs[0];
  
  return (
    <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative', marginTop: recommended ? '15px' : '0' }}>
      {recommended && (
        <div className="tag-badge" style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          Recommended
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', opacity: 0.9 }}>{data.icon}</div>
      <h3>{data.name}</h3>
      
      <div style={{ marginTop: '16px', marginBottom: '24px' }}>
        <select 
          value={selectedArch} 
          onChange={e => setSelectedArch(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', cursor: 'pointer' }}
        >
          {data.archs.map(a => (
            <option key={a.id} value={a.id} style={{ color: '#333' }}>{a.label}</option>
          ))}
        </select>
      </div>

      {currentArch.comingSoon ? (
        <button 
          className="btn-secondary" 
          style={{ display: 'block', width: '100%', cursor: 'not-allowed', opacity: 0.6 }}
          disabled
        >
          Coming Soon
        </button>
      ) : (
        <a 
          href={
            currentArch.link 
              ? currentArch.link 
              : currentArch.local 
                ? `/downloads/${currentArch.file}`
                : `https://github.com/kishankkt/Dopamind/releases/latest/download/${currentArch.file}`
          }
          className={recommended ? 'btn-primary' : 'btn-secondary'} 
          style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}
          target={currentArch.link ? '_blank' : '_self'}
          download={!currentArch.link}
          rel="noreferrer"
        >
          {currentArch.link ? 'Get App' : '⬇ Download'}
        </a>
      )}
    </div>
  );
};

export default function DownloadsPage() {
  const [os, setOs] = useState('unknown');
  const [arch, setArch] = useState('');

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    
    // OS Detection
    if (ua.includes('android')) setOs('android');
    else if (ua.includes('iphone') || ua.includes('ipad')) setOs('ios');
    else if (ua.includes('win')) setOs('windows');
    else if (ua.includes('mac')) setOs('mac');
    else if (ua.includes('linux')) setOs('linux');

    // Arch Detection
    if (ua.includes('wow64') || ua.includes('win64') || ua.includes('x64') || ua.includes('x86_64')) setArch('x64');
    else if (ua.includes('arm64') || ua.includes('aarch64')) setArch('arm64');
    else if (ua.includes('mac')) setArch('universal');
  }, []);

  return (
    <PublicLayout>
      <div className="page-container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Download DopaMind</h1>
        <p style={{ textAlign: 'center', marginBottom: '40px', opacity: 0.8 }}>Available across all your devices.</p>
        
        <div className="downloads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <OsCard data={OS_DATA.windows} recommended={os === 'windows'} defaultArch={arch === 'arm64' ? 'arm64' : 'x64'} />
          <OsCard data={OS_DATA.mac} recommended={os === 'mac'} defaultArch={arch === 'intel' ? 'intel' : 'universal'} />
          <OsCard data={OS_DATA.linux} recommended={os === 'linux'} defaultArch={arch === 'arm64' ? 'arm64' : 'x64'} />
          <OsCard data={OS_DATA.ios} recommended={os === 'ios'} defaultArch="appstore" />
          <OsCard data={OS_DATA.android} recommended={os === 'android'} defaultArch="playstore" />
        </div>
      </div>
    </PublicLayout>
  );
}
