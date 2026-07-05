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
    { platform: 'Windows', arch: 'x64', file: 'DopaMind_0.1.0_x64-setup.exe', icon: '💻', recommended: os === 'windows' },
    { platform: 'macOS', arch: 'Universal', file: 'DopaMind_0.1.0_x64.dmg', icon: '🍏', recommended: os === 'mac' },
    { platform: 'Linux', arch: 'AppImage', file: 'DopaMind_0.1.0_amd64.AppImage', icon: '🐧', recommended: os === 'linux' },
  ];

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '40px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Download DopaMind</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', opacity: 0.8 }}>Get the distraction-free desktop experience.</p>
      
      <div className="downloads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {downloads.map((d, i) => (
          <div key={i} className="glass-card" style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
            {d.recommended && <div className="tag-badge" style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)' }}>Recommended</div>}
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{d.icon}</div>
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
  );
}
