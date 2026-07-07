import React, { useState } from 'react';
import { BrainCircuit, Clock, Target, Rocket, Zap, Activity, User } from 'lucide-react';
import { buildBrainSchedule } from '@/app/features/ai_spotting/aiEngine';

export default function ScheduleBuilder({ onStartGame }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [energyLevel, setEnergyLevel] = useState("Medium");
  const [cognitiveState, setCognitiveState] = useState("Brain Fog");
  const [goal, setGoal] = useState("Focus & Attention");
  const [time, setTime] = useState("10 mins");
  
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);

  const handleGenerate = async () => {
    setStep(3);
    setLoading(true);
    const result = await buildBrainSchedule({ name, energyLevel, cognitiveState, goal, time });
    setSchedule(result);
    setLoading(false);
  };

  const renderChoiceButtons = (options, currentValue, setter, accentColor) => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button 
          key={opt}
          onClick={() => setter(opt)}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            border: currentValue === opt ? `2px solid ${accentColor}` : '2px solid var(--border)',
            background: currentValue === opt ? 'rgba(255,255,255,0.05)' : 'transparent',
            color: currentValue === opt ? accentColor : 'var(--text-main)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.95rem'
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', maxWidth: '750px', margin: '0 auto', marginTop: '24px', position: 'relative' }}>
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <BrainCircuit size={48} style={{ color: 'var(--color-emerald-base)', marginBottom: '16px' }} />
        <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '2rem', margin: 0 }}>AI Neuro-Architect</h2>
        <p style={{ opacity: 0.7, marginTop: '8px' }}>Ultra-detailed cognitive profiling for optimal scheduling.</p>
      </header>

      {/* Step Progress Bar */}
      {step < 3 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          <div style={{ height: '4px', flex: 1, background: step >= 1 ? 'var(--color-emerald-base)' : 'var(--border)', borderRadius: '2px' }} />
          <div style={{ height: '4px', flex: 1, background: step >= 2 ? 'var(--color-emerald-base)' : 'var(--border)', borderRadius: '2px' }} />
        </div>
      )}

      {step === 1 && (
        <div className="animate-pop" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px' }}>
              <User size={18} /> How should I call you?
            </label>
            <input 
              type="text" 
              placeholder="Your Name (Optional)" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', fontSize: '1rem' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px' }}>
              <Zap size={18} /> Current Energy Level
            </label>
            {renderChoiceButtons(["Low", "Medium", "High", "Caffeinated"], energyLevel, setEnergyLevel, 'var(--color-emerald-base)')}
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px' }}>
              <Activity size={18} /> Cognitive State Today
            </label>
            {renderChoiceButtons(["Brain Fog", "Distracted", "Sluggish", "Stressed", "Sharp"], cognitiveState, setCognitiveState, 'var(--color-emerald-base)')}
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '8px' }} onClick={() => setStep(2)}>
            Continue to Goals
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-pop" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px' }}>
              <Target size={18} /> Primary Target Improvement
            </label>
            {renderChoiceButtons(["Reflexes", "Memory", "Focus & Attention", "Logic", "Time Perception"], goal, setGoal, 'var(--color-emerald-base)')}
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '12px' }}>
              <Clock size={18} /> Time Available Today
            </label>
            {renderChoiceButtons(["5 mins", "10 mins", "15 mins", "20+ mins"], time, setTime, 'var(--color-emerald-base)')}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <button className="btn-secondary" style={{ flex: 1, padding: '16px' }} onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn-primary animate-pulse" style={{ flex: 2, padding: '16px', fontSize: '1.1rem' }} onClick={handleGenerate}>
              Synthesize Schedule
            </button>
          </div>
        </div>
      )}

      {step === 3 && loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
          <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BrainCircuit size={64} style={{ color: 'var(--color-emerald-base)', marginBottom: '24px' }} />
            <h3 style={{ margin: 0, color: 'var(--color-emerald-base)', fontSize: '1.5rem' }}>Synthesizing Neuro-Pathways...</h3>
            <p style={{ opacity: 0.7, marginTop: '12px' }}>Analyzing {name || 'User'}'s profile: {cognitiveState} state, {energyLevel} energy.</p>
          </div>
        </div>
      )}

      {step === 3 && !loading && schedule && (
        <div className="schedule-results animate-pop">
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
            <Rocket size={24} style={{ color: 'var(--color-accent-gold)' }} />
            Your Intelligent Orchestration Queue
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {schedule.map((item, index) => (
              <div key={index} style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '24px',
                borderRadius: '16px',
                borderLeft: '4px solid var(--color-emerald-base)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-white)' }}>{item.game}</h4>
                  <p style={{ margin: '8px 0 0 0', opacity: 0.8, fontSize: '1rem', lineHeight: 1.4 }}>
                    <strong>{item.rounds} Round(s)</strong> • {item.reason}
                  </p>
                </div>
                <div style={{opacity: 0.5, fontSize: '2rem', fontWeight: 900}}>
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          <button 
            className="btn-primary animate-pulse" 
            style={{ 
              marginTop: '40px', 
              width: '100%', 
              padding: '18px', 
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: '700',
              boxShadow: '0 4px 15px rgba(52, 211, 153, 0.3)'
            }}
            onClick={() => onStartGame(schedule)}
          >
            START FULL ORCHESTRATION 
          </button>

          <button 
            style={{ 
              marginTop: '16px', 
              width: '100%', 
              padding: '16px', 
              background: 'transparent',
              border: '1px solid var(--border-light)',
              color: 'var(--text-main)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600
            }}
            onClick={() => setStep(1)}
          >
            Reconfigure Profile
          </button>
        </div>
      )}
    </div>
  );
}
