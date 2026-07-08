// PatternPulse v3 — UGP-owned timer, pure game logic
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

const PAIRS=[
  {normal:'O',odd:'0'},{normal:'I',odd:'l'},
  {normal:'Z',odd:'2'},{normal:'S',odd:'5'},
  {normal:'B',odd:'8'},{normal:'G',odd:'6'},
  {normal:'q',odd:'g'},{normal:'n',odd:'u'},
];

export default function PatternPulse({
  isActive,onComplete,onQuit,onHudUpdate,soundEnabled,
  level=1,difficultyValue=2,sessionSeconds=120,
}) {
  const gridCount = Math.min(36, Math.max(9, (difficultyValue||2)*4));
  const cols = Math.ceil(Math.sqrt(gridCount));

  const [items, setItems]     = useState([]);
  const [oddIdx, setOddIdx]   = useState(-1);
  const [feedback, setFb]     = useState(null);

  const scoreRef   = useRef(0);
  const attRef     = useRef(0);
  const sessionRef = useRef(null);
  const gameStart  = useRef(Date.now());

  useEffect(()=>{
    if (!isActive){ clearTimeout(sessionRef.current); return; }
    scoreRef.current=0; attRef.current=0;
    gameStart.current=Date.now();
    nextGrid();
    sessionRef.current=setTimeout(()=>endGame(),sessionSeconds*1000);
    return ()=>clearTimeout(sessionRef.current);
  },[isActive,sessionSeconds]);

  const nextGrid=()=>{
    setFb(null);
    const pair=PAIRS[Math.floor(Math.random()*PAIRS.length)];
    const oi=Math.floor(Math.random()*gridCount);
    setOddIdx(oi);
    setItems(Array.from({length:gridCount},(_,i)=>i===oi?pair.odd:pair.normal));
  };

  const handleTap=(i)=>{
    if (feedback) return;
    attRef.current++;
    if (i===oddIdx){
      scoreRef.current++;
      if (onHudUpdate) onHudUpdate({score:scoreRef.current});
      if (soundEnabled) playChime(scoreRef.current%8);
      setFb('correct');
      setTimeout(()=>nextGrid(),220);
    } else {
      if (soundEnabled) playErrorSound();
      setFb('incorrect');
      setTimeout(()=>endGame(),400);
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
      game_specific:{grid_size:gridCount},
    });
  };

  if (!isActive) return null;

  return (
    <div className="active-game-container" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:16,gap:14}}>
      <p style={{opacity:0.65,fontSize:'0.88rem',margin:0}}>Tap the <strong>ODD one</strong> out</p>
      <div style={{
        display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,
        gap:6,maxWidth:'min(380px,88vw)',width:'100%',
        background:feedback==='correct'?'rgba(16,185,129,0.06)':feedback==='incorrect'?'rgba(239,68,68,0.06)':'transparent',
        borderRadius:16,padding:8,transition:'background 0.15s',
      }}>
        {items.map((ch,i)=>(
          <button key={i} onClick={()=>handleTap(i)} style={{
            padding:'6px 2px',fontSize:'clamp(1rem,3vw,1.4rem)',fontWeight:700,
            background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',
            borderRadius:10,cursor:'pointer',color:'var(--text-main)',
            fontFamily:'monospace',
          }}>
            {ch}
          </button>
        ))}
      </div>
      <div style={{opacity:0.4,fontSize:'0.75rem'}}>Score: {scoreRef.current}</div>
    </div>
  );
}
