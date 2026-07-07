// FILE: GamesLibraryPage.jsx
// PURPOSE: Browse & play games WITHOUT sign-in — the /brain-gym route
// AUTH: NOT REQUIRED. Guest users can browse and play.
//   Scores are NOT saved for guests. Show a "Sign in to save scores" prompt after game ends.
//
// FEATURES:
//   - Category filter tabs using HUMAN labels (not technical):
//     "Quick Reflexes" | "Remember & Recall" | "Stay Sharp" | "Think & Solve" | "Word Power" | "Sort & Prioritize"
// USAGE:
//   - Shows grid of available games.
//   - Clicking a card → navigates to /brain-gym/:gameId to launch that game
//
// GAME COMPONENTS: Import from ../games/ directory
// READ: .agents/skills/dopamind/SKILL.md → "Game Categories" table for category→game mapping
// READ: views/BrainGymView.jsx for existing game launcher patterns

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PublicLayout from '@/shared/ui/PublicLayout';
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
  { 
    id: 'speedmatch', name: "SpeedMatch", icon: "⚡", focus: "Quick Reflexes", description: "Match the current shape with the previous one.", 
    whyToPlay: "Forces rapid decision making under pressure, strengthening the neural pathways responsible for impulse control.",
    howToPlay: "Compare the current symbol to the one shown immediately before it. Decide instantly if it's a match.",
    whatWillHappen: "Your baseline processing speed will increase, making it easier to rapidly process real-world information without feeling overwhelmed.",
    Component: InteractiveGame 
  },
  { 
    id: 'focusgrid', name: "FocusGrid", icon: "🎯", focus: "Stay Sharp", description: "Find the numbers in sequence.", 
    whyToPlay: "Trains visual scanning and sustained attention, pulling you out of passive scrolling mode.",
    howToPlay: "Scan the grid and tap the numbers in ascending sequential order as fast as possible.",
    whatWillHappen: "You'll develop stronger active focus, allowing you to sustain attention on single tasks for much longer periods.",
    Component: FocusGrid 
  },
  { 
    id: 'countflow', name: "CountFlow", icon: "🔢", focus: "Think & Solve", description: "Keep a running tally.", 
    whyToPlay: "Builds mental agility and forces your brain to actively hold and manipulate numbers.",
    howToPlay: "Follow the sequence of mathematical operations on the screen and keep a running total in your head.",
    whatWillHappen: "Your working memory capacity will physically expand, helping you hold onto complex thoughts without losing track.",
    Component: CountFlow 
  },
  { 
    id: 'wordwarp', name: "WordWarp", icon: "🎨", focus: "Word Power", description: "Match colors, not words.", 
    whyToPlay: "Directly trains cognitive flexibility and conflict resolution in the brain (the Stroop effect).",
    howToPlay: "Look at the word on the screen. Tap the color of the text itself, ignoring what the word actually spells.",
    whatWillHappen: "You will become highly resistant to distraction and better at overriding automatic, impulsive behaviors.",
    Component: WordWarp 
  },
  { 
    id: 'patternpulse', name: "PatternPulse", icon: "🧩", focus: "Remember & Recall", description: "Remember the sequence.", 
    whyToPlay: "Exercises short-term spatial memory, counteracting the memory deterioration caused by endless scrolling.",
    howToPlay: "Watch the tiles light up in a specific order. Repeat the exact sequence back from memory.",
    whatWillHappen: "You will notice a sharper short-term memory and an improved ability to recall spatial relationships.",
    Component: PatternPulse 
  },
  { 
    id: 'reactiontap', name: "ReactionTap", icon: "⏱️", focus: "Quick Reflexes", description: "Tap as soon as the color changes.", 
    whyToPlay: "Isolates and trains raw reaction time and vigilance.",
    howToPlay: "Wait for the screen color to change. The moment it shifts, tap the screen as fast as humanly possible.",
    whatWillHappen: "Your baseline alertness will spike, pulling you out of lethargy and preparing your brain for active work.",
    Component: ReactionTap 
  },
  { 
    id: 'numbercascade', name: "NumberCascade", icon: "📉", focus: "Think & Solve", description: "Calculate falling numbers before they hit bottom.", 
    whyToPlay: "Combines processing speed with active problem solving under time constraints.",
    howToPlay: "Solve the math equations falling from the top of the screen before they crash into the ground.",
    whatWillHappen: "You'll build a stronger tolerance for cognitive friction, making difficult tasks feel less daunting.",
    Component: NumberCascade 
  },
  { 
    id: 'symbolmatch', name: "SymbolMatch", icon: "🔣", focus: "Remember & Recall", description: "Find matching symbols quickly.", 
    whyToPlay: "Enhances visual working memory and pattern recognition.",
    howToPlay: "Memorize the layout of hidden symbols. Tap pairs to reveal them and clear the board.",
    whatWillHappen: "Your ability to recognize patterns and hold visual information in your mind will become significantly sharper.",
    Component: SymbolMatch 
  },
  { 
    id: 'directiondash', name: "DirectionDash", icon: "⬆️", focus: "Quick Reflexes", description: "Swipe in the indicated direction.", 
    whyToPlay: "Trains cognitive inhibition and executive control by throwing curveballs at your brain.",
    howToPlay: "Swipe in the direction the arrows are pointing, but beware of trick signals that require the opposite action.",
    whatWillHappen: "Your impulse control will skyrocket, making it much easier to put your phone down when you need to.",
    Component: DirectionDash 
  },
  { 
    id: 'timeestimator', name: "TimeEstimator", icon: "⏳", focus: "Stay Sharp", description: "Stop the clock exactly at the target time.", 
    whyToPlay: "Re-calibrates your internal clock, which algorithmic feeds intentionally distort.",
    howToPlay: "A target time is given. Hit stop exactly when you feel that amount of time has passed.",
    whatWillHappen: "You will regain a healthy perception of time, completely eliminating the 'time blindness' caused by doomscrolling.",
    Component: TimeEstimator 
  },
  { 
    id: 'gravitysort', name: "GravitySort", icon: "⚖️", focus: "Sort & Prioritize", description: "Sort items as they fall.", 
    whyToPlay: "Trains rapid categorization and prioritization under pressure.",
    howToPlay: "As items fall from the top, swipe them into the correct corresponding bins before they hit the bottom.",
    whatWillHappen: "Your ability to organize thoughts and prioritize daily tasks will become much more fluid and automatic.",
    Component: GravitySort 
  },
  { 
    id: 'echomap', name: "EchoMap", icon: "🗺️", focus: "Remember & Recall", description: "Recall spatial locations.", 
    whyToPlay: "Directly engages the hippocampus, building robust spatial mapping skills.",
    howToPlay: "Locations will flash briefly on a map. Memorize them, and tap the exact spots once they disappear.",
    whatWillHappen: "You will experience heightened environmental awareness and a stronger baseline for recalling where things are.",
    Component: EchoMap 
  },
  { 
    id: 'phaselock', name: "PhaseLock", icon: "🔒", focus: "Stay Sharp", description: "Lock moving parts at the right moment.", 
    whyToPlay: "Trains anticipatory timing and sustained, pinpoint focus.",
    howToPlay: "Watch the moving elements carefully and tap to lock them into place exactly when they align.",
    whatWillHappen: "You'll develop a laser-like ability to maintain focus and execute actions precisely when needed.",
    Component: PhaseLock 
  },
  { 
    id: 'chromashift', name: "ChromaShift", icon: "🌈", focus: "Quick Reflexes", description: "Identify subtle color changes.", 
    whyToPlay: "Enhances visual discrimination and forces hyper-awareness.",
    howToPlay: "Stare at the color grid. As soon as one tile slightly changes its hue, tap it instantly.",
    whatWillHappen: "Your visual acuity and attention to subtle environmental details will drastically improve.",
    Component: ChromaShift 
  },
  { 
    id: 'weightguess', name: "WeightGuess", icon: "⚖️", focus: "Think & Solve", description: "Estimate relative weights.", 
    whyToPlay: "Engages logical deduction and comparative reasoning.",
    howToPlay: "Observe the scales and logically deduce which item is the heaviest based on the comparisons.",
    whatWillHappen: "Your logical reasoning and ability to quickly deduce conclusions from complex data will strengthen.",
    Component: WeightGuess 
  }
];

