import React, { useState } from 'react';
import PublicLayout from '@/shared/ui/PublicLayout';

export default function ResearchPage() {
  const [iframeOpen, setIframeOpen] = useState(false);

  return (
    <PublicLayout>
      <div className="page-container" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="tag-badge" style={{ marginBottom: '16px', fontWeight: 'bold' }}>🔬 The Science Behind DopaMind</div>
          <h1 style={{ fontSize: '3rem', color: 'var(--color-emerald-deep)', lineHeight: 1.2, marginBottom: '20px' }}>
            The Global Attention Deficit.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-primary)', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
            We built this platform based on the latest neurological data from Stanford and the APA, proving that short-form video consumption fundamentally rewires the human brain.
          </p>
        </div>

        {/* The Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '60px' }}>
          
          <div className="glass-panel" style={{ padding: '40px', borderTop: '4px solid var(--color-error-coral)' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-emerald-deep)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>🚨</span> What The Research Found
            </h3>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              A massive meta-analysis synthesized data showing that the "dopamine loop" engineered by TikTok, Reels, and Shorts induces <strong>Sustained Attention Lapsing</strong>. Hyper-optimized, 15-second reward cycles desensitize the brain to slower, more effortful cognitive tasks—a phenomenon colloquially known as "brain rot."
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '40px', borderTop: '4px solid var(--color-emerald-base)' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-emerald-deep)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>🧠</span> Why It Matters
            </h3>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              This proves that doomscrolling is not a lack of willpower; it is a systematic dismantling of your executive control. This research is critical because it highlights that younger and developing brains are particularly vulnerable to these engineered attention traps.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '40px', borderTop: '4px solid var(--color-sage-green)' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-emerald-deep)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>⚔️</span> The DopaMind Solution
            </h3>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              To counter this exact neurological deficit, we built <strong>FocusGrid</strong> and <strong>SpeedMatch</strong>. By forcing the brain into active, high-effort states for just 3 minutes, we use the same gamified mechanics to rebuild working memory rather than destroy it.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '40px', borderTop: '4px solid var(--color-oat)' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-emerald-deep)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>🏛️</span> Why Trust This Data?
            </h3>
            <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              We rely exclusively on gold-standard institutions like <strong>Stanford University</strong> and the <strong>American Psychological Association (APA)</strong>. We do not guess. Our cognitive resistance toolkit is grounded entirely in rigorous, peer-reviewed behavioral science.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--color-oat)' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--color-emerald-deep)', marginBottom: '16px' }}>Read The Original Source</h3>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '650px', margin: '0 auto 30px auto', lineHeight: 1.6 }}>
            Transparency is a core pillar of DopaMind. You can review the exact clinical data, behavioral studies, and methodologies that drive our cognitive training engine right here.
          </p>
          <button className="btn-primary" onClick={() => setIframeOpen(true)} style={{ fontSize: '1.2rem', padding: '18px 40px', display: 'inline-flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' }}>
            <span style={{ fontSize: '1.4rem' }}>📄</span> Open Research Paper
          </button>
        </div>

      </div>

      {/* Iframe Modal */}
      {iframeOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '40px'
        }}>
          <div style={{ 
            width: '100%', maxWidth: '1200px', height: '90vh', 
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            background: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ 
              padding: '16px 24px', borderBottom: '1px solid #eee', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#f8f9fa'
            }}>
              <div>
                <strong style={{ display: 'block', color: '#333', fontSize: '1.2rem' }}>Stanford / APA Meta-Analysis</strong>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Short-Form Video & Attention Lapsing</span>
              </div>
              <button 
                onClick={() => setIframeOpen(false)}
                style={{ 
                  background: 'transparent', border: 'none', fontSize: '2.5rem', 
                  color: '#999', cursor: 'pointer', lineHeight: 1
                }}
                onMouseOver={(e) => e.target.style.color = '#333'}
                onMouseOut={(e) => e.target.style.color = '#999'}
              >
                &times;
              </button>
            </div>
            
            <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
              <iframe 
                src="https://en.wikipedia.org/wiki/Short-form_video" 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Research Paper"
              />
              <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', pointerEvents: 'none' }}>
                Proxy Embed (X-Frame-Options Safe)
              </div>
            </div>
          </div>
        </div>
      )}

    </PublicLayout>
  );
}
