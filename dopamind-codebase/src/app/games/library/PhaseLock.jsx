// PhaseLock v3 — UGP-owned timer, rotating rings tap-to-align game
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playChime, playErrorSound } from '@/app/core/audio/SynthEngine';

const RINGS=[{r:120,w:14},{r:85,w:12},{r:52,w:10}];
const GATE=0.35; // radians gate width

export default function PhaseLock({
  isActive,onComplete,onQuit,onHudUpdate,soundEnabled,
  level=1,difficultyValue=1,sessionSeconds=300,
}) {
  const [angles,setAngles]=useState([0,Math.PI,Math.PI/2]);
  const [feedback,setFb]=useState(null); // 'hit'|'miss'
  const [lv,setLv]=useState(1);

  const scoreRef=useRef(0);
  const mistRef=useRef(0);
  const sessionRef=useRef(null);
  const frameRef=useRef(null);
  const anglesRef=useRef([0,Math.PI,Math.PI/2]);
  const speedsRef=useRef([]);
  const lvRef=useRef(1);
  const gameStart=useRef(Date.now());
  const gameOverRef=useRef(false);
  const svgRef=useRef(null);

  const initSpeeds=(lv)=>{
    const base=0.018*(difficultyValue||1);
    speedsRef.current=[base*(1+lv*0.1),-base*0.7*(1+lv*0.08),base*0.55*(1+lv*0.06)];
  };

  useEffect(()=>{
    if (!isActive){ cancelAnimationFrame(frameRef.current); clearTimeout(sessionRef.current); return; }
    scoreRef.current=0; mistRef.current=0; lvRef.current=1;
    anglesRef.current=[0,Math.PI,Math.PI/2];
    gameOverRef.current=false;
    gameStart.current=Date.now();
    initSpeeds(1); setLv(1); setFb(null);

    const animate=()=>{
      if (gameOverRef.current) return;
      anglesRef.current=anglesRef.current.map((a,i)=>(a+speedsRef.current[i]+Math.PI*2)%(Math.PI*2));
      setAngles([...anglesRef.current]);
      frameRef.current=requestAnimationFrame(animate);
    };
    frameRef.current=requestAnimationFrame(animate);
    sessionRef.current=setTimeout(()=>endGame(),sessionSeconds*1000);
    return ()=>{ cancelAnimationFrame(frameRef.current); clearTimeout(sessionRef.current); };
  },[isActive,sessionSeconds]);

  const isAligned=(a)=>Math.abs(a%(Math.PI*2))<GATE||(Math.PI*2-a%(Math.PI*2))<GATE;

  const handleTap=useCallback(()=>{
    if (gameOverRef.current) return;
    const hit=anglesRef.current.every(isAligned);
    if (hit){
      scoreRef.current++;
      lvRef.current++;
      setLv(lvRef.current);
      initSpeeds(lvRef.current);
      if (onHudUpdate) onHudUpdate({score:scoreRef.current});
      if (soundEnabled) playChime(scoreRef.current%8);
      setFb('hit');
      setTimeout(()=>setFb(null),300);
    } else {
      mistRef.current++;
      if (soundEnabled) playErrorSound();
      setFb('miss');
      setTimeout(()=>setFb(null),300);
      if (mistRef.current>=3){
        gameOverRef.current=true;
        endGame();
      }
    }
  },[onHudUpdate,soundEnabled]);

  const endGame=()=>{
    cancelAnimationFrame(frameRef.current);
    clearTimeout(sessionRef.current);
    const total=scoreRef.current+mistRef.current;
    onComplete({
      score:scoreRef.current,attempts:total,
      accuracy_percent:total>0?Math.round(scoreRef.current/total*100):0,
      avg_speed_seconds:0,level_reached:level,
      duration_seconds:Math.round((Date.now()-gameStart.current)/1000),
      streak_in_game:scoreRef.current,perfect_rounds:scoreRef.current,
      game_specific:{rings_level:lvRef.current},
    });
  };

  if (!isActive) return null;

  const SIZE=280;
  const cx=SIZE/2, cy=SIZE/2;

  const ringColor=(i)=>feedback==='hit'?'#10b981':feedback==='miss'?'#ef4444':['#3b82f6','#c084fc','#f97316'][i];

  return (
    <div className="active-game-container" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,padding:16,gap:16}}>
      <p style={{opacity:0.65,fontSize:'0.88rem',margin:0}}>Align all rings and <strong>TAP!</strong></p>
      <svg ref={svgRef} width={SIZE} height={SIZE} style={{cursor:'pointer'}} onClick={handleTap}>
        {/* Gate indicator at top */}
        {RINGS.map((ring,i)=>{
          const a=angles[i]||0;
          const x=cx+ring.r*Math.sin(a);
          const y=cy-ring.r*Math.cos(a);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={ring.r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={ring.w}/>
              {/* Gate at top */}
              <path d={`M ${cx} ${cy-ring.r-ring.w/2} A ${ring.r} ${ring.r} 0 0 1 ${cx+0.001} ${cy-ring.r-ring.w/2}`} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={ring.w} strokeLinecap="round"/>
              {/* Marker */}
              <circle cx={x} cy={y} r={ring.w/2+2} fill={ringColor(i)} style={{transition:'fill 0.15s'}}/>
            </g>
          );
        })}
        {/* Center button */}
        <circle cx={cx} cy={cy} r={26} fill={feedback==='hit'?'rgba(16,185,129,0.3)':feedback==='miss'?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.06)'} stroke="var(--border)" strokeWidth={2} style={{transition:'fill 0.15s'}}/>
        <text x={cx} y={cy+6} textAnchor="middle" fill="var(--text-main)" fontSize={18} fontWeight={900}>TAP</text>
      </svg>
      <div style={{opacity:0.5,fontSize:'0.8rem'}}>Level {lv} &nbsp;|&nbsp; {3-mistRef.current} lives left</div>
    </div>
  );
}
