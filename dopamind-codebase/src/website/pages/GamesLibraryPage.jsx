// FILE: GamesLibraryPage.jsx
// PURPOSE: Browse & play games WITHOUT sign-in — the /play route
// AUTH: NOT REQUIRED. Guest users can browse and play.
//   Scores are NOT saved for guests. Show a "Sign in to save scores" prompt after game ends.
//
// FEATURES:
//   - Category filter tabs using HUMAN labels (not technical):
//     "Quick Reflexes" | "Remember & Recall" | "Stay Sharp" | "Think & Solve" | "Word Power" | "Sort & Prioritize"
//   - Game cards in a responsive grid (reuse glass-card styling from App.css)
//   - Clicking a card → navigates to /play/:gameId to launch that game
//
// GAME COMPONENTS: Import from ../games/ directory
// READ: .agents/skills/dopamind/SKILL.md → "Game Categories" table for category→game mapping
// READ: views/BrainGymView.jsx for existing game launcher patterns

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InteractiveGame from '@/app/games/core_engine/InteractiveGame';
import FocusGrid from '@/app/games/library/FocusGrid';
import CountFlow from '@/app/games/library/CountFlow';
import WordWarp from '@/app/games/library/WordWarp';
import PatternPulse from '@/app/games/library/PatternPulse';
import ReactionTap from '@/app/games/library/ReactionTap';
import NumberCascade from '@/app/games/library/NumberCascade';
import SymbolMatch from '@/app/games/library/SymbolMatch';
import DirectionDash from '@/app/games/library/DirectionDash';
import TimeEstimator from '@/app/games/library/TimeEstimator';
import GravitySort from '@/app/games/library/GravitySort';
import EchoMap from '@/app/games/library/EchoMap';
import PhaseLock from '@/app/games/library/PhaseLock';
import ChromaShift from '@/app/games/library/ChromaShift';
import WeightGuess from '@/app/games/library/WeightGuess';

const categories = ["All", "Quick Reflexes", "Remember & Recall", "Stay Sharp", "Think & Solve", "Word Power", "Sort & Prioritize"];

const gamesList = [
  { id: 'speedmatch', name: "SpeedMatch", icon: "⚡", focus: "Quick Reflexes", description: "Match the current shape with the previous one. Trains processing speed.", Component: InteractiveGame },
  { id: 'focusgrid', name: "FocusGrid", icon: "🎯", focus: "Stay Sharp", description: "Find the numbers in sequence. Trains spatial memory.", Component: FocusGrid },
  { id: 'countflow', name: "CountFlow", icon: "🔢", focus: "Think & Solve", description: "Keep a running tally. Trains mental agility.", Component: CountFlow },
  { id: 'wordwarp', name: "WordWarp", icon: "🎨", focus: "Word Power", description: "Match colors, not words. Trains cognitive flexibility.", Component: WordWarp },
  { id: 'patternpulse', name: "PatternPulse", icon: "🧩", focus: "Remember & Recall", description: "Remember the sequence. Trains working memory.", Component: PatternPulse },
  { id: 'reactiontap', name: "ReactionTap", icon: "⏱️", focus: "Quick Reflexes", description: "Tap as soon as the color changes.", Component: ReactionTap },
  { id: 'numbercascade', name: "NumberCascade", icon: "📉", focus: "Think & Solve", description: "Calculate falling numbers before they hit bottom.", Component: NumberCascade },
  { id: 'symbolmatch', name: "SymbolMatch", icon: "🔣", focus: "Remember & Recall", description: "Find matching symbols quickly.", Component: SymbolMatch },
  { id: 'directiondash', name: "DirectionDash", icon: "⬆️", focus: "Quick Reflexes", description: "Swipe in the indicated direction.", Component: DirectionDash },
  { id: 'timeestimator', name: "TimeEstimator", icon: "⏳", focus: "Stay Sharp", description: "Stop the clock exactly at the target time.", Component: TimeEstimator },
  { id: 'gravitysort', name: "GravitySort", icon: "⚖️", focus: "Sort & Prioritize", description: "Sort items as they fall.", Component: GravitySort },
  { id: 'echomap', name: "EchoMap", icon: "🗺️", focus: "Remember & Recall", description: "Recall spatial locations.", Component: EchoMap },
  { id: 'phaselock', name: "PhaseLock", icon: "🔒", focus: "Stay Sharp", description: "Lock moving parts at the right moment.", Component: PhaseLock },
  { id: 'chromashift', name: "ChromaShift", icon: "🌈", focus: "Quick Reflexes", description: "Identify subtle color changes.", Component: ChromaShift },
  { id: 'weightguess', name: "WeightGuess", icon: "⚖️", focus: "Think & Solve", description: "Estimate relative weights.", Component: WeightGuess }
];

export default function GamesLibraryPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredGames = activeCategory === "All" 
    ? gamesList 
    : gamesList.filter(g => g.focus === activeCategory);

  if (gameId) {
    const activeGameDef = gamesList.find(g => g.id === gameId);
    if (!activeGameDef) return <div>Game not found</div>;
    const GameComponent = activeGameDef.Component;
    return (
      <div className="page-container glass-panel" style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
        <button className="btn-secondary" onClick={() => navigate('/play')} style={{ marginBottom: '20px' }}>← Back to Library</button>
        <h2>{activeGameDef.icon} {activeGameDef.name}</h2>
        <p style={{ opacity: 0.8, marginBottom: '40px' }}>Playing as Guest (Scores will not be saved)</p>
        <div style={{ height: '400px', position: 'relative' }}>
          <GameComponent 
            onComplete={() => alert("Game Complete! Sign in to save scores and earn streak leaves.")} 
            difficulty={{ speedLimit: 2.5 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '40px auto', padding: '40px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Brain Gym Library</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', opacity: 0.8 }}>Choose a 45-second workout. No sign-in required to play.</p>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`btn-secondary ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            style={{ opacity: activeCategory === cat ? 1 : 0.6 }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="games-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredGames.map((game) => (
          <div 
            key={game.id} 
            className="glass-card game-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/play/${game.id}`)}
          >
            <span className="game-card-icon">{game.icon}</span>
            <h3>{game.name}</h3>
            <span className="game-card-badge">{game.focus}</span>
            <p>{game.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
