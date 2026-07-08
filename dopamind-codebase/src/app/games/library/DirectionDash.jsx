// DirectionDash v3 — UGP-owned timer, pure game logic
import React, { useState, useEffect, useRef } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

const DIRS = ['UP','DOWN','LEFT','RIGHT'];
const ICON = { UP:'⬆️', DOWN:'⬇️', LEFT:'⬅️', RIGHT:'➡️' };
const OPP  = { UP:'DOWN', DOWN:'UP', LEFT:'RIGHT', RIGHT:'LEFT' };

export default function DirectionDash({
  isActive, onComplete, onQuit, onHudUpdate, soundEnabled,
  level=1, difficultyValue=0, sessionSeconds=45,
}) {
  const [arrow, setArrow] = useState(null);   // { dir, reverse }
  const [flash, setFlash] = useState(null);   // 'correct' | 'incorrect'

  const scoreRef    = useRef(0);
  const mistakesRef = useRef(0);
  const streakRef   = useRef(0);
  const maxRef      = useRef(0);
  const sessionRef  = useRef(null);
  const gameStart   = useRef(Date.now());

  useEffect(() => {
    if (!isActive) { clearTimeout(sessionRef.current); return; }
    scoreRef.current=0; mistakesRef.current=0; streakRef.current=0; maxRef.current=0;
    gameStart.current = Date.now();
    nextArrow();
    sessionRef.current = setTimeout(()=>endGame(), sessionSeconds*1000);
    return ()=>clearTimeout(sessionRef.current);
  }, [isActive, sessionSeconds]);

  const nextArrow = () => {
    const dir = DIRS[Math.floor(Math.random()*DIRS.length)];
    const reverse = Math.random() < (difficultyValue||0);
    setArrow({ dir, reverse });
    setFlash(null);
  };

  const handle = (input) => {
    if (!arrow) return;
    const expected = arrow.reverse ? OPP[arrow.dir] : arrow.dir;
    if (input === expected) {
      scoreRef.current++;
      streakRef.current++;
      maxRef.current = Math.max(maxRef.current, streakRef.current);
      if (onHudUpdate) onHudUpdate({ score: scoreRef.current });
      if (soundEnabled) playChime(scoreRef.current % 8);
      setFlash('correct');
    } else {
      mistakesRef.current++;
      streakRef.current = 0;
      if (soundEnabled) playErrorSound();
      setFlash('incorrect');
    }
    setTimeout(()=>nextArrow(), 160);
  };

  useEffect(()=>{
    const fn = (e)=>{
      if (!isActive) return;
      const m={ArrowUp:'UP',ArrowDown:'DOWN',ArrowLeft:'LEFT',ArrowRight:'RIGHT'};
      if (m[e.key]){ e.preventDefault(); handle(m[e.key]); }
    };
    window.addEventListener('keydown',fn);
    return ()=>window.removeEventListener('keydown',fn);
  },[isActive,arrow]);

  const endGame = ()=>{
    clearTimeout(sessionRef.current);
    const total = scoreRef.current+mistakesRef.current;
    onComplete({
      score:scoreRef.current, attempts:total,
      accuracy_percent: total>0?Math.round(scoreRef.current/total*100):0,
      avg_speed_seconds:0, level_reached:level,
      duration_seconds:Math.round((Date.now()-gameStart.current)/1000),
      streak_in_game:maxRef.current, perfect_rounds:0,
      game_specific:{flip_prob:difficultyValue},
    });
  };

  if (!isActive) return null;

  return (
    <div className="active-game-container" style={{
      display:'flex',flexDirection:'column',alignItems:'center',
      justifyContent:'center',flex:1,padding:16,gap:20,
      background: flash==='correct'?'rgba(16,185,129,0.08)':flash==='incorrect'?'rgba(239,68,68,0.08)':'transparent',
      transition:'background 0.15s',
    }}>
      {arrow && (
        <div style={{
          fontSize:'clamp(4rem,16vw,7rem)',
          filter:arrow.reverse?'drop-shadow(0 0 18px rgba(239,68,68,0.6))':'none',
        }}>
          {ICON[arrow.dir]}
          {arrow.reverse && <div style={{fontSize:'0.75rem',color:'var(--color-error-coral)',fontWeight:900,textAlign:'center',marginTop:-8}}>REVERSE!</div>}
        </div>
      )}
      <p style={{opacity:0.6,fontSize:'0.85rem',margin:0,textAlign:'center'}}>
        {arrow?.reverse?<><strong style={{color:'var(--color-error-coral)'}}>REVERSE</strong> — tap opposite direction</>:'Tap the matching direction'}
      </p>
      {/* D-pad */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,maxWidth:'min(240px,65vw)'}}>
        <span/><button onClick={()=>handle('UP')} style={btnStyle}>⬆️</button><span/>
        <button onClick={()=>handle('LEFT')} style={btnStyle}>⬅️</button>
        <button onClick={()=>handle('DOWN')} style={btnStyle}>⬇️</button>
        <button onClick={()=>handle('RIGHT')} style={btnStyle}>➡️</button>
      </div>
      {maxRef.current>=3 && <div style={{color:'var(--color-emerald-base)',fontWeight:700,fontSize:'0.82rem'}}>🔥 {maxRef.current} streak</div>}
    </div>
  );
}

const btnStyle = {
  height:'min(68px,17vw)',fontSize:'clamp(1.3rem,4vw,2rem)',
  background:'rgba(255,255,255,0.05)',border:'1px solid var(--border)',
  borderRadius:14,cursor:'pointer',
};
