import React from 'react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

export default function PublicLayout({ children, onAuthClick }) {
  return (
    <div className="landing-container">
      <PublicHeader onAuthClick={onAuthClick} />
      
      <main className="public-main-content">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
