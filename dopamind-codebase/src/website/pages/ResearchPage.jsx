// FILE: ResearchPage.jsx
// PURPOSE: "Research" page — the /research route
// CONTENT SOURCE: Renders content/pages/research.md via react-markdown

import React from 'react';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer';
import PublicLayout from '@/shared/ui/PublicLayout';

// Vite allows importing raw text from files
import researchContent from '../../../content/pages/research.md?raw';

export default function ResearchPage() {
  return (
    <PublicLayout>
      <div className="page-container glass-panel" style={{ maxWidth: '800px', margin: '40px auto', padding: '40px' }}>
        <MarkdownRenderer content={researchContent} />
      </div>
    </PublicLayout>
  );
}
