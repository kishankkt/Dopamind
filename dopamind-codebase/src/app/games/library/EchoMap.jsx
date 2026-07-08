// EchoMap v3 — UGP-owned timer, reverse sequence memory game
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

const GRID = 16; // 4x4

export default function EchoMap({
  isActive,onComplete,onQuit,onHudUpdate,soundEnabled,
  level=1,difficultyValue=2,sessionSeconds=300,
}) {
  const seqLen = Math.min(2+Math.floor(level/2), 8);

  const [phase,setPhase]=useState('idle'); // idle|showing|input|feedback
  const [seq,setSeq]=useState([]);
  const [activeTile,setActive]=useState(null);
  const [userInput,setUserInput]=useState([]);
  const [result,setResult]=useState(null); // 'correct'|'incorrect'

  const scoreRef=useRef(0);
  const roundsRef=useRef(0);
  const streakRef=useRef(0);
  const maxRef=useRef(0);
  const sessionRef=useRef(null);
  const showRef=useRef(null);
  const gameStart=useRef(Date.now());

  useEffect(()=>{
    if (!isActive){ clearTimeout(sessionRef.current); clearTimeout(showRef.current); return; }
    scoreRef.current=0; roundsRef.current=0; streakRef.current=0; maxRef.current=0;
    gameStart.current=Date.now();
    setTimeout(()=>startRound(),300);
    sessionRef.current=setTimeout(()=>endGame(),sessionSeconds*1000);
    return ()=>{ clearTimeout(sessionRef.current); clearTimeout(showRef.current); };
  },[isActive,sessionSeconds]);

  const startRound=useCallback(()=>{
    const s=Array.from({length:seqLen},()=>Math.floor(Math.random()*GRID));
    setSeq(s);
    setUserInput([]);
    setResult(null);
    showSequence(s);
  },[seqLen,soundEnabled]);

  const showSequence=(s)=>{
    setPhase('showing');
    let i=0;
    const step=()=>{
      if (i>=s.length){ setActive(null); setPhase('input'); return; }
      setActive(s[i]);
      if (soundEnabled) playChime(s[i]%8);
      showRef.current=setTimeout(()=>{
        setActive(null);
        showRef.current=setTimeout(()=>{ i++; step(); },200);
      },500);
    };
    showRef.current=setTimeout(step,500);
  };

  const handleTile=(idx)=>{
    if (phase!=='input') return;
    // Reverse order — user must enter sequence backwards
    const reversed=[...seq].reverse();
    const expected=reversed[userInput.length];

    if (idx===expected){
      setActive(idx);
      if (soundEnabled) playChime(idx%8);
      setTimeout(()=>setActive(null),150);
      const next=[...userInput,idx];
      if (next.length===seq.length){
        scoreRef.current++;
        roundsRef.current++;
        streakRef.current++;
        maxRef.current=Math.max(maxRef.current,streakRef.current);
        if (onHudUpdate) onHudUpdate({score:scoreRef.current});
        if (soundEnabled) playChime(10);
        setResult('correct');
        setPhase('feedback');
        setTimeout(()=>startRound(),700);
      } else {
        setUserInput(next);
      }
    } else {
      roundsRef.current++;
      streakRef.current=0;
      if (soundEnabled) playErrorSound();
      setResult('incorrect');
      setPhase('feedback');
      setTimeout(()=>startRound(),800);
    }
  };

  const endGame=()=>{
    clearTimeout(sessionRef.current); clearTimeout(showRef.current);
    const acc=roundsRef.current>0?Math.round(scoreRef.current/roundsRef.current*100):0;
    onComplete({
      score:scoreRef.current,attempts:roundsRef.current,accuracy_percent:acc,
      avg_speed_seconds:0,level_reached:level,
      duration_seconds:Math.round((Date.now()-gameStart.current)/1000),
      streak_in_game:maxRef.current,perfect_rounds:scoreRef.current,
      game_specific:{seq_length:seqLen,grid_size:GRID},
    });
  };

  if (!isActive) return null;

  return (
    <div className="active-game-container" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:16,gap:12}}>
      <div style={{fontSize:'0.88rem',fontWeight:700,minHeight:24,textAlign:'center',
        color:phase==='showing'?'var(--color-emerald-base)':phase==='input'?'var(--color-accent-gold)':result==='correct'?'var(--color-emerald-base)':result==='incorrect'?'var(--color-error-coral)':'var(--text-muted)'}}>
        {phase==='showing'&&'👀 Memorize the sequence…'}
        {phase==='input'&&`↩️ Tap in REVERSE order (${seq.length-userInput.length} left)`}
        {phase==='feedback'&&result==='correct'&&'✓ Perfect!'}
        {phase==='feedback'&&result==='incorrect'&&'✗ Wrong order'}
        {phase==='idle'&&'Preparing…'}
      </div>

      {/* 4×4 grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,maxWidth:'min(300px,80vw)',width:'100%'}}>
        {Array.from({length:GRID}).map((_,i)=>(
          <button key={i} onClick={()=>handleTile(i)} style={{
            aspectRatio:'1/1',
            background:activeTile===i?'var(--color-emerald-base)':'rgba(255,255,255,0.04)',
            border:`2px solid ${activeTile===i?'var(--color-emerald-base)':'var(--border)'}`,
            borderRadius:12,cursor:phase==='input'?'pointer':'default',
            transition:'all 0.15s',
            boxShadow:activeTile===i?'0 0 20px rgba(16,185,129,0.4)':'none',
            transform:activeTile===i?'scale(0.92)':'scale(1)',
          }}/>
        ))}
      </div>
      {maxRef.current>=2&&<div style={{color:'var(--color-emerald-base)',fontWeight:700,fontSize:'0.82rem'}}>🔥 {maxRef.current} in a row</div>}
    </div>
  );
}
