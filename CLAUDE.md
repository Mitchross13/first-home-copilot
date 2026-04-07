# First Home Co-Pilot

Australian first home buyer web app. React + Vite. No backend (localStorage only for now).

## Stack
- React 18, Vite 5, no CSS framework (inline styles throughout)
- `src/App.jsx` — main component (calculator prototype, ~430 lines)
- `src/main.jsx` — entry point
- `index.html` — root HTML

## Current state
- Calculator built and working: state-aware stamp duty, LMI, grant eligibility (FHOG, 5% Deposit Scheme, Help to Buy), cost breakdown, repayment estimate
- Dev server: `npm run dev` (needs `export PATH="/c/Program Files/nodejs:$PATH"` first)
- NOT yet deployed. No git repo yet.

## What's next (priority order)
1. `git init` + initial commit
2. Deploy to Vercel
3. Journey Tracker — `src/components/journey/` — 7 stages, checklists, localStorage persistence
4. Jargon Buster — inline tooltips
5. AI chat (Claude API, gated behind freemium)
6. Document Vault

## Agent coordination
See `AGENTS.md` for lock file conventions. Always check locks before touching shared files.
Always write a lock before starting work, release on completion.

## Token efficiency rules
- Read `CLAUDE.md` first, skip reading files you don't need to touch
- Prefer Edit over Write for existing files
- Don't read `node_modules`, `dist`, `.git`
- Ask before running npm install (already done)
