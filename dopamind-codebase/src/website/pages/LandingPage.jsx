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

const Brain3DSequence = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 12);
    }, 120); // About 1.4s per rotation
    return () => clearInterval(interval);
  }, []);

  const paddedFrame = String(frame).padStart(2, '0');

  return (
    <img
      src={`/3d_branding/frame_${paddedFrame}.svg`}
      alt="DopaMind 3D Logo"
      style={{ width: '220px', height: '220px', filter: 'drop-shadow(0 15px 15px rgba(40,77,54,0.1))' }}
    />
  );
};

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

const MetricCard = ({ value, label, onClick }) => {
  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{ padding: '24px', textAlign: 'center', position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--color-emerald-base)', fontFamily: 'var(--font-header)' }}>{value}</h3>
      </div>
      <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9, fontWeight: '500' }}>{label}</p>
    </div>
  );
};

const trustMetrics = [
  {
    value: "10,000+", label: "Minds have reclaimed focus.",
    calc: "Calculated by unique registered accounts across web and desktop platforms.",
    data: [{ time: 'Jan', val: 500 }, { time: 'Feb', val: 1200 }, { time: 'Mar', val: 3500 }, { time: 'Apr', val: 6800 }, { time: 'May', val: 10500 }],
    unit: ' users'
  },
  {
    value: "43 Mins", label: "Avg deep focus reclaimed daily.",
    calc: "Calculated by comparing user's self-reported screen time before and after 14 days of DopaMind.",
    data: [{ time: 'Day 1', val: 12 }, { time: 'Day 5', val: 24 }, { time: 'Day 10', val: 31 }, { time: 'Day 14', val: 43 }],
    unit: 'm'
  },
  {
    value: "87%", label: "Report 'Brain Fog' lifting.",
    calc: "Based on in-app qualitative surveys prompted after a user hits a 7-day streak.",
    data: [{ time: 'Day 1', val: 15 }, { time: 'Day 3', val: 40 }, { time: 'Day 5', val: 65 }, { time: 'Day 7', val: 87 }],
    unit: '%'
  },
  {
    value: "1.2M", label: "Urges to doomscroll deflected.",
    calc: "Calculated by the number of times users completed a 3-minute session instead of opening a social app.",
    data: [{ time: 'Q1', val: 0.1 }, { time: 'Q2', val: 0.4 }, { time: 'Q3', val: 0.7 }, { time: 'Q4', val: 1.2 }],
    unit: 'M'
  },
  {
    value: "+22%", label: "Increase in Working Memory.",
    calc: "Based on aggregate performance improvements in PatternPulse and FocusGrid over 30 days.",
    data: [{ time: 'Wk 1', val: 2 }, { time: 'Wk 2', val: 8 }, { time: 'Wk 3', val: 15 }, { time: 'Wk 4', val: 22 }],
    unit: '%'
  },
  {
    value: "94%", label: "Retention rate among students.",
    calc: "Percentage of users identifying as students who maintain an active streak after 30 days.",
    data: [{ time: 'Week 1', val: 100 }, { time: 'Week 2', val: 98 }, { time: 'Week 3', val: 95 }, { time: 'Week 4', val: 94 }],
    unit: '%'
  }
];

