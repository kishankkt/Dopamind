// ChromaShift v4 — Color mixing estimation. UGP-owned timer. Non-scrolling UI.
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

// Show a mixed color, user picks which base color is dominant
const COLORS = [
  { name: 'Red',    h: 0   },
  { name: 'Orange', h: 30  },
  { name: 'Yellow', h: 60  },
  { name: 'Green',  h: 120 },
  { name: 'Cyan',   h: 180 },
  { name: 'Blue',   h: 240 },
  { name: 'Purple', h: 280 },
  { name: 'Pink',   h: 320 },
];

export default function ChromaShift({
  isActive, onComplete, onQuit, onHudUpdate, soundEnabled,
  level=1, difficultyValue=3, sessionSeconds=120,
}) {
  const optionCount = Math.min(Math.max(Math.floor(difficultyValue), 2), 8);
  const [targetColor, setTarget] = useState(null);
  const [options, setOptions]    = useState([]);
  const [feedback, setFb]        = useState(null);

  const scoreRef   = useRef(0);
  const attRef     = useRef(0);
  const streakRef  = useRef(0);
  const maxRef     = useRef(0);
  const sessionRef = useRef(null);
  const gameStart  = useRef(Date.now());

  useEffect(()=>{
    if (!isActive){ clearTimeout(sessionRef.current); return; }
    scoreRef.current=0; attRef.current=0; streakRef.current=0; maxRef.current=0;
    gameStart.current=Date.now();
    nextRound();
    sessionRef.current=setTimeout(()=>endGame(), sessionSeconds*1000);
    return ()=>clearTimeout(sessionRef.current);
  },[isActive, sessionSeconds]);

  const nextRound = ()=>{
    setFb(null);
    const correct = COLORS[Math.floor(Math.random()*COLORS.length)];
    // Shift hue slightly so it's not 100% obvious
    const shift = (Math.random()-0.5) * 30;
    const sat = 55 + Math.floor(Math.random()*35);
    const lit = 45 + Math.floor(Math.random()*20);
    const displayHue = ((correct.h + shift) + 360) % 360;
    setTarget({ ...correct, displayHsl: `hsl(${displayHue},${sat}%,${lit}%)` });

    // Pick options — include correct + random distractors
    const pool = [...COLORS].sort(() => Math.random()-0.5);
    const opts = [correct];
    for (const c of pool) {
      if (opts.length >= optionCount) break;
      if (!opts.find(o=>o.name===c.name)) opts.push(c);
    }
    setOptions(opts.sort(()=>Math.random()-0.5));
  };

  const handlePick = (name)=>{
    if (feedback) return;
    attRef.current++;
    if (name === targetColor?.name){
      scoreRef.current++;
      streakRef.current++;
      maxRef.current=Math.max(maxRef.current,streakRef.current);
      if (onHudUpdate) onHudUpdate({score:scoreRef.current});
      if (soundEnabled) playChime(scoreRef.current%8);
      setFb('correct');
    } else {
      streakRef.current=0;
      if (soundEnabled) playErrorSound();
      setFb('incorrect');
    }
    setTimeout(()=>nextRound(),300);
  };

  const endGame = ()=>{
    clearTimeout(sessionRef.current);
    const acc = attRef.current>0?Math.round(scoreRef.current/attRef.current*100):0;
    onComplete({
      score:scoreRef.current, attempts:attRef.current, accuracy_percent:acc,
      avg_speed_seconds:0, level_reached:level,
      duration_seconds:Math.round((Date.now()-gameStart.current)/1000),
      streak_in_game:maxRef.current, perfect_rounds:0,
      game_specific:{option_count:optionCount},
    });
  };

  if (!isActive||!targetColor) return null;

  const cols = optionCount <= 4 ? 2 : optionCount <= 6 ? 3 : 4;

  return (
    <div className="active-game-container" style={{
      display:'flex',flexDirection:'column',alignItems:'center',
      justifyContent:'center',flex:1,padding:16,gap:16,
      overflow:'hidden', // no scroll
    }}>
      <p style={{opacity:0.65,fontSize:'0.88rem',margin:0}}>
        What color is closest to this?
      </p>

      {/* Color swatch */}
      <div style={{
        width:'min(160px,40vw)', height:'min(120px,30vw)',
        borderRadius:20,
        background:targetColor.displayHsl,
        border:`3px solid ${feedback==='correct'?'var(--color-emerald-base)':feedback==='incorrect'?'var(--color-error-coral)':'rgba(255,255,255,0.1)'}`,
        boxShadow:`0 8px 40px ${targetColor.displayHsl}66`,
        transition:'border 0.15s',flexShrink:0,
      }}/>

      {/* Options */}
      <div style={{
        display:'grid',
        gridTemplateColumns:`repeat(${cols},1fr)`,
        gap:8,
        width:'min(360px,88vw)',
      }}>
        {options.map((c,i)=>(
          <button key={i} onClick={()=>handlePick(c.name)} style={{
            padding:'10px 6px',
            borderRadius:12,
            background:`hsl(${c.h},60%,50%)`,
            border:'2px solid transparent',
            cursor:'pointer',
            color:'white',
            fontWeight:800,
            fontSize:'clamp(0.75rem,2.5vw,0.9rem)',
            textShadow:'0 1px 4px rgba(0,0,0,0.5)',
            transition:'transform 0.1s',
            boxShadow:'0 3px 12px rgba(0,0,0,0.25)',
          }}>
            {c.name}
          </button>
        ))}
      </div>

      {maxRef.current>=3&&<div style={{color:'var(--color-emerald-base)',fontWeight:700,fontSize:'0.82rem'}}>🔥 {maxRef.current} streak</div>}
    </div>
  );
}
