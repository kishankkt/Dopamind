# 🎨 DopaMind Brand & Identity Design Guidelines

This document details the visual guidelines, design tokens, voice, tone, and design specifications for the **DopaMind** brand.

---

## 🌿 Core Aesthetic & Design System

DopaMind is designed to feel like a **"Positive Dopamine Brain Gym"**. 
* **Vibe:** Mindful, premium, spacious, and calming.
* **Avoid:** Heavy gradients, flashiness, and hyper-saturated neon colors (NOT a crypto/trading app or cyber-themed gamification). 
* **Key Design Concept:** Soft Glassmorphism (semi-transparent backdrops, subtle blurred elements, and fine borders that blend beautifully with native screen backgrounds).

---

## 🎨 Color Palette

We utilize a custom tailored HSL color system that evokes nature, focus, and serenity.

| Token | HSL / Value | CSS Custom Property | Intended Use |
| :--- | :--- | :--- | :--- |
| **Emerald (Deep)** | `hsl(145, 30%, 15%)` | `--color-emerald-deep` | Main text color, strong UI boundaries, primary branding darks |
| **Emerald (Base)** | `hsl(145, 40%, 25%)` | `--color-emerald-base` | Buttons, highlighted states, cards |
| **Sage Green** | `hsl(120, 18%, 85%)` | `--color-sage-green` | Calming background overlays, secondary buttons |
| **Oat (Cream)** | `hsl(36, 33%, 96%)` | `--color-oat` | Main page background, container fills |
| **Oat (Light)** | `hsl(36, 40%, 99%)` | `--color-oat-light` | Pure background card fills, input backgrounds |
| **Accent Gold** | `hsl(43, 85%, 60%)` | `--color-accent-gold` | Streak plant star, level milestones, active rewards |
| **Error Coral** | `hsl(354, 70%, 65%)` | `--color-error-coral` | Mistake indications (soft, not harsh red) |

---

## ✍️ Typography

We use modern sans-serif typography that communicates clarity and structure.

* **Primary Font:** **Outfit** (via Google Fonts) - for high-impact headers, game labels, and stats.
* **Secondary Font:** **Inter** (via Google Fonts) - for crisp, highly readable descriptions, instructions, and settings text.

### CSS Declaration

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700;800&display=swap');

:root {
  --font-header: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

---

## 🫧 Soft Glassmorphism Specifications

To give the application interface a spacious, premium feel:

```css
.glass-panel {
  background: rgba(253, 251, 247, 0.7); /* Soft Oat tint */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(40, 77, 54, 0.08); /* Soft Deep Emerald border */
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(40, 77, 54, 0.03);
}
```

---

## 🪴 Micro-Animations & Game Loops

The design comes alive with micro-animations that reward focus and rescue failures.

### 1. Springy Tactile Buttons
All buttons have a physical, clickable feel:
- **Hover:** Slight scale-up (`scale(1.02)`) and background luminance transition.
- **Active (Click/Tap):** Slight scale-down (`scale(0.96)`) to give tactile click-feedback.

### 2. Daily Streak Pixel Plant
- The main dashboard features a pixel-art or simple SVG flower pot that grows visually as the user's streak grows.
- Each consecutive day of play plants a "Streak Pixel Seed" that blooms into a Sage Green sprout, eventually flowering with Gold highlights.

### 3. Failure De-escalation (Cortisol Rescue)
- If the user makes multiple sequential errors in a game, the UI transition slows down, colors shift back to calming Sage overlays, and the game injects an easy task to reset user confidence.

---

## 🏷️ Logo & Asset Specifications

* **Primary Icon:** A minimalist, continuous-line drawing of a brain wrapping into a leaf, rendered in Emerald.
* **Logotype:** "DopaMind" written in Outfit Semibold, with "Dopa" in deep Emerald and "Mind" in sage Green.