export default function GamesLibraryPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedGame, setSelectedGame] = useState(null);

  const filteredGames = activeCategory === "All" 
    ? gamesList 
    : gamesList.filter(g => g.focus === activeCategory);

  if (gameId) {
    const activeGameDef = gamesList.find(g => g.id === gameId);
    if (!activeGameDef) return <div>Game not found</div>;
    const GameComponent = activeGameDef.Component;
    return (
      <PublicLayout>
        <div className="page-container glass-panel" style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
          <button className="btn-secondary" onClick={() => navigate('/brain-gym')} style={{ marginBottom: '20px' }}>← Back to Library</button>
          <h2>{activeGameDef.icon} {activeGameDef.name}</h2>
          <p style={{ opacity: 0.8, marginBottom: '40px' }}>Playing as Guest (Scores will not be saved)</p>
          <div style={{ height: '400px', position: 'relative' }}>
            <GameComponent 
              onComplete={() => alert("Game Complete! Sign in to save scores and earn streak leaves.")} 
              difficulty={{ speedLimit: 2.5 }}
            />
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="page-container" style={{ maxWidth: '1200px', margin: '40px auto', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Brain Gym Library</h1>
        <p style={{ textAlign: 'center', marginBottom: '40px', opacity: 0.8 }}>Choose a cognitive workout. No sign-in required to play.</p>
        
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
              onClick={() => setSelectedGame(game)}
            >
              <span className="game-card-icon">{game.icon}</span>
              <h3>{game.name}</h3>
              <span className="game-card-badge">{game.focus}</span>
              <p>{game.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Game Details Popup */}
      {selectedGame && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px' }} onClick={() => setSelectedGame(null)}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '24px', position: 'relative', border: '1px solid var(--border-light)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedGame(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '2rem', lineHeight: '1', cursor: 'pointer', color: 'var(--text-secondary)', zIndex: 2 }}>×</button>
            
            <div style={{ textAlign: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '5px' }}>{selectedGame.icon}</span>
              <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: 'var(--color-emerald-deep)' }}>{selectedGame.name}</h2>
              <span className="game-card-badge" style={{ display: 'inline-block', marginBottom: '10px' }}>{selectedGame.focus}</span>
            </div>
            
            <div style={{ background: 'var(--color-oat-light)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px', textAlign: 'left', flexGrow: 1, overflowY: 'auto' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-emerald-deep)', fontSize: '1.05rem', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🧠</span> Why Play This?
                </strong>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.9 }}>{selectedGame.whyToPlay}</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-emerald-deep)', fontSize: '1.05rem', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🕹️</span> How to Play
                </strong>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.9 }}>{selectedGame.howToPlay}</p>
              </div>
              <div>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-emerald-deep)', fontSize: '1.05rem', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.2rem' }}>⚡</span> What Will Happen
                </strong>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.9 }}>{selectedGame.whatWillHappen}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
              <button className="btn-primary" onClick={() => window.location.href = '/?auth=true'} style={{ padding: '14px', fontSize: '1.1rem', width: '100%' }}>
                Sign Up & Save Progress
              </button>
              <button className="btn-secondary" onClick={() => window.location.href = `/guest/trial/braingym?play=${selectedGame.id}`} style={{ padding: '14px', fontSize: '1.1rem', width: '100%' }}>
                Try It Now (Guest)
              </button>
            </div>
          </div>
        </div>
      )}

    </PublicLayout>
  );
}
