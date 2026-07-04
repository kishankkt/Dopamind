import React, { useState, useEffect } from 'react';
import { generateLeafDialogue } from '../utils/aiEngine';

export default function InteractiveLeaf({ contextTrigger }) {
  const [dialogue, setDialogue] = useState("Hi! I'm your cognitive companion.");
  const [state, setState] = useState("idle"); // idle, thinking, speaking
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (contextTrigger) {
      triggerAiThought(contextTrigger);
    }
  }, [contextTrigger]);

  const triggerAiThought = async (contextMsg) => {
    setState("thinking");
    setDialogue("..."); // Loading dots
    
    // Call OpenRouter
    const aiResponse = await generateLeafDialogue(contextMsg);
    
    setDialogue(aiResponse);
    setState("speaking");
    
    // Return to idle after a few seconds
    setTimeout(() => {
      setState("idle");
    }, 6000);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      right: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '12px',
      zIndex: 9999,
      pointerEvents: 'none' // Don't block clicks underneath
    }}>
      
      {/* Speech Bubble */}
      <div style={{
        background: 'var(--color-white)',
        padding: '12px 20px',
        borderRadius: '20px 20px 0px 20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-light)',
        maxWidth: '240px',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--color-emerald-deep)',
        opacity: state === 'idle' ? 0 : 1,
        transform: state === 'idle' ? 'translateY(10px) scale(0.95)' : 'translateY(0) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        pointerEvents: 'auto'
      }}>
        {dialogue}
      </div>

      {/* The Magical Leaf SVG */}
      <div 
        className={state === 'thinking' ? 'animate-pulse' : 'animate-float'}
        style={{
          width: '64px',
          height: '64px',
          background: 'var(--color-emerald-base)',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          boxShadow: state === 'speaking' 
            ? '0 0 20px var(--color-emerald-light)' 
            : '0 8px 16px rgba(0,0,0,0.2)',
          transition: 'box-shadow 0.3s ease',
          pointerEvents: 'auto',
          cursor: 'pointer'
        }}
        onClick={() => triggerAiThought("User poked you! Give a sassy greeting.")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" style={{width: '60%', height: '60%'}}>
          <path d="M50 12 C20 18 15 62 50 88 C85 62 80 18 50 12 Z" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 88 V28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 78 C38 72 28 66 28 54 C28 42 38 42 50 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 62 C32 56 22 50 22 38 C22 26 32 26 50 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 40 C40 34 32 28 32 22 C32 16 40 16 50 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 78 C62 72 72 66 72 54 C72 42 62 42 50 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 62 C68 56 78 50 78 38 C78 26 68 26 50 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 40 C60 34 68 28 68 22 C68 16 60 16 50 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="12" r="4.5" fill="#EAB308" />
        </svg>
      </div>

    </div>
  );
}
