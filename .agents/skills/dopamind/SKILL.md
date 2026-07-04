---
name: DopaMind Platform Guidelines
description: Complete platform inventory, developer guidelines, SVG logo assets, database schema configurations, Vercel monorepo patterns, and Regular/Growth management framework for DopaMind.
---

# 🌿 DopaMind — Platform Inventory & Developer Skill

This file is the **single source of truth** for every moving part in DopaMind. It instructs coding agents how to build, maintain, and scale the platform without context drift.

Every item in this platform falls into exactly one of two management categories:

| Parameter | Definition | Action |
|-----------|-----------|--------|
| **🔄 Regular** | Already built. Needs ongoing maintenance, bug fixes, polish, and content updates. | Protect it. Don't break it. Improve quality. |
| **🚀 Growth** | Not yet built or partially built. Needs new code, new features, new infrastructure. | Build it. Ship it. Expand the platform. |

---

## 📊 FULL PLATFORM INVENTORY

### Level 1: Public Marketing & Growth Engine
> The public-facing landing page that converts visitors into users.

| Item | File(s) | Status | Parameter |
|------|---------|--------|-----------|
| Landing Page Hero | `App.jsx` (visitor return) | ✅ Built | 🔄 Regular |
| Landing Page Header + Nav | `App.jsx` | ✅ Built | 🔄 Regular |
| Interactive Trial Widget (15s) | `InteractiveGame.jsx` | ✅ Built | 🔄 Regular |
| Games Roadmap Grid | `App.jsx` (landing #games) | ✅ Built | 🔄 Regular |
| Streak Plant Explainer Section | `App.jsx` (landing #streak) | ✅ Built | 🔄 Regular |
| FAQ Accordion | `App.jsx` (landing #faq) | ✅ Built | 🔄 Regular |
| Footer + Legal Links | `App.jsx` | ✅ Built | 🔄 Regular |
| Privacy Policy Modal | `App.jsx` | ✅ Built | 🔄 Regular |
| Terms of Service Modal | `App.jsx` | ✅ Built | 🔄 Regular |
| SEO Meta Tags | `index.html` | ✅ Built | 🔄 Regular |
| Pricing Page / Stripe Integration | `api/stripe-webhook.js` | ⚠️ Partial | 🚀 Growth |
| Blog / Content Marketing | — | ❌ Not Built | 🚀 Growth |
| Social Proof / Testimonials | — | ❌ Not Built | 🚀 Growth |
| App Store / PWA Install Banner | — | ❌ Not Built | 🚀 Growth |

---

### Level 2: User Flow Engine
> Authentication, onboarding, and profile management.

| Item | File(s) | Status | Parameter |
|------|---------|--------|-----------|
| Email/Password Auth | `App.jsx` + `supabaseClient.js` | ✅ Built | 🔄 Regular |
| Google OAuth Login | `App.jsx` | ✅ Built | 🔄 Regular |
| Signup Success + Email Verification | `App.jsx` | ✅ Built | 🔄 Regular |
| Auth Modal (Glassmorphic) | `App.jsx` | ✅ Built | 🔄 Regular |
| Settings / Profile Page | `views/SettingsView.jsx` | ✅ Built | 🔄 Regular |
| Username Update | `views/SettingsView.jsx` | ✅ Built | 🔄 Regular |
| Logout Flow | `App.jsx` (sidebar) | ✅ Built | 🔄 Regular |
| Password Reset Flow | — | ❌ Not Built | 🚀 Growth |
| Onboarding Wizard (First-Time User) | — | ❌ Not Built | 🚀 Growth |
| Avatar / Profile Picture Upload | — | ❌ Not Built | 🚀 Growth |
| Account Deletion | — | ❌ Not Built | 🚀 Growth |

---

### Level 3: App-Level Engines
> Global systems that sit on top of the games and drive engagement.

| Engine | File(s) | Status | Parameter |
|--------|---------|--------|-----------|
| **Seeding Board (Streak Engine)** | `App.jsx` + `utils/gameEngine.js` | ✅ Built | 🔄 Regular |
| Streak Plant Visualizer (5 SVG stages) | `components/PlantIcons.jsx` | ✅ Built | 🔄 Regular |
| **Performance Engine** (Recharts) | `components/PerformanceChart.jsx` | ✅ Built | 🔄 Regular |
| **Global Leaderboard** | `components/Leaderboard.jsx` | ✅ Built | 🔄 Regular |
| **Interactive Leaf Companion** | `components/InteractiveLeaf.jsx` | ✅ Built | 🔄 Regular |
| **AI Guidance / Schedule Builder** | `components/ScheduleBuilder.jsx` | ✅ Built | 🔄 Regular |
| **AI Engine (OpenRouter)** | `utils/aiEngine.js` | ✅ Built | 🔄 Regular |
| AI Orchestration Loop (Queue Runner) | `App.jsx` (handleStartOrchestration) | ✅ Built | 🔄 Regular |
| Dark / Light Theme Toggle | `App.jsx` + `App.css` + `index.css` | ✅ Built | 🔄 Regular |
| Toast Notification System | `App.jsx` (showToast) | ✅ Built | 🔄 Regular |
| Confirm Dialog System | `App.jsx` (triggerConfirm) | ✅ Built | 🔄 Regular |
| Sound Engine (Pentatonic Chimes) | `App.jsx` (AudioContext) | ✅ Built | 🔄 Regular |
| Notifications / Push Engine | — | ❌ Not Built | 🚀 Growth |
| Achievements / Badges System | — | ❌ Not Built | 🚀 Growth |
| Social Sharing (Share Score) | — | ❌ Not Built | 🚀 Growth |
| Daily Challenges / Quests | — | ❌ Not Built | 🚀 Growth |
| Multiplayer / Friend System | — | ❌ Not Built | 🚀 Growth |
| Analytics Dashboard (Admin) | — | ❌ Not Built | 🚀 Growth |

---

### Level 4: Brain Gym — The Games Engine
> All 15 cognitive training games. Each game follows the `onComplete({score, attempts, accuracy_percent, avg_speed_seconds})` API contract.

| # | Game | File | Focus | Type | Parameter |
|---|------|------|-------|------|-----------|
| 1 | SpeedMatch | `App.jsx` (inline) | Processing Speed | Timed (45s) | 🔄 Regular |
| 2 | FocusGrid | `games/FocusGrid.jsx` | Spatial Sequence Memory | Timed | 🔄 Regular |
| 3 | CountFlow | `games/CountFlow.jsx` | Mental Math & Agility | Timed | 🔄 Regular |
| 4 | WordWarp | `games/WordWarp.jsx` | Cognitive Flexibility (Stroop) | Timed | 🔄 Regular |
| 5 | PatternPulse | `games/PatternPulse.jsx` | Pattern Recognition | Timed | 🔄 Regular |
| 6 | ReactionTap | `games/ReactionTap.jsx` | Reflex Latency | 5 Rounds | 🔄 Regular |
| 7 | NumberCascade | `games/NumberCascade.jsx` | Working Memory | Timed | 🔄 Regular |
| 8 | SymbolMatch | `games/SymbolMatch.jsx` | Visual Processing | Timed | 🔄 Regular |
| 9 | DirectionDash | `games/DirectionDash.jsx` | Inhibitory Control | Timed | 🔄 Regular |
| 10 | TimeEstimator | `games/TimeEstimator.jsx` | Temporal Perception | 5 Rounds | 🔄 Regular |
| 11 | **GravitySort** | `games/GravitySort.jsx` | Executive Prioritization | Endless | 🔄 Regular |
| 12 | **EchoMap** | `games/EchoMap.jsx` | Reverse Working Memory | Endless | 🔄 Regular |
| 13 | **PhaseLock** | `games/PhaseLock.jsx` | Temporal Synchronization | Endless | 🔄 Regular |
| 14 | **ChromaShift** | `games/ChromaShift.jsx` | Visual Color Memory | Endless | 🔄 Regular |
| 15 | **WeightGuess** | `games/WeightGuess.jsx` | Cognitive Conflict Resolution | Endless | 🔄 Regular |

---

### Level 5: Infrastructure & DevOps

| Item | File(s) | Status | Parameter |
|------|---------|--------|-----------|
| Vercel Deployment Pipeline | `vercel.json` | ✅ Built | 🔄 Regular |
| Supabase Database | `supabase/schema.sql` + `config.toml` | ✅ Built | 🔄 Regular |
| Stripe Webhook API | `api/stripe-webhook.js` | ⚠️ Partial | 🚀 Growth |
| Environment Variables (.env) | `marketing/.env` | ✅ Built | 🔄 Regular |
| Git Version Control | `.git` | ✅ Built | 🔄 Regular |
| CI/CD Pipeline | `ci-cd/` | ⚠️ Scaffolded | 🚀 Growth |
| Automated Tests | `tests/` | ⚠️ Scaffolded | 🚀 Growth |
| i18n Localization | `locales/` | ⚠️ Scaffolded | 🚀 Growth |

---

### UI Architecture & Views

| Item | File(s) | Status | Parameter |
|------|---------|--------|-----------|
| App Shell (Sidebar + Content Panel) | `App.jsx` | ✅ Built | 🔄 Regular |
| Dashboard View | `views/DashboardView.jsx` | ✅ Built | 🔄 Regular |
| Brain Gym View | `views/BrainGymView.jsx` | ✅ Built | 🔄 Regular |
| Settings View | `views/SettingsView.jsx` | ✅ Built | 🔄 Regular |
| Mobile Responsive Layout | `App.css` (@media) | ✅ Built | 🔄 Regular |
| Sidebar Fixed on Mobile | `App.css` (position: fixed) | ✅ Built | 🔄 Regular |

---

## 📈 SUMMARY COUNTS

| Category | Regular (Maintenance) | Growth (To Build) |
|----------|----------------------|-------------------|
| Marketing & Landing | 10 items | 4 items |
| User Flow | 6 items | 4 items |
| App Engines | 12 items | 5 items |
| Games | 15 games | 0 (next batch TBD) |
| Infrastructure | 4 items | 4 items |
| UI Views | 6 items | 0 |
| **TOTAL** | **53 items** | **17 items** |

---

## 🎨 Design System & Colors
* **Theme:** Calm, premium, spacious, soft glassmorphism.
* **Palette:**
  - Deep Emerald: `hsl(145, 30%, 15%)`
  - Base Emerald: `hsl(145, 40%, 25%)`
  - Sage Green: `hsl(120, 18%, 85%)`
  - Oat: `hsl(36, 33%, 96%)`
  - Accent Gold: `hsl(43, 85%, 60%)`
  - Error Coral: `hsl(354, 70%, 65%)`
* **Fonts:** Outfit (Headers), Inter (Body text).

---

## 🏷️ Custom Brain-Leaf SVG Logo Spec
When rendering the logo, do not use emoji. Render this inline SVG so it dynamically matches dark/light themes via `currentColor`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <!-- Stylized leaf contour -->
  <path d="M50 12 C20 18 15 62 50 88 C85 62 80 18 50 12 Z" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Central main vein -->
  <path d="M50 88 V28" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <!-- Left hemisphere curves (representing brain lobes & veins) -->
  <path d="M50 78 C38 72 28 66 28 54 C28 42 38 42 50 42" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M50 62 C32 56 22 50 22 38 C22 26 32 26 50 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M50 40 C40 34 32 28 32 22 C32 16 40 16 50 19" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <!-- Right hemisphere curves -->
  <path d="M50 78 C62 72 72 66 72 54 C72 42 62 42 50 42" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M50 62 C68 56 78 50 78 38 C78 26 68 26 50 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M50 40 C60 34 68 28 68 22 C68 16 60 16 50 19" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <!-- Top focus node seed (Gold) -->
  <circle cx="50" cy="12" r="3.5" fill="#EAB308" />
</svg>
```

The 🌿 leaf emoji is reserved exclusively for the landing page hero badge, the AI chatbot avatar, and the Interactive Leaf companion. The sidebar and internal navigation use the SVG logo above.

---

## 🗄️ Database Schemas & Auth Triggers
Users' profiles must reside inside Supabase PostgreSQL `public.profiles`:
* **Attributes:** `id` (references auth.users), `streak_count`, `last_played_at`, `plant_stage`, `is_premium`.
* **Authentication triggers:** Trigger `on_auth_user_created` executes `handle_new_user()` on `auth.users` row creation to seed the database profile row.

### 🎮 Per-Game Schema Database Rule
To ensure optimal schema isolation, the core `profiles` table only manages global authentication and streak metrics. Every sub-game under the DopaMind platform MUST manage its own statistics and play history logs inside its own isolated database table (e.g. `speedmatch_history` for SpeedMatch), referencing `auth.users(id)` as a foreign key:
* **SpeedMatch History Schema (`speedmatch_history`):**
  - Attributes: `id` (primary key), `user_id` (foreign key to auth.users), `created_at`, `score`, `attempts`, `accuracy_percent`, `avg_speed_seconds`.
* **Security Rule:** Enable Row Level Security (RLS) for all game history tables. Only allow users to select/insert records that match their own `auth.uid()`.

---

## 🎮 Game API Contract
Every game component MUST accept these props and follow this contract:

```jsx
// Props
{ onComplete: (stats) => void, onQuit: () => void }

// stats object shape (passed to onComplete)
{
  score: number,           // Total correct actions
  attempts: number,        // Total actions taken
  accuracy_percent: number, // Math.round((score / attempts) * 100)
  avg_speed_seconds: number // Average reaction/decision time in seconds
}
```

---

## 📦 Vercel Monorepo Settings
Vercel is linked to the repository root. Build pipeline is handled via:
- Build Command: `cd marketing && npm run build`
- Install Command: `cd marketing && npm install`
- Output Directory: `marketing/dist`
- Serverless API functions: Mapped automatically from the root `/api` directory.

---

## 💎 Premium UX & Design Guidelines
* **No Default Popups:** Banned using `window.alert()` or `window.confirm()`. All warnings, success toasts, and exit confirmations MUST be rendered as custom glassmorphic modals that adapt to dark/light templates.

---

## 🧠 Architectural & Coding Principles

To maintain specialist-grade engineering standards and ensure DopaMind remains easily updateable, modular, and future-ready:

* **DRY (Don't Repeat Yourself) & Shared Helpers:** Avoid duplicate logic. Put state helpers, formatters, and analytics triggers in centralized modules.
* **Modular API-First Separation:** Decouple front-end view state from database and external logic. Communicate exclusively via clean API calls (e.g., Supabase JS query layers and Serverless functions).
* **Specialist Design Quality (Dark & White Themes):** 
  - Style interfaces using unified CSS custom properties (`var(--...)`) mapping to a consistent sage-green palette.
  - Implement fluid layout transitions and high-performance micro-animations.
  - Interface must seamlessly shift between light and dark themes using unified system preferences.
* **Future-Ready & Native Device Portability:** 
  - Keep styling layouts fully fluid, mobile-first, and responsive.
  - Ensure front-end code is compatible with standard Web views as well as native desktop wrapper containers (like Tauri or Electron shells).
* **Connectable Database Scaling:** Write clean migrations, schemas, and triggers that allow adding new features (like extra mini-games) without altering core profiles or breaking historical data sets.
