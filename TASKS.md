# DopaMind — Follower Task List (Restructuring & Phase 2)

READ FIRST: `C:\Users\PREMIUM\.gemini\config\skills\leader-follower\SKILL.md` — this is your constitution. Every decision is documented there.
READ SECOND: `C:\Users\PREMIUM\Desktop\Agentic-Proejcts\DopaMind\.agents\skills\dopamind\SKILL.md` — for project-specific constraints.

## Phase 1: Structural Reorganization

### Task 1.1: Execute Restructure Script
- Run `node "C:\Users\PREMIUM\.gemini\antigravity-ide\brain\726234de-e142-416a-90f7-d47e01323579\scratch\restructure.js"` from the `marketing` directory.
- This will move all files from the monolithic `src/pages`, `src/views`, `src/components` into `src/website` and `src/app`.

### Task 1.2: Fix Imports
- The automated move will break all relative imports across the project.
- You must go through `Router.jsx`, `AppShell.jsx` (formerly App.jsx), and all pages/components to fix their import paths.
- Ensure `npm run build` in the `marketing` folder succeeds with zero errors before moving to Phase 2.

## Phase 2: Trial & Username Routing (User Features)

### Task 2.1: Update `marketing/src/Router.jsx`
- Add a new route: `<Route path="/:username" element={<AppShell />} />`
- Add a new route: `<Route path="/trial/:fingerprint" element={<AppShell />} />`
- Ensure these are added below specific routes (like `/pricing`) so they don't override them.

### Task 2.2: Implement Trial & Username Logic in `AppShell.jsx`
- Open `marketing/src/app/core/auth/AppShell.jsx` (the new location).
- Import `useParams` from `react-router-dom`.
- Extract `username` and `fingerprint`.
- If `fingerprint` exists, bypass the Supabase Auth check and set a mock session: `{ user: { id: fingerprint, email: "Trial Guest", isTrial: true } }`.
- If `username` exists, fetch the user profile for that username (or handle the display logic for that user's public dashboard).

## WHEN COMPLETE

Output this block:

---FOLLOWER REPORT---
Tasks completed: [list numbers]
Files modified: [list modified files]
Issues encountered: [describe, or "none"]

→ Paste this to your Leader model:
"Verify follower work. Restructuring complete and imports fixed. Phase 2 features added. Check for regressions via npm run build."
---END FOLLOWER REPORT---
