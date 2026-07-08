// WeightGuess v3 — UGP-owned timer, weight comparison estimation game
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

export default function WeightGuess({
  isActive,onComplete,onQuit,onHudUpdate,soundEnabled,
  level=1,difficultyValue=30,sessionSeconds=120,
}) {
  const [itemA,setA]=useState(null);
  const [itemB,setB]=useState(null);
  const [feedback,setFb]=useState(null);

  const scoreRef=useRef(0);
  const attRef=useRef(0);
  const streakRef=useRef(0);
  const maxRef=useRef(0);
  const sessionRef=useRef(null);
  const gameStart=useRef(Date.now());

  const ITEMS=[
    {name:'Feather',emoji:'🪶',weight:0.01},
    {name:'Pencil',emoji:'✏️',weight:0.12},
    {name:'Phone',emoji:'📱',weight:0.18},
    {name:'Mug',emoji:'☕',weight:0.35},
    {name:'Book',emoji:'📚',weight:0.8},
    {name:'Laptop',emoji:'💻',weight:2.1},
    {name:'Backpack',emoji:'🎒',weight:5},
    {name:'Watermelon',emoji:'🍉',weight:8},
    {name:'Suitcase',emoji:'🧳',weight:22},
    {name:'Bike',emoji:'🚲',weight:14},
    {name:'Dog',emoji:'🐕',weight:30},
    {name:'Fridge',emoji:'🧊',weight:70},
  ];

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
    let idx1=Math.floor(Math.random()*ITEMS.length);
    let idx2=Math.floor(Math.random()*ITEMS.length);
    while (idx2===idx1) idx2=Math.floor(Math.random()*ITEMS.length);
    setA(ITEMS[idx1]);
    setB(ITEMS[idx2]);
  };

  const handleChoice=(choice)=>{
    if (!itemA||!itemB||feedback) return;
    attRef.current++;
    const correct=choice==='A'?itemA.weight>itemB.weight:itemB.weight>itemA.weight;
    if (correct){
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
    setTimeout(()=>nextRound(),600);
  };

  const endGame=()=>{
    clearTimeout(sessionRef.current);
    const acc=attRef.current>0?Math.round(scoreRef.current/attRef.current*100):0;
    onComplete({
      score:scoreRef.current,attempts:attRef.current,accuracy_percent:acc,
      avg_speed_seconds:0,level_reached:level,
      duration_seconds:Math.round((Date.now()-gameStart.current)/1000),
      streak_in_game:maxRef.current,perfect_rounds:0,
      game_specific:{},
    });
  };

  if (!isActive||!itemA||!itemB) return null;

  return (
    <div className="active-game-container" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:16,gap:20}}>
      <p style={{opacity:0.65,fontSize:'0.88rem',margin:0}}>Which is <strong>heavier</strong>?</p>

      <div style={{display:'flex',gap:16,width:'100%',maxWidth:'min(380px,90vw)'}}>
        {[{item:itemA,side:'A'},{item:itemB,side:'B'}].map(({item,side})=>(
          <button key={side} onClick={()=>handleChoice(side)} style={{
            flex:1,padding:'20px 12px',
            borderRadius:20,cursor:'pointer',
            background:feedback==='correct'&&((side==='A'&&itemA.weight>itemB.weight)||(side==='B'&&itemB.weight>itemA.weight))
              ?'rgba(16,185,129,0.12)':feedback==='incorrect'&&((side==='A'&&itemA.weight>itemB.weight)||(side==='B'&&itemB.weight>itemA.weight))
                ?'rgba(239,68,68,0.08)':'rgba(255,255,255,0.04)',
            border:`2px solid ${feedback?((side==='A'&&itemA.weight>itemB.weight)||(side==='B'&&itemB.weight>itemA.weight))?'var(--color-emerald-base)':'var(--border)':'var(--border)'}`,
            display:'flex',flexDirection:'column',alignItems:'center',gap:10,
            transition:'all 0.15s',color:'var(--text-main)',
          }}>
            <span style={{fontSize:'clamp(2.5rem,10vw,4rem)'}}>{item.emoji}</span>
            <span style={{fontWeight:700,fontSize:'clamp(0.85rem,2.5vw,1rem)'}}>{item.name}</span>
          </button>
        ))}
      </div>

      {feedback&&<div style={{
        fontWeight:700,fontSize:'0.9rem',
        color:feedback==='correct'?'var(--color-emerald-base)':'var(--color-error-coral)',
      }}>
        {feedback==='correct'?'✓ Correct!':'✗ Wrong — '}
        {feedback==='incorrect'&&`${itemA.weight>itemB.weight?itemA.name:itemB.name} is heavier`}
      </div>}

      {maxRef.current>=3&&<div style={{color:'var(--color-emerald-base)',fontWeight:700,fontSize:'0.82rem'}}>🔥 {maxRef.current} streak</div>}
    </div>
  );
}
