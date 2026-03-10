# CLAUDE.md — Yappan's Weather Forecast

Context file for Claude Code. Read this before making any changes.

---

## Project Overview

Full-stack weather app built with Next.js 16 (App Router). Fetches live weather data, displays a 3D globe, live webcams, activity recommendations, forecast accuracy tracking, and monthly climate history. Fully bilingual (English / Swedish).

**Live URL:** https://weather-app-wheat-sigma-68.vercel.app
**GitHub:** https://github.com/MaiLeeYap/weather-app
**Deploy:** `npx vercel --prod`

---

## Tech Stack

- **Framework:** Next.js 16.1.6, App Router, TypeScript 5
- **Styling:** Tailwind CSS v4 — light mode only
- **3D Globe:** `react-globe.gl` (Three.js), loaded via `next/dynamic` with `ssr: false`
- **Icons:** `lucide-react`
- **Deployment:** Vercel (auto-deploys on push to `main`)

---

## Common Commands

```bash
npm run dev        # Start dev server at localhost:3000
npm run build      # Production build (run to check for TypeScript errors)
npx vercel --prod  # Deploy to production
git push origin main  # Push to GitHub (triggers no auto-deploy — use vercel CLI)
```

---

## Architecture

### API Routes (`app/api/`)
All external API calls go through Next.js route handlers — never called directly from the browser.

| Route | Purpose | Cache |
|---|---|---|
| `/api/weather` | Open-Meteo forecast (current + hourly + daily) | 10 min |
| `/api/accuracy` | Open-Meteo archive — yesterday's observed data | 10 min |
| `/api/climate` | 5-year monthly climate averages (archive) | 24 hrs |
| `/api/webcams` | Windy Webcams API — nearby live cameras | 5 min |

### State Flow
```
CitySearch → handleCitySelect (WeatherApp)
  → fetch /api/weather + /api/accuracy in parallel
  → setForecast, setAccuracyResult
  → child components receive slices as props
```

### Two-Column Layout
```
WeatherApp (grid grid-cols-1 lg:grid-cols-2)
  ├── LEFT col (order-1)  — weather data cards
  └── RIGHT col (order-2) — globe + map + photo + webcams
```
On mobile (single column) the LEFT col renders first — weather data before visuals.

---

Working Method

When solving problems:

- Understand the task
- Ask clarifying questions if needed
- Read only the relevant files
- Propose a solution
- Implement changes
- Avoid scanning the entire codebase unless necessary.

## Purpose

Claude assists with UX design, research, workshops, and product thinking.
Prioritize clear structure, practical outputs, and user-centered reasoning.

---

# Working Method

When solving problems:

1. Understand the problem
2. Ask clarifying questions if needed
3. Structure the problem
4. Propose multiple options
5. Recommend a direction

Avoid jumping directly to a solution.

---

# UX Principles

Prioritize:

* user goals over stakeholder opinions
* clarity and simplicity
* low cognitive load
* consistent interaction patterns
* accessibility and inclusion
* evidence-based decisions

Explain **why** a suggestion improves the experience.

---

# Output Style

Prefer:

* headings
* bullet points
* short sections
* tables when helpful

Avoid long unstructured paragraphs.

---

# Quick UX Heuristics

When evaluating designs, check for:

Clarity
Is it obvious what users can do?

Hierarchy
Is the most important information easiest to see?

Cognitive load
Does the interface require unnecessary thinking?

Feedback
Do actions provide clear system feedback?

Error prevention
Can users avoid mistakes or recover easily?

Accessibility
Are contrast, labels, and interaction patterns inclusive?

---

# Figma & Design Systems

Prefer scalable design decisions:

* reusable components
* consistent spacing systems (e.g. 8px grid)
* clear component states
* alignment with existing design systems

Avoid creating one-off patterns when reusable ones exist.

---

# Research Support

When helping with research:

Use neutral, open-ended questions focused on **user behavior**.

When synthesizing research:

Insight
Evidence
User impact
Design implication

Focus on patterns rather than individual comments.

---

# Commands

## /ux-review

Review a design using:

What works well
Usability issues
Accessibility risks
Questions
Suggested improvements

---

## /problem-framing

Structure a product problem:

Problem
Users affected
Current behavior
Desired behavior
Constraints
Success metrics

