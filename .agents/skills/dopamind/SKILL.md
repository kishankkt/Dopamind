---
name: DopaMind Platform Guidelines
description: Complete platform inventory, developer guidelines, SVG logo assets, database schema configurations, Vercel monorepo patterns, Regular/Growth management framework, content-first markdown architecture, and multi-platform distribution strategy for DopaMind.
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
| Vision / About Us Page | `pages/VisionPage.jsx` | ❌ Not Built | 🚀 Growth |
| Downloads Page (All Platforms) | `pages/DownloadsPage.jsx` | ❌ Not Built | 🚀 Growth |
| Blog / Content Marketing | `pages/BlogPage.jsx` | ❌ Not Built | 🚀 Growth |
| Changelog | `pages/ChangelogPage.jsx` | ❌ Not Built | 🚀 Growth |
| Contact / Support Page | `pages/ContactPage.jsx` | ❌ Not Built | 🚀 Growth |
| Developer Docs | `pages/DocsPage.jsx` | ❌ Not Built | 🚀 Growth |
| Pricing Page / Stripe Integration | `api/stripe-webhook.js` | ⚠️ Partial | 🚀 Growth |
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

#### Game Categories (Human-Friendly Labels)

| Category | Human Label | Games |
|----------|-------------|-------|
| **Quick Reflexes** | Speed & Reaction | SpeedMatch, ReactionTap, DirectionDash |
| **Remember & Recall** | Memory & Pattern | PatternPulse, EchoMap, PhaseLock |
| **Stay Sharp** | Focus & Attention | FocusGrid, ChromaShift, SymbolMatch |
| **Think & Solve** | Logic & Estimation | CountFlow, NumberCascade, WeightGuess, TimeEstimator |
| **Word Power** | Language | WordWarp |
| **Sort & Prioritize** | Organization | GravitySort |

| # | Game | File | Category | Type | Parameter |
|---|------|------|----------|------|-----------| 
| 1 | SpeedMatch | `App.jsx` (inline) | Quick Reflexes | Timed (45s) | 🔄 Regular |
| 2 | FocusGrid | `games/FocusGrid.jsx` | Stay Sharp | Timed | 🔄 Regular |
| 3 | CountFlow | `games/CountFlow.jsx` | Think & Solve | Timed | 🔄 Regular |
| 4 | WordWarp | `games/WordWarp.jsx` | Word Power | Timed | 🔄 Regular |
| 5 | PatternPulse | `games/PatternPulse.jsx` | Remember & Recall | Timed | 🔄 Regular |
| 6 | ReactionTap | `games/ReactionTap.jsx` | Quick Reflexes | 5 Rounds | 🔄 Regular |
| 7 | NumberCascade | `games/NumberCascade.jsx` | Think & Solve | Timed | 🔄 Regular |
| 8 | SymbolMatch | `games/SymbolMatch.jsx` | Stay Sharp | Timed | 🔄 Regular |
| 9 | DirectionDash | `games/DirectionDash.jsx` | Quick Reflexes | Timed | 🔄 Regular |
| 10 | TimeEstimator | `games/TimeEstimator.jsx` | Think & Solve | 5 Rounds | 🔄 Regular |
| 11 | **GravitySort** | `games/GravitySort.jsx` | Sort & Prioritize | Endless | 🔄 Regular |
| 12 | **EchoMap** | `games/EchoMap.jsx` | Remember & Recall | Endless | 🔄 Regular |
| 13 | **PhaseLock** | `games/PhaseLock.jsx` | Remember & Recall | Endless | 🔄 Regular |
| 14 | **ChromaShift** | `games/ChromaShift.jsx` | Stay Sharp | Endless | 🔄 Regular |
| 15 | **WeightGuess** | `games/WeightGuess.jsx` | Think & Solve | Endless | 🔄 Regular |

---

### Level 5: Infrastructure & DevOps

