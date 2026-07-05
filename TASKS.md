# DopaMind v2.0 — Task List for AI Agent

READ FIRST: `.agents/skills/dopamind/SKILL.md` — this is your bible. Every decision is documented there.

## Phase 1: Install Dependencies
```bash
cd marketing && npm install react-router-dom react-markdown remark-gfm
```

## Phase 2: Core Router (Do This First)

### Task 2.1: Implement `src/Router.jsx`
- Read the comments in `src/Router.jsx` for exact route map
- Use `BrowserRouter`, `Routes`, `Route` from react-router-dom
- Wrap `/dashboard`, `/gym`, `/settings` with `<ProtectedRoute>`
- Add desktop detection: if `window.__TAURI_INTERNALS__`, redirect `/` → `/dashboard`

### Task 2.2: Implement `src/components/ProtectedRoute.jsx`
- Read comments in file. Check `supabase.auth.getSession()`
- No session → `<Navigate to="/" />` + trigger auth modal via URL param

### Task 2.3: Update `src/main.jsx`
- Replace `<App />` with `<Router />`
- Keep existing CSS imports

### Task 2.4: Update `vite.config.js`
- Add SPA fallback for Vite dev server (all routes serve index.html)

## Phase 3: Extract Pages from App.jsx

### Task 3.1: Implement `src/pages/LandingPage.jsx`
- Read comments in file. Extract visitor landing JSX from `App.jsx` lines ~1048-1180
- Change CTA button text from "Access Gym Room" to "Enter Brain Gym"
- Keep download buttons, hero, games grid, streak section, FAQ, footer

### Task 3.2: Keep `App.jsx` as the authenticated app shell only
- App.jsx should only contain: sidebar, dashboard, brain gym, settings, game engine
- Remove the visitor landing return block (moved to LandingPage.jsx)
- App.jsx is rendered at `/dashboard`, `/gym`, `/settings` routes

## Phase 4: Implement MarkdownRenderer

### Task 4.1: Implement `src/components/MarkdownRenderer.jsx`
- Read comments in file. Use react-markdown + remark-gfm
- Add CSS class `markdown-content` for typography styling
- Add basic markdown CSS to `App.css` (headings, lists, code blocks, tables)

## Phase 5: Build New Pages (Each reads its own comments)

### Task 5.1: `src/pages/VisionPage.jsx`
- Read comments in file. Load `content/pages/vision.md` and render with MarkdownRenderer

### Task 5.2: Write `content/pages/vision.md`
- Read the HTML comment instructions inside the file for structure
- Read SKILL.md → "Vision & Brand Narrative" for tone and content

### Task 5.3: `src/pages/DownloadsPage.jsx`
- Read comments in file. Auto-detect OS, show download grid for all platforms
- GitHub Release URLs: `https://github.com/kishankkt/Dopamind/releases/latest/download/FILENAME`

### Task 5.4: `src/pages/GamesLibraryPage.jsx`
- Read comments in file. Category tabs + game cards. NO auth required.
- Categories from SKILL.md: Quick Reflexes, Remember & Recall, Stay Sharp, Think & Solve, Word Power, Sort & Prioritize

### Task 5.5: `src/pages/BlogPage.jsx`
- Read comments in file. List blog posts, render individual posts with MarkdownRenderer

### Task 5.6: `src/pages/ChangelogPage.jsx`
- Read comments in file. Render version history from `content/changelog/`

### Task 5.7: `src/pages/ContactPage.jsx`
- Read comments in file. Contact form + support info

### Task 5.8: `src/pages/DocsPage.jsx`
- Read comments in file. Sidebar nav + markdown doc renderer

## Phase 6: Write Markdown Content

### Task 6.1: `content/pages/vision.md` — Full vision/mission page (read comments in file)
### Task 6.2: `content/blog/2026-07-05-welcome.md` — Launch blog post (read comments in file)
### Task 6.3: `content/changelog/v0.1.0.md` — Release notes (read comments in file)
### Task 6.4: `content/docs/getting-started.md` — Dev setup guide (read comments in file)
### Task 6.5: `content/docs/game-sdk.md` — Game SDK docs (read SKILL.md → Game API Contract)
### Task 6.6: `content/legal/privacy-policy.md` — Extract from App.jsx lines ~1276-1293
### Task 6.7: `content/legal/terms-of-service.md` — Extract from App.jsx lines ~1296-1313

## Phase 7: Vercel SPA Config

### Task 7.1: Update `vercel.json` to handle SPA routing
- Add rewrites: all routes → `/index.html`

## RULES
- Read SKILL.md before writing ANY code
- Read the comments at the top of each file before implementing
- Vanilla CSS only. No Tailwind. No styled-components.
- Max 12 npm dependencies total (check package.json)
- Use `BrandConfig` from `src/config/brand.js` for all brand text
- Dark/light theme must work on every new page
