// SymbolMatch v3 — UGP-owned timer, pure game logic
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

const SYMS=['▲','▼','◆','●','■','★','✚','✖','✱','♥','♦','♣','♠','✿','❀'];

export default function SymbolMatch({
  isActive,onComplete,onQuit,onHudUpdate,soundEnabled,
  level=1,difficultyValue=2,sessionSeconds=45,
}) {
  const distCount = Math.min(Math.max(Math.floor(difficultyValue),1),6)+1;
  const [target,setTarget]=useState('');
  const [grid,setGrid]=useState([]);
  const [feedback,setFb]=useState(null);

  const scoreRef=useRef(0);
  const attRef=useRef(0);
  const streakRef=useRef(0);
  const maxRef=useRef(0);
  const sessionRef=useRef(null);
  const gameStart=useRef(Date.now());

  useEffect(()=>{
    if (!isActive){ clearTimeout(sessionRef.current); return; }
    scoreRef.current=0; attRef.current=0; streakRef.current=0; maxRef.current=0;
    gameStart.current=Date.now();
    nextRound();
    sessionRef.current=setTimeout(()=>endGame(),sessionSeconds*1000);
    return ()=>clearTimeout(sessionRef.current);
  },[isActive,sessionSeconds]);

  const nextRound=()=>{
    setFb(null);
    const pool=[...SYMS].sort(()=>Math.random()-0.5).slice(0,distCount+1);
    const tgt=pool[0];
    const distractors=pool.slice(1);
    const gridSyms=[];
    const tgtCount=1+Math.floor(Math.random()*2);
    for (let i=0;i<tgtCount;i++) gridSyms.push(tgt);
    while (gridSyms.length<8+distCount*2){
      gridSyms.push(distractors[Math.floor(Math.random()*distractors.length)]);
    }
    setTarget(tgt);
    setGrid(gridSyms.sort(()=>Math.random()-0.5));
  };

  const handleTap=(sym)=>{
    if (feedback) return;
    attRef.current++;
    if (sym===target){
      scoreRef.current++;
      streakRef.current++;
      maxRef.current=Math.max(maxRef.current,streakRef.current);
      if (onHudUpdate) onHudUpdate({score:scoreRef.current});
      if (soundEnabled) playChime(scoreRef.current%8);
      setFb('correct');
      setTimeout(()=>nextRound(),220);
    } else {
      streakRef.current=0;
      if (soundEnabled) playErrorSound();
      setFb('incorrect');
      setTimeout(()=>nextRound(),300);
    }
  };

  const endGame=()=>{
    clearTimeout(sessionRef.current);
    const acc=attRef.current>0?Math.round(scoreRef.current/attRef.current*100):0;
    onComplete({
      score:scoreRef.current,attempts:attRef.current,accuracy_percent:acc,
      avg_speed_seconds:0,level_reached:level,
      duration_seconds:Math.round((Date.now()-gameStart.current)/1000),
      streak_in_game:maxRef.current,perfect_rounds:0,
      game_specific:{distractor_count:distCount},
    });
  };

  if (!isActive) return null;

  const cols=Math.ceil(Math.sqrt(grid.length));

  return (
    <div className="active-game-container" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:16,gap:16}}>
      <p style={{opacity:0.65,fontSize:'0.88rem',margin:0}}>Find all <strong>{target}</strong> symbols</p>
      <div style={{
        fontSize:'clamp(2.5rem,10vw,4rem)',padding:'12px 28px',
        background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:18,
        color:feedback==='correct'?'var(--color-emerald-base)':feedback==='incorrect'?'var(--color-error-coral)':'var(--text-main)',
        transition:'color 0.15s',
      }}>
        {target}
      </div>
      <div style={{
        display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,
        gap:8,maxWidth:'min(360px,86vw)',width:'100%',
      }}>
        {grid.map((sym,i)=>(
          <button key={i} onClick={()=>handleTap(sym)} style={{
            padding:'10px 4px',fontSize:'clamp(1.2rem,4vw,1.6rem)',
            background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',
            borderRadius:12,cursor:'pointer',color:'var(--text-main)',
            transition:'transform 0.1s',
          }}>
            {sym}
          </button>
        ))}
      </div>
      {maxRef.current>=3&&<div style={{color:'var(--color-emerald-base)',fontWeight:700,fontSize:'0.82rem'}}>🔥 {maxRef.current} streak</div>}
    </div>
  );
}
