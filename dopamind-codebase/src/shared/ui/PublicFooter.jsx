import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandConfig } from '@/config/brand';

export default function PublicFooter() {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState("privacy");

  return (
    <>
      <footer className="site-footer glass-panel" style={{ padding: '60px 40px', marginTop: '40px' }}>
        <div style={{ width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          
          {/* Brand & Copyright */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-emerald-deep)' }}>{BrandConfig.name}</h3>
            <p style={{ opacity: 0.9, margin: 0, fontSize: '0.9rem', color: 'var(--color-emerald-deep)' }}>Built for positive focus habits.</p>
            <div style={{ marginTop: 'auto', opacity: 0.8, fontSize: '0.85rem', color: 'var(--color-emerald-deep)' }}>
              © 2026 {BrandConfig.name}. All rights reserved.
            </div>
          </div>

          {/* Product */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, opacity: 0.9, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--color-emerald-deep)', fontWeight: '700' }}>Product</h4>
            <Link to="/brain-gym" className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }}>Brain Gym</Link>
            <Link to="/downloads" className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }}>Desktop Apps</Link>
            <Link to="/pricing" className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }}>Pricing</Link>
          </div>

          {/* Resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, opacity: 0.9, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--color-emerald-deep)', fontWeight: '700' }}>Resources</h4>
            <Link to="/vision" className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }}>Vision</Link>
            <Link to="/research" className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }}>Research</Link>
            <Link to="/collaboration" className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }}>Collaboration</Link>
            <Link to="/docs" className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }}>Documentation</Link>
            <Link to="/changelog" className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }}>Changelog</Link>
          </div>

          {/* Legal & Newsletter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, opacity: 0.9, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--color-emerald-deep)', fontWeight: '700' }}>Legal</h4>
            <Link to="/contact" className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }}>Contact Support</Link>
            <button className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }} onClick={() => { setLegalModalTab('privacy'); setLegalModalOpen(true); }}>Privacy Policy</button>
            <button className="legal-link-btn" style={{ textAlign: 'left', padding: 0 }} onClick={() => { setLegalModalTab('terms'); setLegalModalOpen(true); }}>Terms of Service</button>
            
            <div style={{ marginTop: '20px' }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', opacity: 0.8 }}>Join the Waitlist</strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="email" placeholder="Email address" style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', flex: 1, minWidth: '100px' }} />
                <button className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>Join</button>
              </div>
            </div>
          </div>
          
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
