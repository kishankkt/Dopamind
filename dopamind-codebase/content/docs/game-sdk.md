---
title: "Game SDK — Build & Publish Games"
date: 2026-07-05
---

# Game SDK

DopaMind welcomes third-party cognitive games. To ensure a consistent experience, all games must adhere to the DopaMind Game API Contract.

## The API Contract

Your game component will receive two standard props from the orchestrator:

```jsx
<YourGameComponent 
  onComplete={handleComplete} 
  difficulty={{ speedLimit: 2.5 }} 
/>
```

### 1. `onComplete(payload)`
When the game ends (either by time out, or completing the objective), your component MUST call the `onComplete` prop exactly once with the following payload format:

```javascript
onComplete({
  score: Number,             // Standardized 0-1000 scale is preferred
  accuracy: Number,          // 0.0 to 1.0 (e.g. 0.85 = 85%)
  reactionTimes: Number[],   // Array of latencies in milliseconds
  status: String             // "success" | "fail" | "timeout"
})
```
The orchestrator relies on this payload to save session data to Supabase and compute the user's dashboard metrics.

### 2. `difficulty` Object
Your game should scale its parameters based on the `difficulty` prop passed in. This allows the DopaMind adaptive engine to automatically adjust the game's difficulty based on the user's recent performance.

## Styling Rules
- **No Tailwind, No CSS-in-JS**: You must use Vanilla CSS.
- Use the CSS variables provided in `App.css` (e.g., `var(--bg)`, `var(--primary-color)`) so your game automatically supports light/dark mode and follows brand guidelines.
- Games should adapt to mobile and desktop boundaries smoothly (use flexbox and relative sizing).
