# DopaMind Game Constitution V2

> **INTERNAL — GitHub Only.** This document defines the universal V2 standards for all Brain Gym games. Every game built on this platform MUST comply with the 3-Phase Flow and the 6-Container Architecture.

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

## 2. The 3-Phase Universal Flow

Every game session follows this strict lifecycle:

### Phase 1: PreGame Popup (Entry)
- Renders `PreGameCountdown.jsx`.
- Deep theme aware (supports Dark/Light modes naturally).
- Presents the **Advanced Game Settings** accordion with `[Off] [Default] [Custom]` pill selectors for game configurations (like Cooldowns and Time Limits).
- Allows users to select their time or run unrestrained sessions.

### Phase 2: Gameplay (6-Container Standard)
- Renders `UniversalGamePlayer.jsx`.
- Wraps the game in a responsive `ugp-shell` that supports graceful scrolling on extremely small viewports.
- The UI MUST follow the 6-Container Architecture (see Section 3).

### Phase 3: PostGame Summary (Exit)
- Triggers when `onComplete(stats)` is fired.
- Renders the `.ugp-summary` popup showing Score, Accuracy, and Average Speed.
- Calculates XP logic and allows navigating to the Next Game or back to the Gym.

---

## 3. The 6-Container Architecture (V2)

The game UI must be constructed using exactly 6 specialized containers to ensure maximum device adaptability and focus.

1. **Header Container (Top)**
   - *Managed by:* `UniversalGamePlayer`
   - *Content:* Back button, Game Name, Category Badge, Sound Toggle.
2. **Stats Container (Below Header)**
   - *Managed by:* `UniversalGamePlayer`
   - *Content:* Hidden by default. Expanding it shows Score, Level, Accuracy, Time.
3. **Rules Container (Below Stats)**
   - *Managed by:* `UniversalGamePlayer`
   - *Content:* Displays the tagline/description. 
   - *Adaptability:* Auto-hides on mobile devices (`max-height: 700px`) while the game is active to prioritize screen space for the Main UI.
4. **Game Main UI Container (Dead Center)**
   - *Managed by:* The specific Game via `<GameMainUI>` slot.
   - *Content:* `flex: 1` area perfectly centering the core game visuals (like Shape Cards).
5. **Game Footer Info Container (Lower)**
   - *Managed by:* The specific Game via `<GameFooterInfo>` slot.
   - *Content:* Hints, streak counters, speed limits, or rules. A compact pill container.
6. **Game Controls Container (Absolute Bottom)**
   - *Managed by:* The specific Game via `<GameControls>` slot.
   - *Content:* Distraction-free zone for core interactive elements (YES/NO buttons).

---

## 4. Props & Stats Contract

Every game component **MUST** accept these props:

```jsx
function MyGame({
  onComplete,    // (stats: GameStats) => void — REQUIRED, call when game ends
  onQuit,        // () => void — REQUIRED, call when user wants to exit mid-game
  onHudUpdate,   // ({ score?, timeLeft?, level? }) => void — call on state changes
  soundEnabled,  // boolean — respect audio preference
}) {}
```

Every `onComplete(stats)` call **MUST** include all 8 fields:

```typescript
type GameStats = {
  score:             number;           // primary score metric
  attempts:          number;           // total user responses
  accuracy_percent:  number | null;    // 0-100, null if N/A
  avg_speed_seconds: number | null;    // average response latency
  level_reached:     number;           // level user got to (1 for flat games)
  duration_seconds:  number;           // actual elapsed time
  streak_in_game:    number;           // longest in-game consecutive streak
  perfect_rounds:    number;           // rounds with 100% accuracy
  game_specific?:    Record<string, any>; // optional game-specific extras
};
```

---

## 5. Theme Styling (Deep Theme V2)

Games and UGP components **must never** use hardcoded colors for backgrounds or text (e.g., `rgba(20,25,20,0.98)` or `white`). 
Always use the standardized CSS variables defined in `index.css`:

- `--brand-surface`: The primary glassy container background (dark in Dark mode, light oat in Light mode).
- `--text-main`: Primary text color (white in Dark mode, dark emerald in Light mode).
- `--border-subtle`: Gentle borders for containers and dividers.
- `--text-muted`: For secondary labels and hints.

This guarantees perfect visual fidelity across light and dark modes.
