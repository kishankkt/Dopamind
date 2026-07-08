// TimeEstimator v3 — UGP-owned timer, hold-for-duration game
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

export default function TimeEstimator({
  isActive,onComplete,onQuit,onHudUpdate,soundEnabled,
  level=1,difficultyValue=5,sessionSeconds=300,
}) {
  const targetMs=(difficultyValue||5)*1000;
  const totalRounds=Math.max(5,Math.floor(sessionSeconds/30));

  const [round,setRound]=useState(1);
  const [phase,setPhase]=useState('ready'); // ready|holding|result
  const [resultMs,setResultMs]=useState(null);

  const scoreRef=useRef(0);
  const streakRef=useRef(0);
  const maxRef=useRef(0);
  const holdStart=useRef(0);
  const sessionRef=useRef(null);
  const gameStart=useRef(Date.now());

  useEffect(()=>{
    if (!isActive){ clearTimeout(sessionRef.current); return; }
    scoreRef.current=0; streakRef.current=0; maxRef.current=0;
    setRound(1); setPhase('ready'); setResultMs(null);
    gameStart.current=Date.now();
    sessionRef.current=setTimeout(()=>endGame(),sessionSeconds*1000);
    return ()=>clearTimeout(sessionRef.current);
  },[isActive,sessionSeconds]);

  const handleDown=(e)=>{
    if (phase!=='ready'||e.cancelable) e.preventDefault?.();
    if (phase!=='ready') return;
    holdStart.current=Date.now();
    setPhase('holding');
  };

  const handleUp=(e)=>{
    if (e.cancelable) e.preventDefault?.();
    if (phase!=='holding') return;
    const held=Date.now()-holdStart.current;
    setResultMs(held);
    setPhase('result');

    const diff=Math.abs(held-targetMs);
    const margin=targetMs*0.15;
    if (diff<=margin){
      scoreRef.current++;
      streakRef.current++;
      maxRef.current=Math.max(maxRef.current,streakRef.current);
      if (onHudUpdate) onHudUpdate({score:scoreRef.current});
      if (soundEnabled) playChime(scoreRef.current%8);
    } else {
      streakRef.current=0;
      if (soundEnabled) playErrorSound();
    }

    setTimeout(()=>{
      const nr=round+1;
      if (nr<=totalRounds){ setRound(nr); setPhase('ready'); setResultMs(null); }
      else endGame();
    },1800);
  };

  const endGame=()=>{
    clearTimeout(sessionRef.current);
    onComplete({
      score:scoreRef.current,attempts:round,
      accuracy_percent:Math.round(scoreRef.current/Math.min(round,totalRounds)*100)||0,
      avg_speed_seconds:targetMs/1000,level_reached:level,
      duration_seconds:Math.round((Date.now()-gameStart.current)/1000),
      streak_in_game:maxRef.current,perfect_rounds:scoreRef.current,
      game_specific:{target_ms:targetMs,rounds:totalRounds},
    });
  };

  if (!isActive) return null;

  const feedback=phase==='result'&&resultMs!=null?
    Math.abs(resultMs-targetMs)<=100?{t:'PERFECT! 🎯',c:'var(--color-emerald-base)'}:
    Math.abs(resultMs-targetMs)<=targetMs*0.15?{t:'Close! ✅',c:'var(--color-emerald-base)'}:
    resultMs<targetMs?{t:'Too short ⏳',c:'#eab308'}:{t:'Too long 🐢',c:'var(--color-error-coral)'}
  :null;

  return (
    <div className="active-game-container" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:16,gap:16}}>
      <p style={{opacity:0.6,fontSize:'0.88rem',margin:0}}>
        Hold for exactly <strong>{(targetMs/1000).toFixed(1)}s</strong>
        <span style={{opacity:0.4,marginLeft:8,fontSize:'0.8rem'}}>Round {round}/{totalRounds}</span>
      </p>

      <button
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerLeave={phase==='holding'?handleUp:undefined}
        style={{
          width:'min(220px,56vw)',height:'min(220px,56vw)',
          borderRadius:'50%',
          background:phase==='holding'?'var(--color-accent-gold, #eab308)':phase==='result'?'transparent':'rgba(255,255,255,0.04)',
          border:`3px solid ${phase==='holding'?'var(--color-accent-gold, #eab308)':phase==='result'?(feedback?.c||'var(--border)'):'var(--border)'}`,
          cursor:phase==='ready'?'pointer':'default',
          transition:'all 0.12s',
          boxShadow:phase==='holding'?'0 0 50px rgba(234,179,8,0.4)':'none',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          userSelect:'none',touchAction:'none',color:'var(--text-main)',
        }}
      >
        {phase==='ready'&&<><span style={{fontSize:'2.5rem'}}>⏱</span><span style={{fontSize:'0.9rem',fontWeight:700,marginTop:4}}>HOLD</span></>}
        {phase==='holding'&&<span style={{fontSize:'3rem'}}>…</span>}
        {phase==='result'&&<>
          <span style={{fontSize:'1.8rem',fontWeight:900,color:feedback?.c}}>{(resultMs/1000).toFixed(2)}s</span>
          <span style={{fontSize:'0.9rem',color:feedback?.c,marginTop:6}}>{feedback?.t}</span>
        </>}
      </button>

      {maxRef.current>=2&&<div style={{color:'var(--color-emerald-base)',fontWeight:700,fontSize:'0.82rem'}}>🔥 {maxRef.current} streak</div>}
    </div>
  );
}
