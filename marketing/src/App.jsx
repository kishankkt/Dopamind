import React, { useState } from 'react';
import InteractiveGame from './InteractiveGame';
import './App.css';

export default function App() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const games = [
    {
      id: 'speedmatch',
      name: '1. SpeedMatch',
      focus: 'Processing Speed & Focus',
      description: 'Compare current symbols with the previous ones under adaptive speed shifts. Trains fast decision loops and focus lock.',
      icon: '⚡'
    },
    {
      id: 'focusgrid',
      name: '2. FocusGrid',
      focus: 'Spatial Sequence Memory',
      description: 'Flashes patterns of tiles on a grid to replicate. Strengthens working memory and spatial tracking skills.',
      icon: '⏹️'
    },
    {
      id: 'countflow',
      name: '3. CountFlow',
      focus: 'Mental Math & Agility',
      description: 'Solve falling arithmetic equations in a Tetris-like environment. Heightens numerical agility under cognitive stress.',
      icon: '🧮'
    },
    {
      id: 'wordwarp',
      name: '4. WordWarp',
      focus: 'Cognitive Flexibility',
      description: 'The Stroop test: identify mismatching word colors under timing pressure. Calibrates inhibitory control filters.',
      icon: '🎨'
    },
    {
      id: 'patternpulse',
      name: '5. PatternPulse',
      focus: 'Pattern Recognition',
      description: 'Locate subtle anomalies and differences in complex, changing designs. Sharpens visual search speed.',
      icon: '👁️'
    }
  ];

  const faqs = [
    {
      question: "How does the 'Cortisol Rescue' difficulty work?",
      answer: "Traditional games punish errors with harsh Game Over screens, leading to frustration and exit. DopaMind monitors your performance: if you hit 2 errors in a row, the difficulty temporarily drops back, serving simplified matches to reset your confidence, release relief hormones, and protect your focus loop from fatigue."
    },
    {
      question: "How do I install the macOS version (.dmg)?",
      answer: "Since we distribute self-signed builds to avoid $99/yr licensing fees, macOS will prompt an 'unidentified developer' warning. To open it: Control-Click (or Right-Click) the DopaMind icon in your Applications folder, select 'Open' from the menu, and click 'Open' in the pop-up window. You only need to do this once!"
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. All subscriptions and payments are handled entirely on pre-built checkout pages hosted by Stripe and Razorpay. We do not store, log, or transmit any credit card data on our servers."
    },
    {
      question: "What makes DopaMind so lightweight (~4MB)?",
      answer: "Traditional cross-platform desktop frameworks package a heavy copy of the Chromium browser inside your app, leading to massive 100MB+ installers. DopaMind is built on Tauri and Rust, utilizing your operating system's native built-in webview. This ensures an installer file size of only ~4MB and minimal memory usage."
    }
  ];

  return (
    <div className="landing-container">
      {/* 🚀 Header */}
      <header className="site-header glass-panel">
        <div className="logo-area">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">DopaMind</span>
        </div>
        <nav className="header-nav">
          <a href="#games">Games</a>
          <a href="#streak">Daily Streak</a>
          <a href="#faq">FAQ</a>
          <a href="#download" className="btn-secondary nav-cta">Download</a>
        </nav>
      </header>

      {/* ⚡ Hero Section */}
      <section className="hero-section">
        <div className="hero-info">
          <div className="tag-badge">🪴 Positive Dopamine Gym</div>
          <h1>Doomscrolling is shrinking your focus.</h1>
          <p className="hero-lead">
            Rebuild your attention span in 45 seconds a day. DopaMind uses short, gamified cognitive loops to train focus and spatial memory—free of social feed triggers.
          </p>
          <div className="hero-stats">
            <div className="hero-stat-item">
              <strong>~4MB</strong>
              <span>Installer Size</span>
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
          <div className="hero-actions">
            <a href="#download" className="btn-primary">Download Native Client</a>
            <a href="#games" className="btn-secondary">Explore 5 Game Modes</a>
          </div>
        </div>

        {/* Interactive Game Widget */}
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
          {games.map((game) => (
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
            Every day you complete a 45-second focus gym session, you water your digital pixel plant. Watch it grow from a single seed into a full-bloom flower. Protect your streak using Water Shields or share milestones with friends to keep your streak alive.
          </p>
          <ul className="streak-bullets">
            <li>🌱 <strong>Day 1-3:</strong> Seed sprouts into a green leaf.</li>
            <li>🌿 <strong>Day 7:</strong> Leaves expand into a robust Sage branch.</li>
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

      {/* 📥 Download CTA Section */}
      <section id="download" className="download-section">
        <div className="glass-panel download-box">
          <h2>Get DopaMind Now</h2>
          <p>Download the ultra-lightweight app client directly onto your device.</p>
          
          <div className="download-grid">
            <a href="#windows" className="glass-card download-button">
              <span className="os-icon">🪟</span>
              <div>
                <strong>Download for Windows</strong>
                <span>Installer (.exe) | ~4.2 MB</span>
              </div>
            </a>
            <a href="#mac" className="glass-card download-button">
              <span className="os-icon">🍏</span>
              <div>
                <strong>Download for macOS</strong>
                <span>Universal DMG | ~3.8 MB</span>
              </div>
            </a>
            <a href="#linux" className="glass-card download-button">
              <span className="os-icon">🐧</span>
              <div>
                <strong>Download for Linux</strong>
                <span>Debian Package (.deb) | ~3.5 MB</span>
              </div>
            </a>
          </div>

          <div className="mac-bypass-notice">
            <p>
              ⚠️ <strong>macOS User Notice:</strong> After downloading the DMG, please <strong>Right-Click (Control-Click) ➡️ Open</strong> to bypass the standard ad-hoc Gatekeeper warnings.
            </p>
          </div>
        </div>
      </section>

      {/* 📇 Footer */}
      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} DopaMind. All rights reserved.</p>
        <div className="footer-links">
          <a href="/legal/privacy_policy.md" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="/legal/terms_of_service.md" target="_blank" rel="noopener noreferrer">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
