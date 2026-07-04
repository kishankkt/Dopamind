import React, { useState } from 'react';
import { BrainCircuit, Clock, Target, Rocket } from 'lucide-react';
import { buildBrainSchedule } from '../utils/aiEngine';

export default function ScheduleBuilder({ onStartGame }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("Reflexes");
  const [time, setTime] = useState("10 mins");
  
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);

  const handleGenerate = async () => {
    setStep(2);
    setLoading(true);
    const result = await buildBrainSchedule({ goal, time });
    setSchedule(result);
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '700px', margin: '0 auto', marginTop: '24px' }}>
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <BrainCircuit size={48} style={{ color: 'var(--color-emerald-base)', marginBottom: '16px' }} />
        <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '2rem', margin: 0 }}>AI Neuro-Architect</h2>
        <p style={{ opacity: 0.7, marginTop: '8px' }}>Let DopaMind's intelligence build your daily cognitive routine.</p>
      </header>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px' }}>
              <Target size={18} /> Primary Cognitive Goal
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {["Reflexes", "Memory", "Focus & Attention", "Logic"].map(g => (
                <button 
                  key={g}
                  onClick={() => setGoal(g)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: goal === g ? '2px solid var(--color-emerald-base)' : '2px solid var(--border)',
                    background: goal === g ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                    color: goal === g ? 'var(--color-emerald-base)' : 'var(--text-main)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px' }}>
              <Clock size={18} /> Time Available Today
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {["5 mins", "10 mins", "20 mins", "30+ mins"].map(t => (
                <button 
                  key={t}
                  onClick={() => setTime(t)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: time === t ? '2px solid var(--color-emerald-base)' : '2px solid var(--border)',
                    background: time === t ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                    color: time === t ? 'var(--color-emerald-base)' : 'var(--text-main)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '16px' }}
            onClick={handleGenerate}
          >
            Generate AI Schedule
          </button>
        </div>
      )}

      {step === 2 && loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
          <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BrainCircuit size={64} style={{ color: 'var(--color-emerald-base)', marginBottom: '24px' }} />
            <h3 style={{ margin: 0, color: 'var(--color-emerald-base)' }}>Synthesizing Neuro-Pathways...</h3>
            <p style={{ opacity: 0.6 }}>Querying OpenRouter Auto for optimal cognitive load.</p>
          </div>
        </div>
      )}

      {step === 2 && !loading && schedule && (
        <div className="schedule-results animate-pop">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Rocket size={20} style={{ color: 'var(--color-accent-gold)' }} />
            Your Personalized Routine
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {schedule.map((item, index) => (
              <div key={index} style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '20px',
                borderRadius: '16px',
                borderLeft: '4px solid var(--color-emerald-base)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-white)' }}>{item.game}</h4>
                  <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>
                    {item.rounds} Round(s) • {item.reason}
                  </p>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => onStartGame(item.game.toLowerCase())}
                >
                  Play
                </button>
              </div>
            ))}
          </div>

          <button 
            style={{ 
              marginTop: '32px', 
              width: '100%', 
              padding: '16px', 
              background: 'transparent',
              border: '1px solid var(--border-light)',
              color: 'var(--text-main)',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
            onClick={() => setStep(1)}
          >
            Rebuild Schedule
          </button>
        </div>
      )}
    </div>
  );
}
