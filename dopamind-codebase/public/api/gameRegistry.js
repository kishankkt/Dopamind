/**
 * gameRegistry.js — DopaMind Game Registry
 * Single source of truth for all game metadata.
 * MCP tools read this to know what games exist and their properties.
 *
 * RULE: Adding a new game? Add it here + create {game_id}_history migration.
 *
 * levelConfig.param  — which prop changes per level
 * levelConfig.values — array[10], index = level-1; passed as `difficultyValue` prop
 */

export const GAME_REGISTRY = [
  {
    id: 'speedmatch',
    name: 'SpeedMatch',
    icon: 'Zap',
    category: 'Quick Reflexes',
    cognitiveTarget: 'Processing Speed',
    gameType: 'timed',
    durationSeconds: 45,
    rounds: null,
    hasAudio: true,
    inputMethod: ['keyboard', 'touch'],
    historyTable: 'speedmatch_history',
    tagline: 'Match shapes. Train speed.',
    description: 'Match the current shape with the previous one. Trains processing speed.',
    status: 'active',
    howToPlay: 'Look at the shape on screen. If it perfectly matches the shape that was shown immediately before it, tap \'Match\'. If it is different, tap \'No Match\'. Act as fast as possible.',
    neurologicalBenefits: 'Floods the visual-motor pathways with norepinephrine, decreasing raw synaptic transmission time. Enhances myelin sheath efficiency for faster processing.',
    levelConfig: {
      param: 'speedLimit',   // seconds per card
      values: [2.5, 2.2, 1.8, 1.5, 1.2, 1.0, 0.8, 0.6, 0.5, 0.3],
    },
  },
  {
    id: 'focusgrid',
    name: 'FocusGrid',
    icon: 'Target',
    category: 'Stay Sharp',
    cognitiveTarget: 'Selective Attention',
    gameType: 'timed',
    durationSeconds: 60,
    rounds: null,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'focusgrid_history',
    tagline: 'Find the sequence. Stay locked.',
    description: 'Find the numbers in order on a grid. Trains spatial attention and focus.',
    status: 'active',
    howToPlay: 'A grid of numbers will appear. Find and tap the numbers in ascending sequential order as quickly as you can without getting distracted.',
    neurologicalBenefits: 'Forces the anterior cingulate cortex to actively suppress visual noise, heavily training selective attention and spatial locking.',
    levelConfig: {
      param: 'gridSize',    // number of cells (3x3=9 → 5x5=25)
      values: [9, 9, 12, 12, 16, 16, 20, 20, 25, 25],
    },
  },
  {
    id: 'countflow',
    name: 'CountFlow',
    icon: 'Hash',
    category: 'Think & Solve',
    cognitiveTarget: 'Executive Function',
    gameType: 'timed',
    durationSeconds: 45,
    rounds: null,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'countflow_history',
    tagline: 'Solve fast. Think clear.',
    description: 'Solve arithmetic under time pressure. Trains mental agility.',
    status: 'active',
    howToPlay: 'Solve the rapid-fire math equations presented. Type or tap the correct answer before the time expires.',
    neurologicalBenefits: 'Places maximum load on the dorsolateral prefrontal cortex, expanding raw numerical working memory and logical executive function.',
    levelConfig: {
      param: 'maxOperand',  // highest number in equations
      values: [5, 10, 15, 20, 30, 40, 50, 75, 100, 200],
    },
  },
  {
    id: 'wordwarp',
    name: 'WordWarp',
    icon: 'Palette',
    category: 'Word Power',
    cognitiveTarget: 'Verbal Fluency',
    gameType: 'timed',
    durationSeconds: 60,
    rounds: null,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'wordwarp_history',
    tagline: 'Match color not word. Fight your brain.',
    description: 'Match the ink color, not the word. Trains cognitive flexibility.',
    status: 'active',
    howToPlay: 'You will see a word that spells a color, but the ink is a different color. Tap the button that matches the INK color, ignoring the word itself.',
    neurologicalBenefits: 'Triggers the Stroop Effect. Forces the brain to suppress its automatic linguistic habits, building deep impulse control and cognitive flexibility.',
    levelConfig: {
      param: 'optionCount',  // number of color choices shown
      values: [2, 2, 3, 3, 4, 4, 5, 5, 6, 6],
    },
  },
  {
    id: 'patternpulse',
    name: 'PatternPulse',
    icon: 'Puzzle',
    category: 'Remember & Recall',
    cognitiveTarget: 'Working Memory',
    gameType: 'endless',
    durationSeconds: null,
    rounds: null,
    hasAudio: true,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'patternpulse_history',
    tagline: 'Remember the pulse. Grow the chain.',
    description: 'Remember and repeat the light sequence. Trains working memory.',
    status: 'active',
    howToPlay: 'Watch the sequence of glowing tiles. Once the sequence finishes, tap the tiles in the exact same order.',
    neurologicalBenefits: 'Strengthens short-term synaptic plasticity in the hippocampus, directly expanding visual-spatial working memory capacity.',
    levelConfig: {
      param: 'startLength',  // initial sequence length
      values: [2, 2, 3, 3, 4, 4, 5, 5, 6, 7],
    },
  },
  {
    id: 'reactiontap',
    name: 'ReactionTap',
    icon: 'Activity',
    category: 'Quick Reflexes',
    cognitiveTarget: 'Reaction Speed',
    gameType: 'rounds',
    durationSeconds: null,
    rounds: 5,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'reactiontap_history',
    tagline: 'Wait. React. Dominate.',
    description: 'Tap the target the instant it appears. Trains raw reaction time.',
    status: 'active',
    howToPlay: 'Wait for the target indicator to appear. The absolute instant you see it, tap the screen.',
    neurologicalBenefits: 'Conditions the raw reflex arc between the visual cortex and motor cortex, minimizing absolute reaction time.',
    levelConfig: {
      param: 'rounds',       // number of reaction rounds
      values: [3, 3, 5, 5, 7, 7, 10, 10, 12, 15],
    },
  },
  {
    id: 'numbercascade',
    name: 'NumberCascade',
    icon: 'Layers',
    category: 'Think & Solve',
    cognitiveTarget: 'Numerical Working Memory',
    gameType: 'endless',
    durationSeconds: null,
    rounds: null,
    hasAudio: false,
    inputMethod: ['touch', 'keyboard'],
    historyTable: 'numbercascade_history',
    tagline: 'Catch the numbers. Never drop one.',
    description: 'Remember cascading number sequences. Trains numerical working memory.',
    status: 'active',
    howToPlay: 'Memorize the sequence of numbers as they cascade down the screen. Once they vanish, type them back in order.',
    neurologicalBenefits: 'Pushes the limits of the phonological loop in working memory, enhancing ability to retain and manipulate abstract information.',
    levelConfig: {
      param: 'sequenceLength',  // digits in each sequence
      values: [3, 4, 4, 5, 5, 6, 6, 7, 8, 9],
    },
  },
  {
    id: 'symbolmatch',
    name: 'SymbolMatch',
    icon: 'Eye',
    category: 'Stay Sharp',
    cognitiveTarget: 'Visual Attention',
    gameType: 'timed',
    durationSeconds: 45,
    rounds: null,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'symbolmatch_history',
    tagline: 'Spot the match. Cut the noise.',
    description: 'Match complex symbols under time pressure. Trains visual focus.',
    status: 'active',
    howToPlay: 'A complex target symbol is shown alongside several similar distractors. Find and tap the exact match.',
    neurologicalBenefits: 'Trains visual feature-binding in the occipital-parietal network, enhancing ability to spot minute differences in complex environments.',
    levelConfig: {
      param: 'distractorCount',  // number of fake similar symbols
      values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
    },
  },
  {
    id: 'directiondash',
    name: 'DirectionDash',
    icon: 'Compass',
    category: 'Quick Reflexes',
    cognitiveTarget: 'Speed-Accuracy Tradeoff',
    gameType: 'timed',
    durationSeconds: 45,
    rounds: null,
    hasAudio: false,
    inputMethod: ['keyboard', 'touch'],
    historyTable: 'directiondash_history',
    tagline: 'Move fast. Move right.',
    description: 'Press the matching direction instantly. Trains speed-accuracy balance.',
    status: 'active',
    howToPlay: 'Arrows will appear. Swipe or press the arrow key matching the direction they point, but beware of misleading cues.',
    neurologicalBenefits: 'Optimizes the speed-accuracy tradeoff mechanism in the basal ganglia, teaching the brain to make fast decisions without sacrificing precision.',
    levelConfig: {
      param: 'flipProbability',  // chance of direction being flipped/misleading (0-1)
      values: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5],
    },
  },
  {
    id: 'timeestimator',
    name: 'TimeEstimator',
    icon: 'Timer',
    category: 'Think & Solve',
    cognitiveTarget: 'Internal Timing',
    gameType: 'rounds',
    durationSeconds: null,
    rounds: 5,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'timeestimator_history',
    tagline: 'Feel time. Own it.',
    description: 'Estimate exact time intervals without feedback. Trains internal clocking.',
    status: 'active',
    howToPlay: 'A target time interval will be given. Tap to start, and tap again when you feel exactly that much time has passed.',
    neurologicalBenefits: 'Calibrates the brain\'s internal timing mechanisms and circadian rhythms, located in the striatum and supplementary motor area.',
    levelConfig: {
      param: 'targetSeconds',  // interval to estimate (shorter = harder)
      values: [5, 4, 3, 2.5, 2, 1.5, 1, 0.8, 0.6, 0.5],
    },
  },
  {
    id: 'gravitysort',
    name: 'GravitySort',
    icon: 'ArrowDown',
    category: 'Sort & Prioritize',
    cognitiveTarget: 'Executive Prioritization',
    gameType: 'endless',
    durationSeconds: null,
    rounds: null,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'gravitysort_history',
    tagline: 'Sort fast before they fall.',
    description: 'Sort falling elements by category before they hit the floor. Trains rapid prioritization.',
    status: 'active',
    howToPlay: 'Items fall from the top of the screen. Rapidly sort them into their correct category bins before they hit the bottom.',
    neurologicalBenefits: 'Overloads the executive prioritization network, training the brain to categorize and process threats under immense temporal pressure.',
    levelConfig: {
      param: 'fallSpeed',  // pixels/second items fall
      values: [40, 55, 70, 90, 110, 130, 150, 175, 200, 240],
    },
  },
  {
    id: 'echomap',
    name: 'EchoMap',
    icon: 'Radio',
    category: 'Remember & Recall',
    cognitiveTarget: 'Reverse Working Memory + Spatial Rotation',
    gameType: 'endless',
    durationSeconds: null,
    rounds: null,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'echomap_history',
    tagline: 'Reverse the path. Rotate the grid.',
    description: 'Recall tile sequences in reverse order — grid rotates every 5 levels.',
    status: 'active',
    howToPlay: 'Memorize the glowing path. When it vanishes, recreate it in exact reverse order.',
    neurologicalBenefits: 'Forces the brain to not just hold data, but actively manipulate it in real-time, engaging heavy spatial-rotation networks.',
    levelConfig: {
      param: 'startLength',  // starting chain length
      values: [2, 2, 3, 3, 4, 4, 5, 5, 6, 7],
    },
  },
  {
    id: 'phaselock',
    name: 'PhaseLock',
    icon: 'Lock',
    category: 'Remember & Recall',
    cognitiveTarget: 'Temporal Coordination',
    gameType: 'endless',
    durationSeconds: null,
    rounds: null,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'phaselock_history',
    tagline: 'Sync the phases. Hold the lock.',
    description: 'Align rotating puzzle phases into synchronization. Trains temporal coordination.',
    status: 'active',
    howToPlay: 'Rotating dials will appear. Tap exactly when their phases align to lock them together.',
    neurologicalBenefits: 'Trains temporal coordination and anticipatory timing, syncing neural oscillations between motor and visual cortices.',
    levelConfig: {
      param: 'rotationSpeed',  // base angular velocity multiplier
      values: [0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.8, 2.1, 2.5, 3.0],
    },
  },
  {
    id: 'chromashift',
    name: 'ChromaShift',
    icon: 'Sliders',
    category: 'Stay Sharp',
    cognitiveTarget: 'Color Memory',
    gameType: 'endless',
    durationSeconds: null,
    rounds: null,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'chromashift_history',
    tagline: 'Recreate the shade. Remember the tone.',
    description: 'Recreate gradient colors from visual memory. Trains color memory.',
    status: 'active',
    howToPlay: 'A specific color tone will flash. Adjust the sliders to recreate that exact shade from memory.',
    neurologicalBenefits: 'Enhances granular sensory recall by forcing the visual cortex to maintain high-fidelity representations of abstract stimuli.',
    levelConfig: {
      param: 'flashDuration',  // ms the color is shown before hiding
      values: [2000, 1600, 1300, 1000, 800, 600, 500, 400, 300, 200],
    },
  },
  {
    id: 'weightguess',
    name: 'WeightGuess',
    icon: 'Scale',
    category: 'Think & Solve',
    cognitiveTarget: 'Deductive Reasoning',
    gameType: 'endless',
    durationSeconds: null,
    rounds: null,
    hasAudio: false,
    inputMethod: ['touch', 'mouse'],
    historyTable: 'weightguess_history',
    tagline: 'Balance the logic. Trust the pattern.',
    description: 'Deduce object weights from visual balance cues. Trains logical reasoning.',
    status: 'active',
    howToPlay: 'Observe the scales to deduce which shapes are heaviest, then select the heaviest object.',
    neurologicalBenefits: 'Engages the prefrontal cortex in multi-step deductive reasoning, improving abstract logical processing speed.',
    levelConfig: {
      param: 'shapeCount',  // distinct weight values in play
      values: [2, 2, 3, 3, 4, 4, 5, 5, 6, 7],
    },
  },
];

/** Fast lookup by game ID */
export const getGame = (id) => GAME_REGISTRY.find(g => g.id === id) || null;

/** Games grouped by category */
export const getGamesByCategory = () => {
  return GAME_REGISTRY.reduce((acc, game) => {
    if (!acc[game.category]) acc[game.category] = [];
    acc[game.category].push(game);
    return acc;
  }, {});
};

/** Category display order */
export const CATEGORY_ORDER = [
  'Quick Reflexes',
  'Stay Sharp',
  'Remember & Recall',
  'Think & Solve',
  'Word Power',
  'Sort & Prioritize',
];
