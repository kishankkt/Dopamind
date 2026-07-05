// FILE: VisionPage.jsx
// PURPOSE: "Why We Exist" page — the /vision route
// CONTENT SOURCE: Renders content/pages/vision.md via react-markdown
// NARRATIVE: Present the PROBLEM first (scrolling addiction, AI-era memory loss,
//   brain losing track) then position DopaMind as the SOLUTION.
// TONE: Emotional, human, non-technical. Generic words, not jargon.
// READ: .agents/skills/dopamind/SKILL.md → "Vision & Brand Narrative" section
// READ: content/pages/vision.md for the markdown source content

import React from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { BrandConfig } from '../config/brand';

// Vite allows importing raw text from files
import visionContent from '../../../content/pages/vision.md?raw';

export default function VisionPage() {
  return (
    <div className="page-container glass-panel" style={{ maxWidth: '800px', margin: '40px auto', padding: '40px' }}>
      <MarkdownRenderer content={visionContent} />
    </div>
  );
}
