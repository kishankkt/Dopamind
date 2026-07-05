// FILE: LandingPage.jsx
// PURPOSE: Marketing landing page — the "/" route for visitors
// EXTRACTS FROM: App.jsx lines ~1048-1180 (the visitor landing return block)
// CONTAINS: Header, Hero section, Games grid, Streak plant, FAQ, Footer
// CTA BUTTON: Must say "Enter Brain Gym" or "Explore Brain Gym" (NOT "Login/Signup")
// DOWNLOAD BUTTONS: Link to GitHub Releases (see App.jsx hero-actions)
// READ: App.jsx current visitor landing section to extract the JSX
// READ: .agents/skills/dopamind/SKILL.md → "Routing Architecture" for CTA rule

import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import InteractiveGame from '@/app/games/core_engine/InteractiveGame';
import { BrandConfig } from '@/config/brand';

const faqs = [
  { question: "Is DopaMind really free?", answer: "Yes. The core games are free, forever. No ads, no paywalls." },
  { question: "How does it help with ADHD?", answer: "Our games practice specific cognitive skills like inhibition (stopping impulses) and working memory, which are often challenging for ADHD brains." },
  { question: "Do I need to download an app?", answer: "No, DopaMind works right in your browser. But you can download the desktop app for a distraction-free experience." },
];

