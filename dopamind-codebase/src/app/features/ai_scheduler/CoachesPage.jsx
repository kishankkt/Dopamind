import React, { useState } from 'react';
import { BrainCircuit, Lock, ChevronLeft } from 'lucide-react';
import ScheduleBuilder from './ScheduleBuilder';

export default function CoachesPage({ onStartGame }) {
  const [selectedCoach, setSelectedCoach] = useState(null);

  if (selectedCoach === 'architect') {
    return (
       <div className="animate-pop">
         <button 
           onClick={() => setSelectedCoach(null)} 
           style={{ 
             background: 'transparent', 
             border: 'none', 
             color: 'var(--text-secondary)', 
             cursor: 'pointer', 
             display: 'flex', 
             alignItems: 'center', 
             gap: '8px',
             fontWeight: 'bold',
             marginBottom: '16px',
             padding: '8px 0'
           }}
         >
           <ChevronLeft size={20} /> Back to Coaches
         </button>
         <ScheduleBuilder onStartGame={onStartGame} />
       </div>
    );
  }

  return (
    <div className="animate-pop" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '24px', maxWidth: '900px', margin: '0 auto', marginTop: '24px', padding: '50px 40px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-emerald-deep)', margin: '0 0 16px 0' }}>Choose Your Coach</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Select an AI specialist to design your cognitive training regimen.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Coach 1: AI Neuro-Architect (Coming Soon) */}
        <div 
          style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '2px dashed var(--border-light)',
            borderRadius: '20px',
            padding: '40px 30px',
            textAlign: 'center',
            opacity: 0.6
          }}
        >
          <div style={{ width: '80px', height: '80px', background: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: 'var(--text-secondary)' }}>
            <BrainCircuit size={40} />
          </div>
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>AI Neuro-Architect</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            A strictly analytical intelligence that profiles your energy and cognitive state to generate an optimized orchestration queue. Coming soon in v2.0.
          </p>
        </div>

        {/* Coach 2: Coming Soon */}
        <div 
          style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '2px dashed var(--border-light)',
            borderRadius: '20px',
            padding: '40px 30px',
            textAlign: 'center',
            opacity: 0.6
          }}
        >
          <div style={{ width: '80px', height: '80px', background: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: 'var(--text-secondary)' }}>
            <Lock size={40} />
          </div>
          <h3 style={{ fontSize: '1.5rem', margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>Dopamine Detox Guide</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Specializes in long-term rewiring, behavioral modification, and impulse control management. Coming soon in v2.0.
          </p>
        </div>

      </div>
    </div>
  );
}