---

## /research-plan

Generate:

Research goal
Key questions
Method
Participants
Discussion guide

---

## /workshop-plan

Create a workshop structure:

Objective
Participants
Preparation
Agenda
Activities
Expected outputs

---

# When Information Is Missing

Ask clarifying questions before producing large outputs.
Avoid strong assumptions about product context.

## Key Conventions

### Styling — Light Mode
- Cards: `background: var(--card-bg)` (#ffffff), `border: 1px solid var(--card-border)`
- Accent: `var(--accent-blue)` = `#2563eb`
- **Never use** `backdropFilter: blur()` — removes GPU load on opaque white surfaces
- Tailwind light shades (`text-slate-100` through `text-slate-600`) are globally remapped to dark tones in `globals.css` — components can keep these classes and they will be readable on white

### Colours — WCAG AA minimum on white (#ffffff)
| Use | Hex | Ratio |
|---|---|---|
| Success / good | `#16a34a` | 4.8:1 |
| Warning | `#a16207` | 5.9:1 |
| Danger / error | `#dc2626` | 4.8:1 |
| Hot temp (>26°C) | `#DD0D0D` | 5.0:1 |
| Green temp (≤15°C) | `#14A736` | 3.2:1 |
| Muted text | `#64748b` | 4.6:1 |

Do not use pastel shades (`green-400`, `yellow-400`, etc.) — they fail contrast.

### Translations (i18n)
- All UI strings live in `lib/i18n.ts` as `en` and `sv` objects
- `sv` is typed as `typeof en` — TypeScript will error if a key is missing
- Access via `const { t, lang } = useLanguage()` from `lib/LanguageContext.tsx`
- Default language: **Swedish (`sv`)**
- When adding a new string: add to both `en` and `sv` in `lib/i18n.ts`

### WMO Weather Codes
- `lib/wmo.ts` exports `getWMO(code, lang)` → `{ description: string; emoji: string }`
- Always pass `lang` from `useLanguage()` so descriptions appear in the correct language

### Mobile
- Viewport meta is set via `export const viewport: Viewport` in `app/layout.tsx`
- Search input must stay at `font-size: 16px` — iOS Safari zooms in on any input < 16px
- Globe height is responsive: 260px on < 480px wide, 380px otherwise (set via ResizeObserver in `GlobeView.tsx`)

### Forecast Accuracy Tracking
- Today's forecast is stored to `localStorage` via `storeTodayForecast()` on every city search
- The next day, `computeAccuracy()` compares stored vs actual
- Date comparison uses `stored.forDate === actualData.date` — both are Open-Meteo city-local dates, avoiding UTC timezone bugs

### Recent Search History
- Key: `wx_recent_searches`, max 10 entries
- Initialised synchronously in `useState(() => loadRecent())` — no useEffect timing gap
- `handleFocus` refreshes from localStorage on every focus and shows history when `results.length === 0`

---

## Environment Variables

```env
# .env.local
WINDY_WEBCAMS_API_KEY=your_key_here
```

Only one secret required. All other APIs (Open-Meteo, Wikipedia, Windy embed) are free and keyless.

---

## Files to Know

```
app/
  layout.tsx          ← viewport, metadata
  globals.css         ← CSS variables, light-mode Tailwind overrides
components/
  WeatherApp.tsx      ← root layout, all state, language provider wrapper
  CitySearch.tsx      ← search input + recent history dropdown
  GlobeView.tsx       ← 3D globe (SSR-disabled, ResizeObserver for width+height)
  CurrentConditions.tsx
  HourlyForecast.tsx
  DailyForecast.tsx
  ForecastAccuracy.tsx
  ActivityFinder.tsx
  MonthlyClimate.tsx
  WindyMap.tsx
  CityPhoto.tsx
  CityWebcam.tsx
lib/
  i18n.ts             ← all translation strings (EN + SV)
  LanguageContext.tsx ← React context + useLanguage() hook
  wmo.ts              ← WMO code map with EN + SV descriptions
  types.ts            ← shared TypeScript interfaces
  utils.ts            ← slot builders, colour helpers, activity scorer
  accuracy.ts         ← localStorage forecast storage + scoring logic
  openmeteo.ts        ← city search (Geocoding API)
```
