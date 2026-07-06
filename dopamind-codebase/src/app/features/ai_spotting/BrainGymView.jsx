import { 
  Zap, Target, Hash, Palette, Puzzle, 
  Activity, Layers, Eye, Compass, Timer, 
  ArrowDown, Radio, Lock, Sliders, Scale 
} from 'lucide-react';

export default function BrainGymView({ onPlayGame }) {
  const gamesList = [
    { id: 'speedmatch', name: "SpeedMatch", icon: <Zap />, focus: "Quick Reflexes", description: "Match the current shape with the previous one. Trains processing speed." },
    { id: 'focusgrid', name: "FocusGrid", icon: <Target />, focus: "Stay Sharp", description: "Find the numbers in sequence. Trains spatial memory." },
    { id: 'countflow', name: "CountFlow", icon: <Hash />, focus: "Think & Solve", description: "Keep a running tally. Trains mental agility." },
    { id: 'wordwarp', name: "WordWarp", icon: <Palette />, focus: "Word Power", description: "Match colors, not words. Trains cognitive flexibility." },
    { id: 'patternpulse', name: "PatternPulse", icon: <Puzzle />, focus: "Remember & Recall", description: "Remember the sequence. Trains working memory." },
    { id: 'reactiontap', name: "ReactionTap", icon: <Activity />, focus: "Quick Reflexes", description: "Tap the targets as fast as they appear. Trains basic reaction time." },
    { id: 'numbercascade', name: "NumberCascade", icon: <Layers />, focus: "Think & Solve", description: "Remember the sequence of numbers. Trains numerical working memory." },
    { id: 'symbolmatch', name: "SymbolMatch", icon: <Eye />, focus: "Stay Sharp", description: "Match complex symbols under time pressure. Trains visual focus." },
    { id: 'directiondash', name: "DirectionDash", icon: <Compass />, focus: "Quick Reflexes", description: "Swipe or press keys matching indicators. Trains speed-accuracy tradeoff." },
    { id: 'timeestimator', name: "TimeEstimator", icon: <Timer />, focus: "Think & Solve", description: "Estimate the exact passing of time intervals. Trains internal clocking." },
    { id: 'gravitysort', name: "GravitySort", icon: <ArrowDown />, focus: "Sort & Prioritize", description: "Sort dropping elements by category. Trains cognitive sorting speed." },
    { id: 'echomap', name: "EchoMap", icon: <Radio />, focus: "Remember & Recall", description: "Repeat visual and auditory memory paths. Trains spatial recall." },
    { id: 'phaselock', name: "PhaseLock", icon: <Lock />, focus: "Remember & Recall", description: "Sync rotating puzzle phases into alignment. Trains temporal coordination." },
    { id: 'chromashift', name: "ChromaShift", icon: <Sliders />, focus: "Stay Sharp", description: "Recreate gradient colors from visual memory. Trains color memory." },
    { id: 'weightguess', name: "WeightGuess", icon: <Scale />, focus: "Think & Solve", description: "Balance logical weights based on visual cues. Trains deductive reasoning." },
  ];

  return (
    <>
      <header className="tab-header">
        <h1>Brain Gym</h1>
        <p>Choose a cognitive loop to begin. Playing waters your streak plant.</p>
      </header>
      <div className="games-inner-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginTop: '24px'
      }}>
        {gamesList.map(game => (
          <div key={game.id} className="glass-panel play-game-card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            padding: '24px'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="game-icon" style={{ color: 'var(--color-emerald-base)', display: 'flex', alignItems: 'center' }}>
                  {game.icon}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  background: 'var(--color-sage-light)', 
                  color: 'var(--color-emerald-base)', 
                  padding: '4px 10px', 
                  borderRadius: '12px',
                  fontWeight: 600
                }}>
                  {game.focus}
                </span>
              </div>
              <h2 style={{ fontSize: '1.3rem', margin: '0 0 8px 0', fontFamily: 'var(--font-header)', fontWeight: 700 }}>
                {game.name}
              </h2>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: '0 0 16px 0', lineHeight: '1.4' }}>
                {game.description}
              </p>
            </div>
            <button className="btn-primary" onClick={() => onPlayGame(game.id)} style={{ width: '100%', justifyContent: 'center' }}>
              Start Workout
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