const MiniChart = ({ data, unit }) => {
  const max = Math.max(...data.map(d => d.val));
  const paddedMax = max * 1.1;
  const min = 0;
  const range = paddedMax - min;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ width: '100%', height: '180px', position: 'relative', marginTop: '40px', paddingBottom: '30px', paddingLeft: '50px' }}>

      {/* Y Axis Labels */}
      <div style={{ position: 'absolute', top: 0, left: 0, height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.7, paddingRight: '10px', alignItems: 'flex-end', width: '50px', transform: 'translateY(-6px)' }}>
        <span>{max}{unit}</span>
        <span>{Math.round(max / 2)}{unit}</span>
        <span>0{unit}</span>
      </div>

      {/* Graph Area */}
      <div style={{ width: '100%', height: '150px', position: 'relative', borderBottom: '2px solid var(--border)', borderLeft: '2px solid var(--border)' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <polyline points={points} fill="none" stroke="var(--color-emerald-base)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.val - min) / range) * 100;
            return (
              <circle key={i} cx={x} cy={y} r="5" fill="var(--color-accent-gold)" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            );
          })}
        </svg>

        {/* X Axis Labels */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          return (
            <div key={i} style={{ position: 'absolute', bottom: '-25px', left: `${x}%`, transform: 'translateX(-50%)', fontSize: '0.75rem', opacity: 0.7, whiteSpace: 'nowrap' }}>
              {d.time}
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  const [activeMetric, setActiveMetric] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeGame, setActiveGame] = useState(0);

  // Auto-loop testimonials every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto-loop games every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveGame((prev) => (prev + 1) % gamesList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
      <section className="hero-section" style={{ display: 'block', marginBottom: '40px' }}>
        <div className="hero-info glass-panel" style={{ padding: '80px 40px', alignItems: 'center', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <div className="tag-badge" style={{ marginBottom: '24px', fontWeight: 'bold' }}>🧠 The Brain Growth Platform</div>
          
          <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', margin: '0 auto 24px auto', maxWidth: '750px', color: 'var(--color-emerald-deep)' }}>
            Your Brain Dictates Your Reality.
          </h1>
          
          <p className="hero-lead" style={{ fontSize: '1.25rem', maxWidth: '750px', margin: '0 auto 30px auto', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            <strong>Let's be extremely clear about what we do.</strong> DopaMind is a mental fitness platform designed to undo the damage of endless scrolling and rebuild your natural attention span.
          </p>
          
          <div style={{ background: 'var(--color-oat)', padding: '32px', borderRadius: '16px', maxWidth: '750px', margin: '0 auto 40px auto', border: '1px solid var(--border-light)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <span style={{ fontSize: '1.6rem', marginTop: '2px' }}>🧠</span>
              <div>
                <strong style={{ display: 'block', color: 'var(--color-emerald-deep)', fontSize: '1.15rem', marginBottom: '4px' }}>The Hard Truth</strong>
                <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '1rem' }}>Nothing in this world will fix your attention span by default. Your brain dictates your life growth.</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <span style={{ fontSize: '1.6rem', marginTop: '2px' }}>🛑</span>
              <div>
                <strong style={{ display: 'block', color: 'var(--color-emerald-deep)', fontSize: '1.15rem', marginBottom: '4px' }}>Your Commitment</strong>
                <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '1rem' }}>If you are not committed, do not sign up. DopaMind is exclusively for those ready to take action.</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <span style={{ fontSize: '1.6rem', marginTop: '2px' }}>🌱</span>
              <div>
                <strong style={{ display: 'block', color: 'var(--color-emerald-deep)', fontSize: '1.15rem', marginBottom: '4px' }}>The Promise</strong>
                <span style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '1rem' }}>If you put in a small, active effort every day, DopaMind will rewire your focus and elevate your entire life.</span>
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={() => window.location.href = '/?auth=true'} style={{ fontSize: '1.2rem', padding: '18px 48px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>
            I Am Committed ↗
          </button>
        </div>
      </section>

      {/* 🧠 Problem & Solution Section */}
      <section id="the-solution" className="glass-panel" style={{ padding: '80px 60px', maxWidth: '100%', width: '100%', marginBottom: '40px', display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 500px' }}>
          <h2 style={{ fontSize: '2.2rem', marginTop: 0, marginBottom: '16px', lineHeight: 1.2, color: 'var(--color-error-coral)' }}>The Enemy: Infinite Scrolling</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '32px' }}>
            Tech giants engineered feeds like Shorts and Reels to systematically exploit your dopamine baseline. It's not a lack of willpower; it's algorithmic hijacking.
          </p>
          <h2 style={{ fontSize: '2.2rem', marginTop: 0, marginBottom: '16px', lineHeight: 1.2, color: 'var(--color-emerald-base)' }}>The Antidote: Active Play</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px' }}>
            We engineered games to restore it. Instead of fighting your brain's natural wiring for reward, we harness it. Outcompete cheap dopamine with deep, rewarding focus.
          </p>
          <button className="btn-primary" onClick={() => navigate('/guest/trial/braingym')} style={{ fontSize: '1.2rem', padding: '16px 36px' }}>
            Try it Now <span style={{ marginLeft: '8px' }}>↗</span>
          </button>
        </div>

        <div style={{ flex: '1 1 350px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%', maxWidth: '420px', padding: '60px 20px',
            background: 'linear-gradient(135deg, var(--color-sage-light), var(--color-oat))',
            borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 60px rgba(40, 77, 54, 0.05)', border: '1px solid var(--border-light)',
            flexDirection: 'column', gap: '30px'
          }}>
            <Brain3DSequence />
            <div style={{ textAlign: 'center', zIndex: 1, marginTop: '10px' }}>
              <h3 style={{ fontSize: '2.2rem', color: 'var(--color-emerald-deep)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>DopaMind</h3>
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-emerald-base)' }}>Reclaim Your Focus</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 🕹️ Games Roadmap Grid */}
      <section id="games" className="games-section" style={{ maxWidth: '100%', width: '100%', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-title">Your Daily Mental Workout</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', maxWidth: '700px', marginBottom: '40px' }}>
            Five highly-calibrated mini-games designed to rebuild spatial memory, reaction time, and raw focus. Hit flow state on command.
          </p>

          <div style={{ position: 'relative', width: '100%', maxWidth: '900px', minHeight: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {gamesList.map((game, i) => (
              <div
                key={game.id}
                style={{
                  position: i === activeGame ? 'relative' : 'absolute',
                  opacity: i === activeGame ? 1 : 0,
                  transform: i === activeGame ? 'translateX(0)' : 'translateX(20px)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                  pointerEvents: i === activeGame ? 'auto' : 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%',
                  zIndex: i === activeGame ? 2 : 1
                }}
              >
                {/* GIF Placeholder Box */}
                <div style={{ width: '100%', maxWidth: '600px', aspectRatio: '16/9', background: 'var(--color-sage-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', marginBottom: '30px', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ textAlign: 'center', opacity: 0.6 }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px', color: 'var(--color-emerald-base)' }}>{game.icon}</span>
                    <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-header)', color: 'var(--color-emerald-deep)' }}>{game.name} Gameplay (GIF Ready)</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: 'var(--color-emerald-deep)', fontFamily: 'var(--font-header)' }}>{game.name}</h3>
                  <span className="game-card-badge" style={{ display: 'inline-block', marginBottom: '15px', background: 'var(--color-emerald-base)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{game.focus}</span>
                  <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>{game.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
            {gamesList.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveGame(i)}
                style={{
                  width: '10px', height: '10px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                  background: i === activeGame ? 'var(--color-emerald-base)' : 'var(--color-sage-green)',
                  transition: 'background 0.3s, transform 0.3s',
                  transform: i === activeGame ? 'scale(1.2)' : 'scale(1)'
                }}
                aria-label={`Go to game slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 📊 Parameters Section */}
      <section id="data-metrics" className="data-metrics-section" style={{ maxWidth: '100%', width: '100%', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '0px' }}>Backed by Hard Data</h2>
          <p style={{ textAlign: 'center', opacity: 0.8, marginTop: '0px', marginBottom: '20px' }}>We don't guess. We track cognitive improvements in real-time. See the math behind the mind.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {trustMetrics.map((metric, i) => (
              <MetricCard key={i} value={metric.value} label={metric.label} onClick={() => setActiveMetric(metric)} />
            ))}
          </div>
        </div>
      </section>

      {/* 💬 User Reviews Carousel */}
      <section id="reviews" className="reviews-section" style={{ maxWidth: '100%', width: '100%', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '10px' }}>Proof of Rewiring</h2>
          <p style={{ textAlign: 'center', opacity: 0.8, marginTop: '0px', marginBottom: '40px' }}>Join thousands who have broken the doomscrolling cycle, cured their brain fog, and unlocked deep work.</p>

          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  position: i === activeTestimonial ? 'relative' : 'absolute',
                  opacity: i === activeTestimonial ? 1 : 0,
                  transform: i === activeTestimonial ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                  pointerEvents: i === activeTestimonial ? 'auto' : 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%',
                  zIndex: i === activeTestimonial ? 2 : 1
                }}
              >
                <span style={{ fontSize: '4rem', opacity: 0.1, fontFamily: 'serif', lineHeight: 1, marginBottom: '-20px' }}>"</span>
                <p style={{ fontSize: '1.25rem', fontStyle: 'italic', lineHeight: 1.7, opacity: 0.9, marginBottom: '30px', maxWidth: '650px' }}>
                  {t.quote}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-emerald-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{t.initials}</div>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-emerald-deep)' }}>{t.author}</h4>
                    <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                style={{
                  width: '10px', height: '10px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                  background: i === activeTestimonial ? 'var(--color-emerald-base)' : 'var(--color-sage-green)',
                  transition: 'background 0.3s, transform 0.3s',
                  transform: i === activeTestimonial ? 'scale(1.2)' : 'scale(1)'
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ❓ FAQ Section */}
      <section id="faq" className="faq-section" style={{ maxWidth: '100%', width: '100%', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 className="section-title">Common Questions</h2>
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

      {/* 🧠 Core Philosophy Section */}
      <section id="philosophy" className="philosophy-section" style={{ maxWidth: '100%', width: '100%', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', border: '1px solid var(--color-emerald-base)' }}>
          <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Our Manifesto: Play to Grow</h2>
          <p style={{ fontSize: '1.15rem', lineHeight: '1.8', maxWidth: '850px', margin: '0 auto', opacity: 0.9 }}>
            We don't believe in digital minimalism. We believe in <strong>digital resistance.</strong><br /><br />
            Tech giants spent billions engineering algorithms to hijack your dopamine baseline. We are building the antidote. We harness the brain's natural desire for play, challenge, and reward to rebuild what the algorithms broke.<br /><br />
            DopaMind is your daily mental barbell. By spending just 3 minutes a day in active, high-effort focus, you can physically rewire your brain to delay gratification and reclaim your attention span.<br /><br />
            <strong>We do not build addictive apps. We build cognitive resistance to them.</strong>
          </p>
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
                        {usernameStatus === 'available' && <span style={{ color: 'var(--color-emerald-base)', fontSize: '0.8rem', marginLeft: '8px' }}>Available ✅</span>}
                        {usernameStatus === 'taken' && <span style={{ color: 'red', fontSize: '0.8rem', marginLeft: '8px' }}>Taken ❌</span>}
                        {usernameStatus === 'checking' && <span style={{ color: 'gray', fontSize: '0.8rem', marginLeft: '8px' }}>Checking...</span>}
                        {usernameStatus === 'invalid' && <span style={{ color: 'red', fontSize: '0.8rem', marginLeft: '8px' }}>Letters/numbers/_ only</span>}
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
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.422-5.189l-6.196-5.239C29.21,35.154,26.685,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.196,5.239C36.983,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
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

      {/* 📈 Metric Details Modal Overlay */}
      {activeMetric && (
        <div className="auth-modal-overlay" onClick={() => setActiveMetric(null)}>
          <div className="auth-modal glass-panel" style={{ maxWidth: '500px', padding: '40px' }} onClick={(e) => e.stopPropagation()}>
            <button className="auth-close-btn" onClick={() => setActiveMetric(null)}>×</button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '3rem', margin: 0, color: 'var(--color-emerald-base)', fontFamily: 'var(--font-header)' }}>
                {activeMetric.value}
              </h2>
              <p style={{ fontSize: '1.2rem', fontWeight: '500', opacity: 0.9, marginTop: '10px' }}>
                {activeMetric.label}
              </p>
            </div>

            <div style={{ background: 'var(--color-oat-light)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <strong style={{ display: 'block', color: 'var(--color-emerald-deep)', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                How this is calculated
              </strong>
              <p style={{ margin: 0, opacity: 0.8, lineHeight: '1.5', fontSize: '0.95rem' }}>
                {activeMetric.calc}
              </p>
            </div>

            <MiniChart data={activeMetric.data} unit={activeMetric.unit} />

          </div>
        </div>
      )}

    </PublicLayout>
  );
}
