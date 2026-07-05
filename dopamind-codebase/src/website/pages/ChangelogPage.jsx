// FILE: ChangelogPage.jsx
// PURPOSE: Version history page — the /changelog route
// CONTENT SOURCE: Renders markdown files from content/changelog/*.md
// FEATURES:
//   - Reverse chronological list of versions (v0.1.0, v0.2.0, etc.)
//   - Each version entry rendered from its .md file
//   - Shows date, version badge, and full release notes
// READ: content/changelog/ directory for version .md files

import React, { useEffect, useState } from 'react';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer';

export default function ChangelogPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function loadLogs() {
      // Vite glob import for raw markdown content
      const markdownFiles = import.meta.glob('../../../content/changelog/*.md', { query: '?raw', import: 'default' });
      const loadedLogs = [];
      
      for (const path in markdownFiles) {
        const content = await markdownFiles[path]();
        const dateMatch = content.match(/date:\s*(.*)/);
        const date = dateMatch ? dateMatch[1] : '';
        const versionMatch = content.match(/version:\s*(.*)/);
        const version = versionMatch ? versionMatch[1] : '';
        
        // Strip frontmatter for rendering
        const contentWithoutFrontmatter = content.replace(/---[\s\S]*?---/, '');
        loadedLogs.push({ path, version, date, content: contentWithoutFrontmatter });
      }
      
      loadedLogs.sort((a, b) => b.version.localeCompare(a.version));
      setLogs(loadedLogs);
    }
    loadLogs();
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '40px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Changelog</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {logs.map((log, i) => (
          <div key={i} className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>v{log.version}</h2>
              <span className="tag-badge" style={{ margin: 0 }}>{log.date}</span>
            </div>
            <MarkdownRenderer content={log.content} />
          </div>
        ))}
        {logs.length === 0 && <p style={{ textAlign: 'center' }}>No changelogs found.</p>}
      </div>
    </div>
  );
}
