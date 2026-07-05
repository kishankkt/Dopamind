import { describe, it, expect } from 'vitest';

// Simulates the SpeedMatch difficulty state transition engine
function computeNextGameState(currentState, isCorrect) {
  let { speed, consecutiveCorrect, consecutiveIncorrect } = currentState;

  if (isCorrect) {
    consecutiveIncorrect = 0;
    consecutiveCorrect += 1;
    
    // Every 3 consecutive correct answers shrinks the timer by 0.2s
    if (consecutiveCorrect > 0 && consecutiveCorrect % 3 === 0) {
      speed = Math.max(0.8, Number((speed - 0.2).toFixed(1)));
    }
  } else {
    consecutiveCorrect = 0;
    consecutiveIncorrect += 1;
    
    // Cortisol Rescue: 2 consecutive mistakes drops speed back to 2.2s
    if (consecutiveIncorrect >= 2) {
      speed = 2.2;
      consecutiveIncorrect = 0; // Reset counter after rescue triggers
    }
  }

  return { speed, consecutiveCorrect, consecutiveIncorrect };
}

describe('SpeedMatch Adaptive Difficulty Algorithm', () => {
  it('should start with default speed and increase difficulty on 3 consecutive correct answers', () => {
    let state = {
      speed: 2.5,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0
    };

    // 1st correct
    state = computeNextGameState(state, true);
    expect(state.speed).toBe(2.5);
    expect(state.consecutiveCorrect).toBe(1);

    // 2nd correct
    state = computeNextGameState(state, true);
    expect(state.speed).toBe(2.5);
    expect(state.consecutiveCorrect).toBe(2);

    // 3rd correct - triggers acceleration
    state = computeNextGameState(state, true);
    expect(state.speed).toBe(2.3);
    expect(state.consecutiveCorrect).toBe(3);

    // 4th, 5th, 6th correct - triggers next acceleration
    state = computeNextGameState(state, true);
    state = computeNextGameState(state, true);
    state = computeNextGameState(state, true);
    expect(state.speed).toBe(2.1);
  });

  it('should cap the speed at a minimum of 0.8 seconds', () => {
    let state = {
      speed: 1.0,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0
    };

    // Correct answers to force speed below 0.8s
    for (let i = 0; i < 6; i++) {
      state = computeNextGameState(state, true);
    }
    
    // Even after many correct answers, speed should be clamped at 0.8s
    expect(state.speed).toBe(0.8);
  });

  it('should trigger Cortisol Rescue (drop to 2.2s) after 2 consecutive mistakes', () => {
    let state = {
      speed: 1.2, // fast state
      consecutiveCorrect: 5,
      consecutiveIncorrect: 0
    };

    // 1st mistake
    state = computeNextGameState(state, false);
    expect(state.speed).toBe(1.2); // doesn't rescue on first mistake
    expect(state.consecutiveIncorrect).toBe(1);

    // 2nd mistake - triggers rescue
    state = computeNextGameState(state, false);
    expect(state.speed).toBe(2.2); // reset to calming speed
    expect(state.consecutiveIncorrect).toBe(0); // counters reset
  });
});
