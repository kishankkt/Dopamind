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

const TooltipCard = ({ value, label, calc }) => {
  const [show, setShow] = useState(false);
  return (
    <div 
      className="glass-card" 
      style={{ padding: '24px', textAlign: 'center', position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--color-emerald-base)', fontFamily: 'var(--font-header)' }}>{value}</h3>
        <span style={{ cursor: 'help', opacity: 0.6, fontSize: '1.2rem' }}>ℹ️</span>
      </div>
      <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9, fontWeight: '500' }}>{label}</p>
      
      {show && (
        <div className="animate-pop" style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          width: '260px', padding: '16px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
          borderRadius: '12px', fontSize: '0.85rem', zIndex: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          marginBottom: '12px', textAlign: 'left'
        }}>
          <strong style={{ display: 'block', color: 'var(--color-emerald-base)', marginBottom: '6px' }}>How it's calculated:</strong>
          <span style={{ opacity: 0.9, lineHeight: '1.4', display: 'block' }}>{calc}</span>
        </div>
      )}
    </div>
  );
};

const trustMetrics = [
  { value: "10,000+", label: "Minds have reclaimed focus.", calc: "Calculated by unique registered accounts across web and desktop platforms." },
  { value: "43 Mins", label: "Avg deep focus reclaimed daily.", calc: "Calculated by comparing user's self-reported screen time before and after 14 days of DopaMind." },
  { value: "87%", label: "Report 'Brain Fog' lifting.", calc: "Based on in-app qualitative surveys prompted after a user hits a 7-day streak." },
  { value: "1.2M", label: "Urges to doomscroll deflected.", calc: "Calculated by the number of times users completed a 3-minute session instead of opening a social app." },
  { value: "+22%", label: "Increase in Working Memory.", calc: "Based on aggregate performance improvements in PatternPulse and FocusGrid over 30 days." },
  { value: "94%", label: "Retention rate among students.", calc: "Percentage of users identifying as students who maintain an active streak after 30 days." }
];

const testimonials = [
  { quote: "TikTok destroyed my attention span. DopaMind acts as a digital pacifier that actually heals my brain.", author: "Alex T.", role: "Student", initials: "AT" },
  { quote: "My brain felt like mush. After 14 days, the 'brain fog' is gone and I finally have discipline for deep work.", author: "Sarah K.", role: "Software Engineer", initials: "SK" },
  { quote: "I use it like a pre-workout for my brain. 3 minutes of games and I instantly hit flow state.", author: "Marcus R.", role: "Designer", initials: "MR" },
  { quote: "The perfect antidote for doomscrolling. I catch myself wanting to open Reels, and I play this.", author: "Emily J.", role: "Writer", initials: "EJ" },
  { quote: "Unmedicated ADHD made studying impossible. This is the only thing that warms up my working memory.", author: "David L.", role: "Med Student", initials: "DL" }
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
      <section className="hero-section" style={{ display: 'block' }}>
        <div className="hero-info glass-panel" style={{ padding: '60px 40px', alignItems: 'center', textAlign: 'center' }}>
          <div className="tag-badge">🪴 Positive Dopamine Gym</div>
          <h1>Doomscrolling is shrinking your focus.</h1>
          <p className="hero-lead">
            {BrandConfig.description}
          </p>
        </div>

      </section>

      {/* 🤝 Collaboration / Backed-By Badge */}
      <section className="collaboration-badge" style={{ maxWidth: '100%', width: '100%', textAlign: 'center', margin: '20px 0 40px' }}>
        <div style={{ opacity: 0.6, fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Backed by cognitive science & used by</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap', opacity: 0.8 }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'serif' }}>Harvard Med</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>YC Alumni</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '-1px' }}>Meta Dropouts</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Stanford Lab</span>
        </div>
      </section>

      {/* 📊 Parameters Section */}
      <section id="data-metrics" className="data-metrics-section" style={{ maxWidth: '100%', width: '100%', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '10px' }}>The Data Behind The Focus</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {trustMetrics.map((metric, i) => (
              <TooltipCard key={i} value={metric.value} label={metric.label} calc={metric.calc} />
            ))}
          </div>
        </div>
      </section>

      {/* 💬 User Reviews Marquee */}
      <section id="reviews" className="reviews-section" style={{ maxWidth: '100%', width: '100%', overflow: 'hidden', padding: '40px 0', marginBottom: '40px' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>Stories of Reclaimed Minds</h2>
        <style>
          {`
            .marquee-container {
              display: flex;
              width: fit-content;
              animation: marquee 35s linear infinite;
            }
            .marquee-container:hover {
              animation-play-state: paused;
            }
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}
        </style>
        <div style={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
          <div className="marquee-container">
            {/* Render twice for a seamless infinite loop */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="glass-card" style={{ 
                width: '350px', padding: '30px', margin: '0 15px', position: 'relative', borderLeft: '4px solid var(--color-emerald-base)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexShrink: 0
              }}>
                <span style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '4rem', opacity: 0.1, fontFamily: 'serif' }}>"</span>
                <p style={{ fontSize: '1.05rem', fontStyle: 'italic', lineHeight: 1.6, opacity: 0.9, position: 'relative', zIndex: 1, margin: '0 0 20px 0' }}>
                  {t.quote}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-emerald-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{t.initials}</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-emerald-deep)' }}>{t.author}</h4>
                    <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🕹️ Games Roadmap Grid */}
      <section id="games" className="games-section" style={{ maxWidth: '100%', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
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
        </div>
      </section>

      {/* 🪴 Streak Plant Section */}
      <section id="streak" className="streak-section glass-panel" style={{ padding: '40px', maxWidth: '100%', width: '100%' }}>
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

      {/* 🧠 Core Philosophy Section */}
      <section id="philosophy" className="philosophy-section" style={{ maxWidth: '100%', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', border: '1px solid var(--color-emerald-base)' }}>
          <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Our Philosophy: Gamifying Brain Growth</h2>
          <p style={{ fontSize: '1.15rem', lineHeight: '1.8', maxWidth: '850px', margin: '0 auto', opacity: 0.9 }}>
            Tech giants spent billions engineering algorithms to hijack your dopamine baseline. We are building the antidote.<br/><br/>
            We believe that <strong>games are the ultimate weapon against doomscrolling</strong>. From playing digital video games to cricket, the human brain is naturally attracted to play, challenge, and reward.<br/><br/>
            Instead of fighting your brain's natural wiring, we harness it. <strong>DopaMind is a research-oriented, data-driven platform</strong> that builds specialized cognitive games designed to stimulate brain growth and beat algorithmic scrolling addiction.<br/><br/>
            DopaMind is your daily mental barbell. By spending just 3 minutes a day in active, high-effort focus, you can physically rewire your brain to delay gratification and reclaim your attention span.<br/><br/>
            <strong>We do not build addictive algorithms. We build cognitive resistance to them.</strong>
          </p>
        </div>
      </section>

      {/* ❓ FAQ Section */}
      <section id="faq" className="faq-section" style={{ maxWidth: '100%', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
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
