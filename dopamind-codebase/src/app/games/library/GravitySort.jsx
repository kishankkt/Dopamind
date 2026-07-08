// GravitySort v3 — UGP-owned timer, falling orbs sorted by number
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

export default function GravitySort({
  isActive,onComplete,onQuit,onHudUpdate,soundEnabled,
  level=1,difficultyValue=40,sessionSeconds=300,
}) {
  const [orbs,setOrbs]=useState([]);
  const [nextExp,setNextExp]=useState(1);
  const [wave,setWave]=useState(1);
  const [combo,setCombo]=useState(0);
  const [gameOver,setGameOver]=useState(false);

  const scoreRef=useRef(0);
  const mistRef=useRef(0);
  const waveRef=useRef(1);
  const nextExpRef=useRef(1);
  const orbId=useRef(0);
  const frameRef=useRef(null);
  const sessionRef=useRef(null);
  const containerRef=useRef(null);
  const gameOverRef=useRef(false);
  const gameStart=useRef(Date.now());

  const fallSpeed = (difficultyValue||40) / 1000; // % height per ms

  useEffect(()=>{
    if (!isActive){ cancelAnimationFrame(frameRef.current); clearTimeout(sessionRef.current); return; }
    scoreRef.current=0; mistRef.current=0; waveRef.current=1; nextExpRef.current=1;
    gameOverRef.current=false;
    setOrbs([]); setNextExp(1); setWave(1); setCombo(0); setGameOver(false);
    gameStart.current=Date.now();

    setTimeout(()=>spawnWave(1),300);
    sessionRef.current=setTimeout(()=>triggerEnd(),sessionSeconds*1000);

    const animate=(ts)=>{
      if (gameOverRef.current) return;
      setOrbs(prev=>{
        const updated=prev.map(o=>{
          if (!o.alive) return o;
          const h=containerRef.current?.clientHeight||500;
          const elapsed=ts-o.spawnTs;
          const y=elapsed*fallSpeed*(h/100);
          if (y>h){ // missed — game over
            if (!gameOverRef.current){
              gameOverRef.current=true;
              setTimeout(()=>triggerEnd(),100);
            }
            return {...o,alive:false};
          }
          return {...o,y};
        });
        return updated;
      });
      frameRef.current=requestAnimationFrame(animate);
    };
    frameRef.current=requestAnimationFrame(animate);

    return ()=>{ cancelAnimationFrame(frameRef.current); clearTimeout(sessionRef.current); };
  },[isActive,sessionSeconds]);

  const spawnWave=useCallback((w)=>{
    const count=3+w;
    const newOrbs=Array.from({length:count},(_,i)=>({
      id:orbId.current++,
      num:i+1,
      alive:true,
      x:10+Math.random()*75,
      y:0,
      spawnTs:performance.now()+i*600,
    }));
    setOrbs(newOrbs);
    nextExpRef.current=1;
    setNextExp(1);
  },[]);

  const handleOrb=(orb)=>{
    if (!orb.alive||gameOverRef.current) return;
    if (orb.num===nextExpRef.current){
      scoreRef.current++;
      if (onHudUpdate) onHudUpdate({score:scoreRef.current});
      if (soundEnabled) playChime(scoreRef.current%8);
      setCombo(c=>c+1);
      setOrbs(p=>p.map(o=>o.id===orb.id?{...o,alive:false}:o));
      nextExpRef.current++;
      setNextExp(nextExpRef.current);
      // Check if wave clear
      setTimeout(()=>{
        setOrbs(p=>{
          if (p.filter(o=>o.alive).length===0){
            const nw=waveRef.current+1;
            waveRef.current=nw;
            setWave(nw);
            setTimeout(()=>spawnWave(nw),500);
          }
          return p;
        });
      },100);
    } else {
      mistRef.current++;
      setCombo(0);
      if (soundEnabled) playErrorSound();
      gameOverRef.current=true;
      setTimeout(()=>triggerEnd(),200);
    }
  };

  const triggerEnd=()=>{
    cancelAnimationFrame(frameRef.current);
    clearTimeout(sessionRef.current);
    gameOverRef.current=true;
    setGameOver(true);
  };

  useEffect(()=>{
    if (!gameOver) return;
    const total=scoreRef.current+mistRef.current;
    onComplete({
      score:scoreRef.current,attempts:total,
      accuracy_percent:total>0?Math.round(scoreRef.current/total*100):0,
      avg_speed_seconds:0,level_reached:level,
      duration_seconds:Math.round((Date.now()-gameStart.current)/1000),
      streak_in_game:scoreRef.current,perfect_rounds:0,
      game_specific:{wave_reached:waveRef.current,fall_speed:difficultyValue},
    });
  },[gameOver]);

  if (!isActive) return null;

  return (
    <div className="active-game-container" style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      <div style={{padding:'6px 16px',display:'flex',justifyContent:'space-between',opacity:0.7,fontSize:'0.82rem'}}>
        <span>Wave {wave}</span>
        <span>Tap: <strong style={{color:'var(--color-accent-gold)'}}>{nextExp}</strong></span>
        {combo>=2&&<span style={{color:'var(--color-emerald-base)'}}>×{combo} combo</span>}
      </div>
      <div ref={containerRef} style={{flex:1,position:'relative',overflow:'hidden',background:'rgba(0,0,0,0.1)',borderRadius:16,margin:'0 8px 8px'}}>
        {orbs.filter(o=>o.alive).map(orb=>(
          <button key={orb.id} onClick={()=>handleOrb(orb)} style={{
            position:'absolute',
            left:`${orb.x}%`,top:`${orb.y||0}px`,
            transform:'translate(-50%,-50%)',
            width:'min(52px,13vw)',height:'min(52px,13vw)',
            borderRadius:'50%',
            background:`hsl(${orb.num*37},70%,55%)`,
            border:'2px solid rgba(255,255,255,0.2)',
            fontSize:'clamp(0.9rem,3vw,1.2rem)',fontWeight:900,
            color:'white',cursor:'pointer',
            boxShadow:'0 4px 16px rgba(0,0,0,0.3)',
            transition:'transform 0.1s',
          }}>
            {orb.num}
          </button>
        ))}
        {gameOver&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)',borderRadius:16,fontSize:'1.5rem',fontWeight:900,color:'var(--text-main)'}}>
          Wave {wave} — {scoreRef.current} sorted
        </div>}
      </div>
    </div>
  );
}
