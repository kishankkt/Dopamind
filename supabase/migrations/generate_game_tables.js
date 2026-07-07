/**
 * DopaMind — Per-Game Migration Generator
 * 
 * Generates migration files 008–022 for all 15 game-specific history tables.
 * Each table follows the mandatory template + game-specific extra columns.
 * 
 * Run from: DopaMind/ root
 *   node supabase/migrations/generate_game_tables.js
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname);

// Each game: [fileNumber, gameId, extraColumns]
const GAMES = [
  ['008', 'speedmatch',     'speed_limit_reached   NUMERIC(4,1)'],
  ['009', 'focusgrid',      'grid_size              INTEGER'],
  ['010', 'countflow',      'max_count_reached      INTEGER'],
  ['011', 'wordwarp',       'color_conflicts_seen   INTEGER'],
  ['012', 'patternpulse',   'max_pattern_length     INTEGER'],
  ['013', 'reactiontap',    'fastest_tap_ms         INTEGER'],
  ['014', 'numbercascade',  'max_sequence           INTEGER'],
  ['015', 'symbolmatch',    'symbols_unique_seen    INTEGER'],
  ['016', 'directiondash',  'max_speed_tier         INTEGER'],
  ['017', 'timeestimator',  'avg_deviation_percent  NUMERIC(5,2)'],
  ['018', 'gravitysort',    'max_elements_sorted    INTEGER'],
  ['019', 'echomap',        'max_chain_length       INTEGER,\n  rotation_events        INTEGER'],
  ['020', 'phaselock',      'max_phase_complexity   INTEGER'],
  ['021', 'chromashift',    'avg_color_delta        NUMERIC(6,3)'],
  ['022', 'weightguess',    'avg_weight_deviation   NUMERIC(5,2)'],
];

function generateSQL(gameId, extraColumns) {
  return `-- Migration: ${gameId}_history
-- Per-game isolated table following the DopaMind mandatory template.
-- Written alongside game_history (global). Adds game-specific columns.

CREATE TABLE IF NOT EXISTS public.${gameId}_history (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ⚠️ MANDATORY CORE STATS — Do NOT rename or remove (API contract v1)
  score               INTEGER NOT NULL DEFAULT 0,
  attempts            INTEGER NOT NULL DEFAULT 0,
  accuracy_percent    NUMERIC(5,2),
  avg_speed_seconds   NUMERIC(6,3),

  -- ⚠️ MANDATORY EXTENDED STATS — API contract v2
  level_reached       INTEGER DEFAULT 1,
  duration_seconds    INTEGER,
  streak_in_game      INTEGER DEFAULT 0,
  perfect_rounds      INTEGER DEFAULT 0,

  -- ✅ GAME-SPECIFIC COLUMNS
  ${extraColumns},

  played_at           TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.${gameId}_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "${gameId}_select_own" ON public.${gameId}_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "${gameId}_insert_own" ON public.${gameId}_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_${gameId}_history_user
  ON public.${gameId}_history(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_${gameId}_history_score
  ON public.${gameId}_history(user_id, score DESC);
`;
}

let count = 0;
for (const [num, gameId, extraCols] of GAMES) {
  const date = `2026070700${num}`;
  const filename = `${date}_${gameId}_history.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);
  
  if (fs.existsSync(filepath)) {
    console.log(`⚠️  Skipping (exists): ${filename}`);
    continue;
  }

  const sql = generateSQL(gameId, extraCols);
  fs.writeFileSync(filepath, sql, 'utf8');
  console.log(`✅ Created: ${filename}`);
  count++;
}

console.log(`\n✨ Done. ${count} migration files created.`);
