// ReactionTap v3 — UGP-owned timer, pure game logic
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

export default function ReactionTap({
  isActive, onComplete, onQuit, onHudUpdate, soundEnabled,
  level=1, difficultyValue=5, sessionSeconds=60,
}) {
  const [state, setState] = useState('waiting'); // waiting|ready|tapped|early
  const [lastMs, setLastMs]  = useState(null);
  const [round, setRound]    = useState(1);

  const scoreRef   = useRef(0);
  const mistRef    = useRef(0);
  const maxRef     = useRef(0);
  const streakRef  = useRef(0);
  const times      = useRef([]);
  const tapStart   = useRef(0);
  const waitTimer  = useRef(null);
  const sessionRef = useRef(null);
  const gameStart  = useRef(Date.now());

  const totalRounds = Math.max(difficultyValue||5, Math.floor(sessionSeconds/12));

  useEffect(()=>{
    if (!isActive){ clearTimeout(waitTimer.current); clearTimeout(sessionRef.current); return; }
    scoreRef.current=0; mistRef.current=0; streakRef.current=0; maxRef.current=0;
    times.current=[]; setRound(1); setState('waiting'); setLastMs(null);
    gameStart.current = Date.now();
    startWait();
    sessionRef.current = setTimeout(()=>endGame(), sessionSeconds*1000);
    return ()=>{ clearTimeout(waitTimer.current); clearTimeout(sessionRef.current); };
  },[isActive, sessionSeconds]);

  const startWait = ()=>{
    setState('waiting');
    setLastMs(null);
    const delay = 1500 + Math.random()*3000;
    waitTimer.current = setTimeout(()=>{ setState('ready'); tapStart.current=Date.now(); }, delay);
  };

  const handleTap = ()=>{
    if (state==='waiting'){
      clearTimeout(waitTimer.current);
      mistRef.current++; streakRef.current=0;
      if (soundEnabled) playErrorSound();
      setState('early');
      setTimeout(()=>startWait(), 1400);
    } else if (state==='ready'){
      const ms = Date.now()-tapStart.current;
      times.current.push(ms);
      scoreRef.current++; streakRef.current++;
      maxRef.current=Math.max(maxRef.current,streakRef.current);
      if (onHudUpdate) onHudUpdate({ score: scoreRef.current });
      if (soundEnabled) playChime(scoreRef.current%8);
      setLastMs(ms); setState('tapped');
      const next = round+1;
      if (next>totalRounds){ setTimeout(()=>endGame(),900); }
      else { setRound(next); setTimeout(()=>startWait(),900); }
    }
  };

  const endGame = ()=>{
    clearTimeout(waitTimer.current); clearTimeout(sessionRef.current);
    const total = scoreRef.current+mistRef.current;
    const avg = times.current.length ? (times.current.reduce((a,b)=>a+b,0)/times.current.length/1000).toFixed(3) : 0;
    onComplete({
      score:scoreRef.current, attempts:total,
      accuracy_percent:total>0?Math.round(scoreRef.current/total*100):0,
      avg_speed_seconds:parseFloat(avg), level_reached:level,
      duration_seconds:Math.round((Date.now()-gameStart.current)/1000),
      streak_in_game:maxRef.current, perfect_rounds:0,
      game_specific:{rounds:totalRounds},
    });
  };

  if (!isActive) return null;

  const bg = state==='waiting'?'rgba(239,68,68,0.12)':state==='ready'?'rgba(16,185,129,0.18)':state==='early'?'rgba(234,179,8,0.12)':'rgba(255,255,255,0.04)';
  const bc = state==='waiting'?'var(--color-error-coral)':state==='ready'?'var(--color-emerald-base)':state==='early'?'#eab308':'var(--border)';

  return (
    <div className="active-game-container" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:16,gap:12}}>
      <div style={{opacity:0.5,fontSize:'0.8rem'}}>Round {round}/{totalRounds}</div>
      <div onClick={handleTap} style={{
        width:'min(280px,72vw)',height:'min(280px,72vw)',borderRadius:28,
        background:bg,border:`2px solid ${bc}`,
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        cursor:'pointer',transition:'all 0.1s',userSelect:'none',
        boxShadow:state==='ready'?'0 0 50px rgba(16,185,129,0.3)':'none',
      }}>
        <span style={{fontSize:'clamp(2rem,8vw,3rem)',fontWeight:900,color:'var(--text-main)'}}>
          {state==='waiting'&&'⏳ Wait…'}
          {state==='ready'&&'⚡ TAP!'}
          {state==='early'&&'😬 Too early!'}
          {state==='tapped'&&`${lastMs}ms`}
        </span>
        {state==='tapped'&&<span style={{opacity:0.6,marginTop:8,fontSize:'0.88rem'}}>
          {lastMs<200?'⚡ Lightning!':lastMs<350?'✅ Great!':'💪 Keep going!'}
        </span>}
      </div>
      {maxRef.current>=3&&<div style={{color:'var(--color-emerald-base)',fontWeight:700,fontSize:'0.82rem'}}>🔥 {maxRef.current} streak</div>}
    </div>
  );
}