| Item | File(s) | Status | Parameter |
|------|---------|--------|-----------|
| Vercel Deployment Pipeline | `vercel.json` | ✅ Built | 🔄 Regular |
| Supabase Database | `supabase/schema.sql` + `config.toml` | ✅ Built | 🔄 Regular |
| GitHub Actions CI/CD (Desktop Release) | `.github/workflows/release.yml` | ✅ Built | 🔄 Regular |
| Tauri Desktop App (Windows x64) | `marketing/src-tauri/` | ✅ Built | 🔄 Regular |
| Stripe Webhook API | `api/stripe-webhook.js` | ⚠️ Partial | 🚀 Growth |
| Environment Variables (.env) | `marketing/.env` | ✅ Built | 🔄 Regular |
| Git Version Control | `.git` | ✅ Built | 🔄 Regular |
| Automated Tests | `tests/` | ⚠️ Scaffolded | 🚀 Growth |
| i18n Localization | `locales/` | ⚠️ Scaffolded | 🚀 Growth |
| macOS Build (Universal Binary) | CI/CD | ❌ Not Built | 🚀 Growth |
| Android Build (.apk/.aab) | CI/CD | ❌ Not Built | 🚀 Growth |
| iOS Build (.ipa) | CI/CD | ❌ Not Built | 🚀 Growth |
| Linux Build (.AppImage/.deb) | CI/CD | ❌ Not Built | 🚀 Growth |
| Windows ARM Build | CI/CD | ❌ Not Built | 🚀 Growth |

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
| Path-Based Routing (React Router) | — | ❌ Not Built | 🚀 Growth |

---

## 📈 SUMMARY COUNTS

| Category | Regular (Maintenance) | Growth (To Build) |
|----------|----------------------|-------------------|
| Marketing & Landing | 10 items | 9 items |
| User Flow | 7 items | 4 items |
| App Engines | 12 items | 6 items |
| Games | 15 games | 0 (next batch TBD) |
| Infrastructure | 6 items | 8 items |
| UI Views | 6 items | 1 item |
| **TOTAL** | **56 items** | **28 items** |

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

## 🧠 Tech Stack Philosophy & Engineering Principles

### The Two Laws
1. **Quality is non-negotiable.** Never compromise user experience, design fidelity, or correctness for the sake of being lightweight.
2. **Lightweight is the second priority.** Given two tools of equal quality, always choose the one with fewer dependencies, smaller bundle size, and less abstraction.

