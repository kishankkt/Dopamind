import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandConfig } from '@/config/brand';

export default function PublicFooter() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState("privacy");

  return (
    <>
      <footer className="site-footer">
        <p>© 2026 {BrandConfig.name}. Built for positive focus habits.</p>
        <div className="footer-links">
          <Link to="/vision" className="legal-link-btn">Vision</Link>
          <span className="dot-divider">•</span>
          <Link to="/changelog" className="legal-link-btn">Changelog</Link>
          <span className="dot-divider">•</span>
          <Link to="/docs" className="legal-link-btn">Docs</Link>
          <span className="dot-divider">•</span>
          <Link to="/downloads" className="legal-link-btn">Downloads</Link>
          <span className="dot-divider">•</span>
          <Link to="/contact" className="legal-link-btn">Contact</Link>
          <span className="dot-divider">•</span>
          <button className="legal-link-btn" onClick={() => { setLegalModalTab('privacy'); setLegalModalOpen(true); }}>Privacy</button>
          <span className="dot-divider">•</span>
          <button className="legal-link-btn" onClick={() => { setLegalModalTab('terms'); setLegalModalOpen(true); }}>Terms</button>
        </div>
      </footer>

      {/* ⚖️ Legal Modal Overlay */}
      {legalModalOpen && (
        <div className="legal-modal-overlay" onClick={() => setLegalModalOpen(false)}>
          <div className="legal-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="legal-close-btn" onClick={() => setLegalModalOpen(false)}>×</button>
            <div className="legal-tab-headers">
              <button 
                className={`legal-tab ${legalModalTab === 'privacy' ? 'active' : ''}`} 
                onClick={() => setLegalModalTab('privacy')}
              >
                Privacy Policy
              </button>
              <button 
                className={`legal-tab ${legalModalTab === 'terms' ? 'active' : ''}`} 
                onClick={() => setLegalModalTab('terms')}
              >
                Terms of Service
              </button>
            </div>
            <div className="legal-document-content">
              {legalModalTab === 'privacy' ? (
                <div className="legal-text-panel">
                  <h2>Privacy Policy</h2>
                  <p><strong>Last Updated: July 4, 2026</strong></p>
                  <p>
                    Your privacy is our priority. DopaMind is a zero-bloat cognitive focus gym designed to respect your attention and your data.
                  </p>
                  <h3>1. Information Collection</h3>
                  <p>
                    We collect only the bare minimum credentials (email address) required to create and authenticate your account. We log game statistics (accuracy percentage, attempts, score, and reaction speed metrics) strictly to compute dashboard charts.
                  </p>
                  <h3>2. Trackers & Analytics</h3>
                  <p>
                    DopaMind does NOT use third-party advertising cookie trackers, Google Analytics pixels, or telemetry crawlers. 
                  </p>
                  <h3>3. Data Security</h3>
                  <p>
                    All profile information is stored on encrypted database clusters provided by Supabase. Access is governed strictly via secure PostgreSQL Row Level Security (RLS) rules.
                  </p>
                </div>
              ) : (
                <div className="legal-text-panel">
                  <h2>Terms of Service</h2>
                  <p><strong>Last Updated: July 4, 2026</strong></p>
                  <p>
                    By using the DopaMind platform, you agree to comply with and be bound by the following Terms of Service.
                  </p>
                  <h3>1. Attention Gym Service</h3>
                  <p>
                    DopaMind provides gamified cognitive focus training. Our games are meant as training aids and do not constitute clinical treatments or medical diagnoses for ADHD or processing delays.
                  </p>
                  <h3>2. User Accounts</h3>
                  <p>
                    You are solely responsible for keeping your login credentials confidential. Any activity executed under your profile remains your responsibility.
                  </p>
                  <h3>3. Termination</h3>
                  <p>
                    We reserve the right to restrict or terminate access to accounts attempting to exploit database security or inject malicious SQL commands.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
