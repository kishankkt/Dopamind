import React from 'react';

export default function BrainGymView({ gamesList, startGame }) {
  return (
    <>
      <header className="tab-header">
        <h1>Brain Gym</h1>
        <p>Choose a cognitive loop to begin. Playing waters your streak plant.</p>
      </header>
      <div className="games-inner-grid">
        {gamesList.map(game => (
          <div key={game.id} className="glass-panel play-game-card">
            <span className="game-icon">{game.icon}</span>
            <h2>{game.name}</h2>
            <p>{game.description}</p>
            <button className="btn-primary" onClick={() => startGame(game.id)}>
              Start {game.id === 'focusgrid' ? 'Game' : '45s'} Workout
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