export default function LandingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [authOpen, setAuthOpen] = useState(searchParams.get('auth') === 'true');
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccessMessage, setAuthSuccessMessage] = useState("");

  const [activeFaq, setActiveFaq] = useState(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState("privacy");
  const [toastMessage, setToastMessage] = useState("");

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccessMessage("");
    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        setAuthSuccessMessage("Check your email to verify your account!");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/dashboard' } });
      if (error) throw error;
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const gamesList = [
    { id: 'speedmatch', name: "SpeedMatch", icon: "⚡", focus: "Quick Reflexes", description: "Match the current shape with the previous one. Trains processing speed." },
    { id: 'focusgrid', name: "FocusGrid", icon: "🎯", focus: "Stay Sharp", description: "Find the numbers in sequence. Trains spatial memory." },
    { id: 'countflow', name: "CountFlow", icon: "🔢", focus: "Think & Solve", description: "Keep a running tally. Trains mental agility." },
    { id: 'wordwarp', name: "WordWarp", icon: "🎨", focus: "Word Power", description: "Match colors, not words. Trains cognitive flexibility." },
    { id: 'patternpulse', name: "PatternPulse", icon: "🧩", focus: "Remember & Recall", description: "Remember the sequence. Trains working memory." },
  ];

  return (
    <div className="landing-container">
      {/* 🚀 Header */}
      <header className="site-header glass-panel">
        <div className="logo-area">
          <span className="logo-text" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <img src={BrandConfig.logoUrl} alt="Logo" width="24" height="24" />
            {BrandConfig.name}
          </span>
        </div>
        <nav className="header-nav">
          <a href="#games">Games</a>
          <a href="#streak">Daily Streak</a>
          <a href="#faq">FAQ</a>
          <button className="btn-secondary nav-cta" onClick={() => setAuthOpen(true)}>Log In / Sign Up</button>
        </nav>
      </header>

      {/* ⚡ Hero Section */}
      <section className="hero-section">
        <div className="hero-info">
          <div className="tag-badge">🪴 Positive Dopamine Gym</div>
          <h1>Doomscrolling is shrinking your focus.</h1>
          <p className="hero-lead">
            {BrandConfig.description}
          </p>
          <div className="hero-stats">
            <div className="hero-stat-item">
              <strong>100%</strong>
              <span>Web-Based / Instant</span>
            </div>
            <div className="hero-stat-item">
              <strong>100%</strong>
              <span>Privacy / Ad-Free</span>
            </div>
            <div className="hero-stat-item">
              <strong>0%</strong>
              <span>Chromium Bloat</span>
            </div>
          </div>
          <div className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button className="btn-primary" onClick={() => setAuthOpen(true)}>Sign In to Play</button>
            <button className="btn-secondary" onClick={() => navigate(`/trial/guest-${crypto.randomUUID().split('-')[0]}`)}>
              Play as Guest
            </button>
            <a href="https://github.com/kishankkt/Dopamind/releases/latest/download/DopaMind_0.1.0_x64-setup.exe" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <span>💻</span> Download for Windows
            </a>
            <a href="https://github.com/kishankkt/Dopamind/releases/latest/download/DopaMind_0.1.0_x64.dmg" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', opacity: 0.8 }} title="Compiling in cloud, coming soon!">
              <span>🍏</span> Download for Mac
            </a>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6, cursor: 'not-allowed' }} title="Mobile apps coming soon!">
              <span>📱</span> iOS / Android
            </button>
          </div>
        </div>

        {/* Interactive Game Widget (15s trial) */}
        <div className="hero-widget">
          <InteractiveGame />
        </div>
      </section>

      {/* 🕹️ Games Roadmap Grid */}
      <section id="games" className="games-section">
        <h2 className="section-title">The Cognitive Training Toolkit</h2>
        <p className="section-subtitle">
          Five specialized mini-games designed to stimulate positive focus feedback loops and keep you in a Flow State.
        </p>

        <div className="games-grid">
          {gamesList.map((game) => (
            <div key={game.id} className="glass-card game-card">
              <span className="game-card-icon">{game.icon}</span>
              <h3>{game.name}</h3>
              <span className="game-card-badge">{game.focus}</span>
              <p>{game.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🪴 Streak Plant Section */}
      <section id="streak" className="streak-section glass-panel">
        <div className="streak-content">
          <h2>Grow Your Daily Streak Pixel Plant</h2>
          <p>
            Every day you complete a 45-second focus gym session, you water your digital pixel plant. Watch it grow from a single seed into a full-bloom flower. Protect your streak in the cloud using cloud backups to keep your streak alive.
          </p>
          <ul className="streak-bullets">
            <li>🌱 <strong>Day 1-2:</strong> Seed sprouts into a green leaf.</li>
            <li>🌿 <strong>Day 3-6:</strong> Leaves expand into a robust Sage branch.</li>
            <li>🌸 <strong>Day 30:</strong> Golden petals bloom, rewarding your attention consistency.</li>
          </ul>
        </div>
        <div className="streak-artwork">
          <div className="pixel-pot">
            <div className="pixel-plant-leaves animate-bounce">
              🌱
            </div>
            <div className="pixel-pot-base">🏺</div>
          </div>
        </div>
      </section>

      {/* ❓ FAQ Section */}
      <section id="faq" className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-accordion">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item glass-card ${activeFaq === index ? 'active' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question">
                <span>{faq.question}</span>
                <span className="faq-arrow">{activeFaq === index ? '▲' : '▼'}</span>
              </div>
              {activeFaq === index && (
                <div className="faq-answer animate-pop">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 📇 Footer */}
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

      {/* 🔑 Authentication Modal Overlay */}
      {authOpen && (
        <div className="auth-modal-overlay" onClick={() => setAuthOpen(false)}>
          <div className="auth-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setAuthOpen(false)}>×</button>
            <h2>{authSuccessMessage ? "Account Created" : authMode === "login" ? "Welcome to DopaMind" : "Create Account"}</h2>
            <p className="auth-sub">{authSuccessMessage ? "Verification email dispatched" : "Keep your streak watered in the database"}</p>

            {authSuccessMessage ? (
              <div className="auth-success-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                <span className="success-icon" style={{ fontSize: '3rem' }}>📧</span>
                <p style={{ fontSize: '0.95rem', opacity: '0.8', lineHeight: '1.5', margin: '0' }}>{authSuccessMessage}</p>
                <button className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '600' }} onClick={() => {
                  setAuthSuccessMessage("");
                  setAuthMode("login");
                }}>
                  Go to Sign In
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleAuthSubmit} className="auth-form">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="your@email.com" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />

                  <label>Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                  />

                  {authError && <p className="auth-error-msg">⚠️ {authError}</p>}

                  <button type="submit" className="btn-primary auth-submit-btn" disabled={authLoading}>
                    {authLoading ? "Processing..." : authMode === "login" ? "Sign In" : "Sign Up"}
                  </button>
                </form>

                <div className="auth-divider">
                  <span>OR</span>
                </div>

                <button className="google-auth-btn" onClick={handleGoogleLogin}>
                  <svg viewBox="0 0 48 48" width="20px" height="20px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.422-5.189l-6.196-5.239C29.21,35.154,26.685,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.196,5.239C36.983,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <p className="auth-toggle">
                  {authMode === "login" ? "New to DopaMind?" : "Already have an account?"}
                  <button onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                    {authMode === "login" ? "Create Account" : "Sign In"}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}

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

      {/* 🔔 Toast Notification Banner */}
      {toastMessage && (
        <div className="toast-notification-banner animate-pop">
          🌿 {toastMessage}
        </div>
      )}
    </div>
  );
}
