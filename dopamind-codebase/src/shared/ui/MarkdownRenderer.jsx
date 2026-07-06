// FILE: MarkdownRenderer.jsx  
// PURPOSE: Shared component to render any .md file with our design system
// USED BY: VisionPage, BlogPage, ChangelogPage, DocsPage, ContactPage
// INSTALL: npm install react-markdown remark-gfm
// PROPS: { content: string } — raw markdown string
// BEHAVIOR: Renders markdown with remark-gfm plugin (tables, strikethrough, etc.)
//   Applies our CSS classes for consistent typography (uses App.css variables)

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content }) {
  // Strip YAML frontmatter before rendering
  const processedContent = content?.replace(/^---[\s\S]*?---\n/, '') || '';

  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
