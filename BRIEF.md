# First Home Co-Pilot - Project Brief

## Vision
The house buying process is the biggest financial decision most people ever make, and everyone is expected to wing it. First Home Co-Pilot guides first home buyers through the entire journey, step by step, so they never feel lost or blindsided.

## Target User
Australian first home buyers. People who have never bought property before, don't know what a conveyancer is, don't understand LVR or LMI, and are relying on a mortgage broker who is incentivised to close the deal rather than educate them.

## Core Problems We Solve
1. **You don't know what you don't know** - people discover critical steps (like needing a conveyancer) only after it's too late
2. **Every professional wants different documents** - banks, brokers, conveyancers all ask for the same assets/liabilities/bank statements in different formats, and it's painful every time
3. **Government grants are confusing** - FHOG, 5% Deposit Scheme, Help to Buy, stamp duty concessions all have different eligibility rules per state
4. **Decisions happen fast** - you find a property, you have days to decide, and you have no framework for evaluating it
5. **Nobody explains the "why"** - what is LMI, why do I need building and pest, what's a cooling-off period

## Competitive Landscape
- REA / Domain: property search only, no buyer journey guidance
- Bank apps (CBA, Westpac): mortgage calculators, pre-approval, but only for their products
- Government sites: grant info but fragmented across state revenue offices and Housing Australia
- PocketSmith / budgeting apps: savings tracking, not home-buying specific
- **The gap**: nobody stitches search + finance + legal + grants + progress tracking into one journey for first home buyers

## Feature Set (MVP Priority Order)

### 1. Cost Calculator + Grant Eligibility (PROTOTYPE BUILT)
- State-aware stamp duty calculation
- LMI estimation based on LVR
- Grant eligibility checker (FHOG, 5% Deposit Scheme, Help to Buy, state concessions)
- Full upfront cost breakdown including conveyancing, inspections, insurance, transfer fees
- Monthly repayment estimates with stress-test rate
- "Things first home buyers often miss" education section

### 2. Journey Tracker
- Visual pipeline: Saving > Pre-approval > Searching > Offer > Contract > Settlement > Move in
- Each stage has: checklist of tasks, educational content, warnings about common mistakes
- State-specific variations (cooling-off periods, contract processes)
- Progress persistence across sessions

### 3. Document Vault + Export
- Store assets, liabilities, income proof, bank statements, ID documents
- Pre-formatted export packages for: mortgage brokers, banks, conveyancers
- "Every broker and bank asks for the same stuff. Upload once, export to anyone."
- Secure local storage with optional cloud backup

### 4. Jargon Buster
- Plain English dictionary of property/finance terms
- Contextual: terms are explained inline when they appear in the app
- Examples: LVR, LMI, offset account, redraw, strata levies, Section 32, caveat, settlement

### 5. AI Guidance Layer
- Ask questions in natural language about your specific situation
- Context-aware: knows which stage you're at, which state, your financials
- "Should I get a building inspection?" > explains why, typical cost, how to book one, what to look for

## Technical Direction
- React + Vite for web
- Mobile: PWA first, then React Native if traction warrants it
- Tailwind CSS for styling
- State management: Zustand or React Context (keep it simple)
- Data persistence: localStorage for MVP, backend later
- Auth: none for MVP (local-first), add later for cloud sync

## Design Principles
- Clean, calm, trustworthy aesthetic (people are stressed when buying a house)
- No jargon without explanation
- Mobile-first (people browse properties on their phone)
- Progress visibility at all times (where am I, what's next)
- Actionable: every screen should tell you what to DO, not just what to know

## Key Insight from Market Research
The Australian government expanded the 5% Deposit Scheme in October 2025: no place limits, no income caps, higher property price caps. Help to Buy launched December 2025 with up to 40% shared equity for new homes. These are new and most first home buyers don't know about them yet. Being the app that surfaces this info contextually is a differentiator.

## Monetisation (Future)
- Freemium: calculator + journey tracker free, document vault + AI guidance paid
- Referral partnerships: independent mortgage brokers, conveyancers, building inspectors
- Never compromise user trust. The user is the customer, not the lender.

## File Structure (Suggested)
```
src/
  components/
    calculator/     - Cost calculator (prototype exists)
    journey/        - Journey tracker + checklists
    vault/          - Document vault + export
    jargon/         - Jargon buster
    ai/             - AI guidance chat
    common/         - Shared UI components
  data/
    states.js       - State-specific stamp duty, grants, rules
    journey.js      - Journey stages, checklists, content
    glossary.js     - Jargon definitions
  pages/
    Home.jsx
    Calculator.jsx
    Journey.jsx
    Vault.jsx
  App.jsx
  main.jsx
```
