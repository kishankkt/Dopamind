# DopaMind Game Constitution

> **INTERNAL — GitHub Only.** This document defines the universal standards for all Brain Gym games. Every game built on this platform MUST comply.

---

## 1. Game Identity Standard

Every game in the registry must declare:

| Field            | Type      | Required | Description |
|------------------|-----------|----------|-------------|
| `id`             | string    | ✅       | Kebab-case unique identifier (e.g. `speedmatch`) |
| `name`           | string    | ✅       | Display name (e.g. `SpeedMatch`) |
| `icon`           | string    | ✅       | Lucide icon name |
| `category`       | string    | ✅       | One of the 6 approved categories |
| `cognitiveTarget`| string    | ✅       | What it trains (e.g. `Processing Speed`) |
| `gameType`       | enum      | ✅       | `timed` / `rounds` / `endless` |
| `durationSeconds`| number    | Depends  | Required for `timed` games |
| `rounds`         | number    | Depends  | Required for `rounds` games |
| `hasAudio`       | boolean   | ✅       | Whether it uses the SynthEngine |
| `inputMethod`    | string[]  | ✅       | Array: `keyboard`, `touch`, `mouse` |
| `historyTable`   | string    | ✅       | Matching per-game `_history` table name |
| `tagline`        | string    | ✅       | Short punchy tagline (max 5 words) |
| `description`    | string    | ✅       | 1-sentence description |
| `status`         | string    | ✅       | `active` / `coming_soon` / `deprecated` |

---

## 2. Approved Categories

1. **Quick Reflexes** — reaction speed, processing speed
2. **Stay Sharp** — attention, focus, vigilance
3. **Remember & Recall** — working memory, recall
4. **Think & Solve** — executive function, logic, reasoning
5. **Word Power** — verbal fluency, language
6. **Sort & Prioritize** — prioritization, executive sorting

---

## 3. Game Types

### `timed`
- Fixed countdown (typically 45–90 seconds).
- `durationSeconds` required.
- Ends automatically at time = 0.
- Score = hits during period.

### `rounds`
- Fixed number of rounds, no continuous timer.
- `rounds` required.
- Ends after N rounds complete.
- Score = performance across rounds.

### `endless`
- No fixed end. Game increases difficulty until player fails.
- `durationSeconds` and `rounds` both null.
- Ends on player failure condition.
- Score = level reached or streak maintained.

---

## 4. Props Contract

Every game component **MUST** accept these props:

```jsx
function MyGame({
  onComplete,    // (stats: GameStats) => void — REQUIRED, call when game ends
  onQuit,        // () => void — REQUIRED, call when user wants to exit mid-game
  onHudUpdate,   // ({ score?, timeLeft?, level? }) => void — call on state changes
  soundEnabled,  // boolean — respect audio preference
}) {}
```

---

## 5. Stats Contract (GameStats Object)

Every `onComplete(stats)` call **MUST** include all 8 fields:

```typescript
type GameStats = {
  score:             number;           // primary score metric
  attempts:          number;           // total user responses
  accuracy_percent:  number | null;    // 0-100, null if N/A
  avg_speed_seconds: number | null;    // average response latency
  level_reached:     number;           // level user got to (1 for flat games)
  duration_seconds:  number;           // actual elapsed time
  streak_in_game:    number;           // longest in-game consecutive correct streak
  perfect_rounds:    number;           // rounds with 100% accuracy
  game_specific?:    Record<string, any>; // optional game-specific extras
};
```

> **DO NOT** omit fields. Missing fields default to 0/null but analytics will be incomplete.

---

## 6. HUD Standard

**The game component must NOT render its own score/timer/level HUD.**

The UniversalGamePlayer renders all HUD elements. Games communicate state changes via `onHudUpdate`:

```js
// When score changes:
onHudUpdate({ score: newScore });

// When timer ticks:
onHudUpdate({ timeLeft: seconds });

// When level changes:
onHudUpdate({ level: newLevel });
```

Do not include any `<div className="game-hud">` or similar in game JSX.

---

## 7. Audio Standard

- All audio MUST go through `@/app/core/audio/SynthEngine`.
- No external audio files (no `.mp3`, no `<audio>` tags).
- Only play sound if `soundEnabled === true`.
- Declare `hasAudio: true` in registry if the game uses audio.

---

## 8. Per-Game Database Table

Every game **MUST** have a matching `{game_id}_history` table in Supabase migrations.

**Minimum columns (inherited from standard template):**
```sql
user_id           uuid NOT NULL
score             int  NOT NULL
attempts          int  NOT NULL
accuracy_percent  numeric(5,2)
avg_speed_seconds numeric(6,3)
level_reached     int
duration_seconds  int
streak_in_game    int
perfect_rounds    int
played_at         timestamptz DEFAULT now()
```

**Add game-specific extra columns freely** (e.g. `speed_limit_reached`, `pattern_length`).

---

## 9. Game Constitution Checklist

Before adding a game to production, verify:

- [ ] Game registered in `gameRegistry.js`
- [ ] Migration file created: `{n}_{game_id}_history.sql`
- [ ] Component accepts all 4 required props
- [ ] `onComplete` passes all 8 stats
- [ ] `onHudUpdate` called on score/timer/level changes
- [ ] No `game-hud` div in JSX
- [ ] Audio goes through SynthEngine only
- [ ] Game respects `soundEnabled` prop
- [ ] Component file marked with `// [UGP-PATCHED]` comment
- [ ] Game tested end-to-end in dev

---

## 10. Current Game Roster

| # | Game           | Category          | Type    | Duration | Audio |
|---|----------------|-------------------|---------|----------|-------|
| 1 | SpeedMatch     | Quick Reflexes    | Timed   | 45s      | ✅    |
| 2 | FocusGrid      | Stay Sharp        | Timed   | 60s      | ❌    |
| 3 | CountFlow      | Think & Solve     | Timed   | 45s      | ❌    |
| 4 | WordWarp       | Word Power        | Timed   | 60s      | ❌    |
| 5 | PatternPulse   | Remember & Recall | Endless | —        | ✅    |
| 6 | ReactionTap    | Quick Reflexes    | Rounds  | 5R       | ❌    |
| 7 | NumberCascade  | Think & Solve     | Endless | —        | ❌    |
| 8 | SymbolMatch    | Stay Sharp        | Timed   | 45s      | ❌    |
| 9 | DirectionDash  | Quick Reflexes    | Timed   | 45s      | ❌    |
|10 | TimeEstimator  | Think & Solve     | Rounds  | 5R       | ❌    |
|11 | GravitySort    | Sort & Prioritize | Endless | —        | ❌    |
|12 | EchoMap        | Remember & Recall | Endless | —        | ❌    |
|13 | PhaseLock      | Remember & Recall | Endless | —        | ❌    |
|14 | ChromaShift    | Stay Sharp        | Endless | —        | ❌    |
|15 | WeightGuess    | Think & Solve     | Endless | —        | ❌    |

---

## 11. MCP Readiness

All game triggers and session management are MCP-ready. MCP tools can:
- Read `game_registry.js` to know available games
- Create `workout_sessions` rows with a `game_sequence` array
- Start a session by setting `status: 'active'`
- The client polls and launches the first game automatically

**Reserved for future: EarTap / RhythmLock** — audio-primary game format. Ultra-deep session planned.

---

*Last updated: 2026-07-07 | Maintained by DopaMind engineering*
