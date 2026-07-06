// FILE: LandingPage.jsx
// PURPOSE: Marketing landing page — the "/" route for visitors
// EXTRACTS FROM: App.jsx lines ~1048-1180 (the visitor landing return block)
// CONTAINS: Header, Hero section, Games grid, Streak plant, FAQ, Footer
// CTA BUTTON: Must say "Enter Brain Gym" or "Explore Brain Gym" (NOT "Login/Signup")
// DOWNLOAD BUTTONS: Link to GitHub Releases (see App.jsx hero-actions)
// READ: App.jsx current visitor landing section to extract the JSX
// READ: .agents/skills/dopamind/SKILL.md → "Routing Architecture" for CTA rule

import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import InteractiveGame from '@/app/games/core_engine/InteractiveGame';
import { BrandConfig } from '@/config/brand';
import PublicLayout from '@/shared/ui/PublicLayout';

const Icons = {
  Zap: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Target: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>,
  Hash: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>,
  Palette: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>,
  Puzzle: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.611c-.94.94-2.469.94-3.408 0L8.73 19.73a1.2 1.2 0 0 1-.289-.877l.524-3.473a2.369 2.369 0 0 0-1.224-2.493L4.256 11.23a1.59 1.59 0 0 1 0-2.833l3.484-1.657a2.369 2.369 0 0 0 1.224-2.493l-.524-3.473a1.2 1.2 0 0 1 .289-.877l1.568-1.568c.94-.94 2.468-.94 3.408 0l1.611 1.611c.229.23.555.338.877.289l3.473-.524a1.59 1.59 0 0 1 1.833 1.833l-.524 3.473Z"></path></svg>
};

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

  const [authFullName, setAuthFullName] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null); // 'available' | 'taken' | 'checking' | 'invalid'

  const [activeFaq, setActiveFaq] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Check username availability
  useEffect(() => {
    if (authMode !== 'signup' || !authUsername) {
      setUsernameStatus(null);
      return;
    }
    
    const checkUsername = async () => {
      setUsernameStatus('checking');
      if (!/^[a-zA-Z0-9_]+$/.test(authUsername)) {
        setUsernameStatus('invalid');
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', authUsername)
        .single();
        
      if (error && error.code === 'PGRST116') {
        // No row found
        setUsernameStatus('available');
      } else if (data) {
        setUsernameStatus('taken');
      }
    };

    const delayDebounceFn = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [authUsername, authMode]);

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
        if (usernameStatus !== 'available') {
          throw new Error("Please choose a valid and available username.");
        }
        const { data, error } = await supabase.auth.signUp({ 
          email: authEmail, 
          password: authPassword,
          options: {
            data: {
              full_name: authFullName,
              username: authUsername
            }
          }
        });
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
    { id: 'speedmatch', name: "SpeedMatch", icon: <Icons.Zap />, focus: "Quick Reflexes", description: "Match the current shape with the previous one. Trains processing speed." },
    { id: 'focusgrid', name: "FocusGrid", icon: <Icons.Target />, focus: "Stay Sharp", description: "Find the numbers in sequence. Trains spatial memory." },
    { id: 'countflow', name: "CountFlow", icon: <Icons.Hash />, focus: "Think & Solve", description: "Keep a running tally. Trains mental agility." },
    { id: 'wordwarp', name: "WordWarp", icon: <Icons.Palette />, focus: "Word Power", description: "Match colors, not words. Trains cognitive flexibility." },
    { id: 'patternpulse', name: "PatternPulse", icon: <Icons.Puzzle />, focus: "Remember & Recall", description: "Remember the sequence. Trains working memory." },
  ];

  return (
    <PublicLayout onAuthClick={() => setAuthOpen(true)}>

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
            <Link to="/downloads" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Download Desktop App</span>
            </Link>
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
                  {authMode === "signup" && (
                    <>
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="John Doe" 
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                      />
                      
                      <label>
                        Username 
                        {usernameStatus === 'available' && <span style={{color: 'var(--color-emerald-base)', fontSize: '0.8rem', marginLeft: '8px'}}>Available ✅</span>}
                        {usernameStatus === 'taken' && <span style={{color: 'red', fontSize: '0.8rem', marginLeft: '8px'}}>Taken ❌</span>}
                        {usernameStatus === 'checking' && <span style={{color: 'gray', fontSize: '0.8rem', marginLeft: '8px'}}>Checking...</span>}
                        {usernameStatus === 'invalid' && <span style={{color: 'red', fontSize: '0.8rem', marginLeft: '8px'}}>Letters/numbers/_ only</span>}
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="johndoe123" 
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value.toLowerCase())}
                        style={{ borderColor: usernameStatus === 'taken' ? 'red' : usernameStatus === 'available' ? 'var(--color-emerald-base)' : 'inherit' }}
                      />
                    </>
                  )}

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

                  <button 
                    type="submit" 
                    className="btn-primary auth-submit-btn" 
                    disabled={authLoading || (authMode === 'signup' && usernameStatus !== 'available')}
                  >
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

      {/* 🔔 Toast Notification Banner */}
      {toastMessage && (
        <div className="toast-notification-banner animate-pop">
          🌿 {toastMessage}
        </div>
      )}
    </PublicLayout>
  );
}
