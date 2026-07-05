// FILE: BlogPage.jsx
// PURPOSE: Blog listing + individual post viewer — the /blog route
// CONTENT SOURCE: Renders markdown files from content/blog/*.md
// FEATURES:
//   - List view: shows all posts with title, date, summary from frontmatter
//   - Detail view: /blog/:slug renders full markdown post via react-markdown
//   - Use frontmatter (title, date, author, tags, summary) for metadata
// READ: content/blog/ directory for markdown posts
// READ: .agents/skills/dopamind/SKILL.md → "Markdown-First Content Architecture"

import React, { useEffect, useState } from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    async function loadPosts() {
      // Vite glob import for raw markdown content
      const markdownFiles = import.meta.glob('../../../content/blog/*.md', { query: '?raw', import: 'default' });
      const loadedPosts = [];
      
      for (const path in markdownFiles) {
        const content = await markdownFiles[path]();
        // Extract basic title from frontmatter or first header for list view
        const titleMatch = content.match(/title:\s*"(.*?)"/) || content.match(/# (.*)/);
        const title = titleMatch ? titleMatch[1] : path.split('/').pop().replace('.md', '');
        const dateMatch = content.match(/date:\s*(.*)/);
        const date = dateMatch ? dateMatch[1] : '';
        const summaryMatch = content.match(/summary:\s*"(.*?)"/);
        const summary = summaryMatch ? summaryMatch[1] : '';
        
        loadedPosts.push({ path, title, date, summary, content });
      }
      
      loadedPosts.sort((a, b) => b.date.localeCompare(a.date));
      setPosts(loadedPosts);
    }
    loadPosts();
  }, []);

  if (selectedPost) {
    return (
      <div className="page-container glass-panel" style={{ maxWidth: '800px', margin: '40px auto', padding: '40px' }}>
        <button className="btn-secondary" onClick={() => setSelectedPost(null)} style={{ marginBottom: '20px' }}>← Back to Blog</button>
        <MarkdownRenderer content={selectedPost.content} />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '40px auto', padding: '40px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>DopaMind Blog</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.map((post, i) => (
          <div key={i} className="glass-card" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => setSelectedPost(post)}>
            <h2>{post.title}</h2>
            <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '12px' }}>{post.date}</p>
            <p>{post.summary}</p>
          </div>
        ))}
        {posts.length === 0 && <p style={{ textAlign: 'center' }}>No posts found.</p>}
      </div>
    </div>
  );
}
