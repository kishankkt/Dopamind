// FILE: CollaborationPage.jsx
// PURPOSE: "Collaboration" page — the /collaboration route
// CONTENT SOURCE: Renders content/pages/collaboration.md via react-markdown

import React from 'react';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer';
import PublicLayout from '@/shared/ui/PublicLayout';

// Vite allows importing raw text from files
import collaborationContent from '../../../content/pages/collaboration.md?raw';

export default function CollaborationPage() {
  return (
    <PublicLayout>
      <div className="page-container glass-panel" style={{ maxWidth: '800px', margin: '40px auto', padding: '40px' }}>
        <MarkdownRenderer content={collaborationContent} />
      </div>
    </PublicLayout>
  );
}