### Decision Framework — Before Adding ANY Library
Every new dependency must pass this checklist:
1. **Is the native/vanilla solution good enough?** (e.g., vanilla CSS over Tailwind, native `fetch` over Axios)
2. **Does it add meaningful quality the user can feel?** (Recharts: yes, because hand-rolling charts is worse. Moment.js: no, `Intl.DateTimeFormat` exists.)
3. **What is its bundle size impact?** Check via [bundlephobia.com](https://bundlephobia.com). Reject anything over 50KB gzipped unless it replaces 500+ lines of custom code.
4. **Is it actively maintained?** No abandoned packages. Check npm download trends and last publish date.
5. **Does it follow our consistency rules?** One tool per job. No overlapping libraries.

### Current Tech Stack (Justified)

| Layer | Choice | Why This, Not That |
|-------|--------|-------------------|
| **Build Tool** | Vite | Instant HMR, native ESM. Not Next.js — we don't need SSR/ISR; our app is client-rendered SPA. Not Webpack — too slow, too much config. |
| **UI Framework** | React 19 (vanilla) | Industry standard component model. Not Vue/Svelte — React has the deepest ecosystem for our needs. No meta-framework needed. |
| **Styling** | Vanilla CSS + Custom Properties | Zero runtime cost. Full control. Not Tailwind — utility classes reduce readability and add build dependency. Not CSS-in-JS — runtime overhead. |
| **Desktop** | Tauri (Rust) | ~3MB binary vs Electron's ~150MB. Native OS APIs. Not Electron — bloated, ships entire Chromium. |
| **Backend** | Supabase (PostgreSQL) | Auth + DB + Storage + Realtime in one. Open-source, self-hostable. Not Firebase — vendor lock-in, proprietary query language. |
| **Deployment** | Vercel | Zero-config for Vite. Serverless functions in `/api`. Not Netlify — Vercel's monorepo support is tighter. |
| **Linter** | OxLint | 50-100x faster than ESLint (Rust-based). Not ESLint — slower, heavier config. |
| **Charts** | Recharts | Declarative, React-native, composable. Not Chart.js — imperative API, canvas-only. Not D3 — too low-level for our needs. |
| **Icons** | Lucide React + Custom SVGs | Tree-shakeable, consistent stroke style. Not FontAwesome — bloated icon font. Not Heroicons — smaller set. |
| **AI** | OpenRouter API (direct fetch) | No SDK needed, just `fetch()`. Model-agnostic. Not LangChain — massive abstraction for a simple chat call. |
| **Content** | Markdown files in repo | Git-versioned, AI-readable, zero CMS cost. Not Contentful/Sanity — vendor lock-in, costs money, adds latency. |
| **Markdown Rendering** | `react-markdown` + `remark-gfm` | Lightweight (~12KB gzipped). Not MDX — adds compile step and JSX-in-markdown complexity we don't need. |
| **Routing** | React Router | Standard path-based routing. Minimal config. |
| **Type Safety** | JSDoc + TypeScript types (no `.ts` files) | Type hints without a compile step. We use `@types/react` for IDE support but ship plain `.jsx`. |

### Dependency Budget
Our current production dependency count: **7 packages**. Target ceiling: **12 packages max**.

```
react, react-dom              → Core (non-negotiable)
@supabase/supabase-js         → Backend client
recharts                      → Data visualization
lucide-react                  → Icons
@tauri-apps/plugin-shell      → Desktop: open external browser
@tauri-apps/plugin-deep-link  → Desktop: OAuth callback
react-markdown (planned)      → Content rendering
remark-gfm (planned)          → GitHub-flavored markdown tables/lists
react-router-dom (planned)    → Path-based routing
```

### Consistency Rules
* **One tool per job.** Never install two libraries that solve the same problem.
* **Vanilla first.** If CSS can do it, don't use a library. If `fetch` can do it, don't install Axios. If `Intl` can do it, don't install Moment.
* **No utility-class CSS frameworks.** All styling is authored in `.css` files using CSS custom properties. This ensures themes work, agents can read styles, and there's zero runtime CSS cost.
* **No CSS-in-JS.** No styled-components, Emotion, or Stitches. Styles live in `.css` files, never in JavaScript.
* **No meta-frameworks.** No Next.js, Remix, or Astro. Vite + React Router is our stack. SSR is not needed — our app is entirely client-rendered.
* **No ORM.** Supabase JS client is our database layer. No Prisma, Drizzle, or Knex. SQL lives in Supabase migrations.
* **File naming:** Components use `PascalCase.jsx`. Utilities use `camelCase.js`. Config uses `camelCase.js`. Content uses `kebab-case.md`.

### Coding Standards
* **DRY & Shared Helpers:** Avoid duplicate logic. Put state helpers, formatters, and analytics triggers in centralized `utils/` modules.
* **Modular API-First Separation:** Decouple front-end view state from database logic. Communicate via Supabase JS client and `/api` serverless functions.
* **Dark & Light Themes:** Style using unified CSS custom properties (`var(--...)`) mapping to the sage-green palette. Interface must seamlessly shift between themes.
* **Mobile-First Responsive:** All layouts are fluid, responsive, and compatible with web, Tauri desktop, and future mobile shells.
* **Database Scaling:** Write clean migrations and schemas. New games get their own tables. Never alter `profiles` for game-specific data.

---

## 📝 Markdown-First Content Architecture

DopaMind adopts a **Markdown-First** content strategy. All user-facing written content (blog posts, changelogs, docs, vision statement, legal pages) MUST be authored and stored as `.md` files in the repository.

### Why Markdown-First
1. **AI-Native Discoverability:** AI agents and search crawlers can read, navigate, and index markdown natively. Your content becomes instantly parseable by any LLM or web scraper without needing a database or CMS.
2. **Git-Versioned Content:** Every blog post, changelog entry, and doc page is version-controlled with full history. No CMS lock-in, no database dependency for content.
3. **Developer & Writer Friendly:** Markdown is the universal lingua franca. Anyone can contribute content without learning a framework.
4. **Consistency & Modernity:** In the AI era, text-first formats win. Markdown renders beautifully in browsers, GitHub, editors, and inside our app.

### Content Directory Structure
```
DopaMind/
├── content/                    # All markdown content lives here
│   ├── blog/                   # Blog posts
│   │   ├── 2026-07-05-welcome.md
│   │   └── ...
│   ├── changelog/              # Version release notes
│   │   ├── v0.1.0.md
│   │   └── ...
│   ├── docs/                   # Developer documentation
│   │   ├── getting-started.md
│   │   ├── game-sdk.md         # How to build & publish new games
│   │   └── ...
│   ├── legal/                  # Privacy, Terms (markdown source)
│   │   ├── privacy-policy.md
│   │   └── terms-of-service.md
│   └── pages/                  # Static page content
│       ├── vision.md           # Why we exist, our mission
│       ├── contact.md
│       └── about.md
```

### Rendering Rule
Use a markdown rendering library (e.g., `react-markdown` + `remark-gfm`) to render `.md` files inside React components. Content authors write markdown; the app renders it with our design system's typography, colors, and spacing automatically.

### Content Frontmatter Standard
Every markdown content file MUST include YAML frontmatter:
```yaml
---
title: "Your Brain Deserves Better"
date: 2026-07-05
author: DopaMind Team
tags: [vision, brain-health]
summary: "Why we built DopaMind and what we believe about focus in the AI era."
---
```

---

## 🌍 Vision & Brand Narrative

### The Problem We Solve (Use in Marketing)
In the AI era, your brain is under siege. Infinite scroll feeds, algorithmic recommendations, and dopamine-hijacking notifications are literally shrinking your attention span. People are losing the ability to focus, remember, and think deeply. You open your phone to check one thing and suddenly 45 minutes have vanished — and you can't even remember what you originally wanted to do.

### Our Solution
DopaMind is a cognitive focus gym. Short, science-backed brain exercises that rebuild the neural pathways being eroded by digital overload. No ads. No trackers. No social feed. Just 45 seconds a day to train your brain like a muscle.

### Game Categories (User-Facing Labels — Non-Technical)
When presenting games to users, ALWAYS use these human-friendly category names:
- **Quick Reflexes** (not "Processing Speed")
- **Remember & Recall** (not "Working Memory")
- **Stay Sharp** (not "Selective Attention")  
- **Think & Solve** (not "Executive Function")
- **Word Power** (not "Verbal Fluency")
- **Sort & Prioritize** (not "Executive Prioritization")

---

## 🚀 Multi-Platform Distribution Strategy

### Build Targets

| Platform | Architecture | Format | Status |
|----------|-------------|--------|--------|
| Windows | x64 (Intel/AMD) | `.exe` + `.msi` | ✅ Built |
| Windows | ARM64 (Snapdragon) | `.exe` | 🚀 Growth |
| macOS | Universal (Intel + Apple Silicon) | `.dmg` | 🚀 Growth |
| Linux | x64 | `.AppImage` + `.deb` | 🚀 Growth |
| Android | ARM64 + ARM32 | `.apk` + `.aab` | 🚀 Growth |
| iOS | ARM64 | `.ipa` | 🚀 Growth |

### Distribution Channels
- **GitHub Releases:** Primary hosting for all desktop/mobile installers. Free unlimited bandwidth.
- **Marketing Website (`/downloads`):** User-facing download page that auto-detects OS and links to GitHub Releases.
- **Local Archive (`releases/`):** Git-ignored local folder for archiving compiled binaries during development.

### CI/CD Trigger
Push a git tag (e.g., `git tag v1.0.0 && git push --tags`) → GitHub Actions compiles for all platforms → Attaches installers to a GitHub Release draft.

---

## 🛣️ Routing Architecture

### Rule: Path-Based Routing Only
Use React Router with proper URL paths. Hash-based routing (`#section`) is acceptable only for in-page anchor scrolling on the marketing landing page.

### Route Map

| Path | Page | Auth Required? | Scope |
|------|------|---------------|-------|
| `/` | Landing/Marketing | No | Marketing |
| `/vision` | Vision / Why We Exist | No | Marketing |
| `/play` | Games Library (browse + guest play by category) | **No** | Product |
| `/play/:gameId` | Play a specific game | **No** | Product |
| `/downloads` | All-platform download page | No | Marketing |
| `/blog` | Blog articles (markdown-rendered) | No | Marketing |
| `/changelog` | Version history (markdown-rendered) | No | Marketing |
| `/contact` | Support / Contact Us | No | Marketing |
| `/docs` | Developer documentation (markdown-rendered) | No | Marketing |
| `/dashboard` | User dashboard (scores, streaks, charts) | **Yes** | Product |
| `/gym` | Brain Gym (AI-guided workouts) | **Yes** | Product |
| `/settings` | User settings & profile | **Yes** | Product |

### Marketing CTA
The primary call-to-action button on the marketing landing page MUST read **"Enter Brain Gym"** or **"Explore Brain Gym"** — never generic "Login" or "Sign Up".

### Desktop App Behavior
When running inside Tauri (`window.__TAURI_INTERNALS__` is present), skip the marketing landing page entirely and boot directly to the auth screen or dashboard.

### Guest Play
Users can browse all games at `/play` organized by category and play individual games WITHOUT creating an account. Sign-in is only required for:
- Saving scores & history
- Streaks & plant growth
- Leaderboard participation
- AI-guided workout schedules

---

## 🔧 Branding Configuration

All branding is centralized in `marketing/src/config/brand.js`. To change the app name, tagline, logo, or description across the entire platform, edit this single file:

```js
export const BrandConfig = {
  name: "DopaMind",
  tagline: "Rewire your dopamine.",
  description: "Rebuild your attention span in 45 seconds a day...",
  logoUrl: "/logo.svg",
  faviconUrl: "/favicon.svg",
};
```
