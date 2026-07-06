// FILE: DownloadsPage.jsx
// PURPOSE: Dedicated download page — the /downloads route
// FEATURES:
//   - Auto-detect user's OS (navigator.userAgent) and highlight recommended download
//   - Grid of ALL platforms: Windows x64, Windows ARM, macOS Universal, Linux, Android, iOS
//   - Each card shows: icon, platform name, architecture, file size, download button
//   - Download links point to GitHub Releases: https://github.com/kishankkt/Dopamind/releases/latest/download/FILENAME
//   - Show version number and SHA256 checksums
//   - "Coming Soon" badge for platforms not yet compiled
// READ: .agents/skills/dopamind/SKILL.md → "Multi-Platform Distribution Strategy" section

import React, { useEffect, useState } from 'react';
import PublicLayout from '@/shared/ui/PublicLayout';

const Icons = {
  Windows: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.557l7.357-1.015v7.098H3V5.557zM3 12.383h7.357v7.098L3 18.466v-6.083zM11.143 4.31l9.857-1.36v8.69h-9.857V4.31zM11.143 12.383h9.857v8.69l-9.857-1.36v-7.33z"/></svg>,
  Mac: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M16.36 10.37c-.01-3.3 2.7-4.88 2.82-4.96-1.54-2.25-3.92-2.55-4.78-2.6-2.02-.2-3.95 1.19-4.97 1.19-1.02 0-2.61-1.15-4.27-1.12-2.15.03-4.14 1.25-5.26 3.19-2.27 3.93-.58 9.74 1.63 12.93 1.08 1.56 2.34 3.32 4.02 3.25 1.62-.07 2.25-1.05 4.22-1.05 1.95 0 2.54 1.05 4.22 1.02 1.74-.03 2.85-1.63 3.92-3.19 1.24-1.81 1.75-3.57 1.77-3.66-.04-.01-3.41-1.31-3.42-5.01zm-3.12-6.52c.89-1.07 1.49-2.57 1.33-4.06-1.28.05-2.85.85-3.76 1.92-.81.95-1.5 2.49-1.31 3.95 1.43.11 2.85-.75 3.74-1.81z"/></svg>,
  Linux: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
};

export default function DownloadsPage() {
  const [os, setOs] = useState('unknown');

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) setOs('windows');
    else if (userAgent.includes('mac')) setOs('mac');
    else if (userAgent.includes('linux')) setOs('linux');
    else if (userAgent.includes('android')) setOs('android');
    else if (userAgent.includes('iphone') || userAgent.includes('ipad')) setOs('ios');
  }, []);

  const downloads = [
    { platform: 'Windows', arch: 'x64', file: 'DopaMind_0.1.0_x64-setup.exe', icon: <Icons.Windows />, recommended: os === 'windows' },
    { platform: 'macOS', arch: 'Universal', file: 'DopaMind_0.1.0_x64.dmg', icon: <Icons.Mac />, recommended: os === 'mac' },
    { platform: 'Linux', arch: 'AppImage', file: 'DopaMind_0.1.0_amd64.AppImage', icon: <Icons.Linux />, recommended: os === 'linux' },
  ];

  return (
    <PublicLayout>
      <div className="page-container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Download DopaMind</h1>
        <p style={{ textAlign: 'center', marginBottom: '40px', opacity: 0.8 }}>Get the distraction-free desktop experience.</p>
        
        <div className="downloads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {downloads.map((d, i) => (
            <div key={i} className="glass-card" style={{ padding: '32px 24px', textAlign: 'center', position: 'relative', marginTop: d.recommended ? '10px' : '0' }}>
              {d.recommended && (
                <div className="tag-badge" style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                  Recommended
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', opacity: 0.9 }}>{d.icon}</div>
              <h3>{d.platform}</h3>
              <p style={{ opacity: 0.7, marginBottom: '24px' }}>{d.arch}</p>
              <a 
                href={`https://github.com/kishankkt/Dopamind/releases/latest/download/${d.file}`} 
                className={d.recommended ? 'btn-primary' : 'btn-secondary'} 
                style={{ display: 'block', textDecoration: 'none' }}
              >
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
