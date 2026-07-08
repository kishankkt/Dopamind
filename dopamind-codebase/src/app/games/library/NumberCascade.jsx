// NumberCascade v3 — UGP-owned timer, pure game logic
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

export default function NumberCascade({
  isActive,onComplete,onQuit,onHudUpdate,soundEnabled,
  level=1,difficultyValue=4,sessionSeconds=120,
}) {
  const seqLen = Math.min(Math.max(Math.floor(difficultyValue),3),10);
  const [seq,setSeq]=useState('');
  const [input,setInput]=useState('');
  const [phase,setPhase]=useState('show'); // show|type|result

  const scoreRef=useRef(0);
  const attRef=useRef(0);
  const sessionRef=useRef(null);
  const gameStart=useRef(Date.now());

  useEffect(()=>{
    if (!isActive){ clearTimeout(sessionRef.current); return; }
    scoreRef.current=0; attRef.current=0;
    gameStart.current=Date.now();
    nextSeq();
    sessionRef.current=setTimeout(()=>endGame(),sessionSeconds*1000);
    return ()=>clearTimeout(sessionRef.current);
  },[isActive,sessionSeconds]);

  const nextSeq=()=>{
    const digits=Array.from({length:seqLen},()=>Math.floor(Math.random()*10)).join('');
    setSeq(digits);
    setInput('');
    setPhase('show');
    // Auto-hide after 1.5s per digit (min 2s, max 8s)
    const showTime=Math.max(2000, seqLen*1500);
    setTimeout(()=>setPhase('type'),showTime);
  };

  const handleKey=(k)=>{
    if (phase!=='type') return;
    const next=input+k;
    setInput(next);
    if (next.length===seq.length){
      attRef.current++;
      if (next===seq){
        scoreRef.current++;
        if (onHudUpdate) onHudUpdate({score:scoreRef.current});
        if (soundEnabled) playChime(scoreRef.current%8);
        setPhase('result');
        setTimeout(()=>nextSeq(),800);
      } else {
        if (soundEnabled) playErrorSound();
        setPhase('result');
        setTimeout(()=>endGame(),1200);
      }
    }
  };

  const endGame=()=>{
    clearTimeout(sessionRef.current);
    const acc=attRef.current>0?Math.round(scoreRef.current/attRef.current*100):0;
    onComplete({
      score:scoreRef.current,attempts:attRef.current,accuracy_percent:acc,
      avg_speed_seconds:0,level_reached:level,
      duration_seconds:Math.round((Date.now()-gameStart.current)/1000),
      streak_in_game:scoreRef.current,perfect_rounds:scoreRef.current,
      game_specific:{seq_length:seqLen},
    });
  };

  if (!isActive) return null;

  const correct=phase==='result'&&input===seq;
  const wrong=phase==='result'&&input!==seq;

  return (
    <div className="active-game-container" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:16,gap:16}}>
      {/* Sequence display */}
      <div style={{
        padding:'20px 28px',borderRadius:22,fontSize:'clamp(1.8rem,6vw,3rem)',
        fontFamily:'monospace',fontWeight:700,letterSpacing:'0.15em',
        minWidth:'min(280px,80vw)',textAlign:'center',
        background:correct?'rgba(16,185,129,0.08)':wrong?'rgba(239,68,68,0.08)':'rgba(255,255,255,0.04)',
        border:`2px solid ${correct?'var(--color-emerald-base)':wrong?'var(--color-error-coral)':'var(--border)'}`,
        transition:'all 0.2s',
      }}>
        {phase==='show'&&seq}
        {phase==='type'&&(input||<span style={{opacity:0.25}}>Type the number…</span>)}
        {phase==='result'&&(correct?'✓ Correct!':'✗ '+seq)}
      </div>

      <p style={{opacity:0.6,fontSize:'0.85rem',margin:0}}>
        {phase==='show'?'Memorize this number…':phase==='type'?'Type it from memory:':''}
      </p>

      {/* Numpad */}
      {phase==='type'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,maxWidth:'min(240px,70vw)',width:'100%'}}>
          {[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map((k,i)=>(
            <button key={i} onClick={()=>{
              if (k==='⌫') setInput(p=>p.slice(0,-1));
              else if (k==='✓') {}
              else handleKey(String(k));
            }} style={{
              padding:'16px 8px',fontSize:'clamp(1.2rem,4vw,1.5rem)',fontWeight:700,
              background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',
              borderRadius:14,cursor:'pointer',color:'var(--text-main)',
              fontFamily:'var(--font-header)',
            }}>
              {k}
            </button>
          ))}
        </div>
      )}

      <div style={{opacity:0.3,fontSize:'0.75rem'}}>Score: {scoreRef.current}</div>
    </div>
  );
}
