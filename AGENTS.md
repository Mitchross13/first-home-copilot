# Agent Coordination

Multiple Claude Code instances may work on this project simultaneously.
Use lock files to avoid conflicts.

## Lock directory
`.locks/` — each file represents an active lock.

## Lock file naming
`{resource}.lock` where resource is:
- `devserver` — the Vite dev server process
- `app_jsx` — src/App.jsx
- `journey` — src/components/journey/
- `package_json` — package.json + npm install
- `git` — any git operation
- `deploy` — Vercel deployment

## Protocol
1. Before starting work on a resource: check if `.locks/{resource}.lock` exists
2. If it exists: read it to see which agent owns it and what it's doing — wait or pick a different task
3. If it doesn't exist: create it immediately with content:
   ```
   agent: [brief description of this session's focus]
   task: [what you're doing]
   started: [timestamp]
   ```
4. When done: delete the lock file

## Example lock file content
```
agent: journey-tracker build
task: building src/components/journey/JourneyTracker.jsx
started: 2026-04-07
```

## Hard rules
- Never edit a file that has an active lock owned by another agent
- Only one agent runs the dev server at a time (devserver.lock)
- Only one agent runs npm install at a time (package_json.lock)
- Git operations are exclusive (git.lock)
