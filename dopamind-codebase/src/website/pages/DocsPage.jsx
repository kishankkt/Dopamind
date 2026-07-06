// FILE: DocsPage.jsx
// PURPOSE: Developer documentation — the /docs route
// CONTENT SOURCE: Renders markdown files from content/docs/*.md
// FEATURES:
//   - Sidebar navigation of all doc pages
//   - Main content renders selected .md file via react-markdown
//   - Key docs: getting-started.md, game-sdk.md (how to publish new games)
// READ: content/docs/ directory for doc .md files
// READ: .agents/skills/dopamind/SKILL.md → "Game API Contract" for SDK docs

import React, { useEffect, useState } from 'react';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer';
import PublicLayout from '@/shared/ui/PublicLayout';

export default function DocsPage() {
  const [docs, setDocs] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);

  useEffect(() => {
    async function loadDocs() {
      // Vite glob import for raw markdown content
      const markdownFiles = import.meta.glob('../../../content/docs/*.md', { query: '?raw', import: 'default' });
      const loadedDocs = [];
      
      for (const path in markdownFiles) {
        const content = await markdownFiles[path]();
        const titleMatch = content.match(/title:\s*"(.*?)"/) || content.match(/# (.*)/);
        const title = titleMatch ? titleMatch[1] : path.split('/').pop().replace('.md', '');
        
        // Strip frontmatter for rendering
        const contentWithoutFrontmatter = content.replace(/---[\s\S]*?---/, '');
        loadedDocs.push({ path, title, content: contentWithoutFrontmatter });
      }
      
      loadedDocs.sort((a, b) => a.title.localeCompare(b.title));
      setDocs(loadedDocs);
      if (loadedDocs.length > 0) setActiveDoc(loadedDocs[0]);
    }
    loadDocs();
  }, []);

  return (
    <PublicLayout>
      <div className="page-container" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', display: 'flex', gap: '40px' }}>
        {/* Sidebar Navigation */}
      <aside style={{ width: '250px', flexShrink: 0 }}>
        <h2 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Documentation</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {docs.map((doc, i) => (
            <button 
              key={i} 
              onClick={() => setActiveDoc(doc)}
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                background: activeDoc?.path === doc.path ? 'var(--brand-surface)' : 'transparent',
                border: '1px solid',
                borderColor: activeDoc?.path === doc.path ? 'var(--brand-primary)' : 'transparent',
                borderRadius: '8px',
                color: activeDoc?.path === doc.path ? 'var(--brand-primary)' : 'inherit',
                fontWeight: activeDoc?.path === doc.path ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {doc.title}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="glass-panel" style={{ flexGrow: 1, padding: '40px', minHeight: '600px' }}>
        {activeDoc ? (
          <MarkdownRenderer content={activeDoc.content} />
        ) : (
          <p>Loading documentation...</p>
        )}
        </main>
      </div>
    </PublicLayout>
  );
}
