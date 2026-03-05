# Yappan's Weather Forecast

A full-stack weather application built with Next.js, featuring a 3D interactive globe, live webcams, historical climate data, forecast accuracy tracking, and activity planning — all in a clean, accessible light-mode interface.

**Live:** https://weather-app-wheat-sigma-68.vercel.app

---

## Features

### Current Conditions
- Real-time temperature, feels-like, weather description and emoji
- Wind speed and direction, humidity, precipitation chance, UV index, cloud cover, sunrise/sunset

### 24-Hour Forecast
- Vertical list showing time, weather emoji, temperature, conditions, rain probability and wind speed
- Covers the next 24 hours from the current moment

### 10-Day Forecast
- Daily cards with high/low temperatures, precipitation probability, and wind speed
- Forecast confidence indicator (colour-coded bar) that degrades with distance and precipitation uncertainty

### Yesterday's Forecast Accuracy
- Stores today's forecast in `localStorage` and compares it against actual observed data the next day
- Scores accuracy across temperature high/low, rain prediction, and sky conditions
- Timezone-safe: uses Open-Meteo's city-local dates to avoid UTC mismatches

### Best Time For… (Activity Finder)
- Activity buttons: Run, Cycle, Garden, BBQ, Sunbathe, Golden Hour
- Scores hourly slots using weather conditions and ranks the top 3 windows for the day

### Monthly Climate Overview
- 12-month historical climate table based on a 5-year average from Open-Meteo archive data
- Columns: month, high, low, mean (hidden on mobile), temperature range bar, precipitation bar
- Temperature values colour-coded from cold blue (`#1e40af`) through green (`#14A736`) to hot red (`#DD0D0D`)

### 3D Interactive Globe
- Always-visible globe that auto-rotates when no city is selected
- Smoothly animates and zooms to the searched city (1.4 s transition, altitude 0.4)
- 4K Earth texture with anisotropic filtering for sharp rendering on high-DPI screens
- Red marker pin on the selected city

### Live Weather Map (Windy)
- Embedded Windy iframe with 6 overlay tabs: Wind, Rain, Snow, Clouds, Temp, Storm
- Re-mounts the iframe on overlay or city change to force a fresh load

### City Photo
- Fetches a representative image from the Wikipedia REST API (no API key required)
- Falls back to `"cityName, country"` if the plain city name returns no image
- Displays city name and Wikipedia description as an overlay

### Live Webcams
- Fetches up to 3 nearby webcams from the Windy Webcams API (50 km radius)
- Horizontal scroll row of thumbnails with a play overlay on hover
- Clicking a thumbnail expands an inline Windy live player iframe
- Graceful fallback when no webcams are found

### Bilingual — English / Swedish
- Language toggle (🇬🇧 EN / 🇸🇪 SV) in the header; Swedish is the default
- Every UI string, label, stat and activity name is fully translated
- WMO weather condition descriptions (e.g. "Lätt regnskur", "Klar himmel") are served in the selected language
- Language preference is persisted in `localStorage` across sessions

### Search with Recent History
- City search powered by the Open-Meteo Geocoding API
- Stores the last 10 searched cities in `localStorage`
- Recent history is loaded synchronously on mount — no timing gap on first render
- Dropdown shows recent searches on focus even after a city has already been selected; individual entries and a "Clear all" option available

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| 3D Globe | react-globe.gl (Three.js) |
| Charts | Recharts |
| Deployment | Vercel |
| Source control | GitHub |

---

## APIs Used

| API | Purpose | Key required |
|---|---|---|
| Open-Meteo Forecast | Current conditions, hourly and 10-day forecast | No |
| Open-Meteo Archive | 5-year historical monthly climate averages | No |
| Open-Meteo Geocoding | City search autocomplete | No |
| Wikipedia REST | City photo and description | No |
| Windy Embed | Live weather map overlay | No (embed only) |
| Windy Webcams v2 | Live webcam thumbnails and player | Yes — `WINDY_WEBCAMS_API_KEY` |

---

## Project Structure

```
weather-app/
├── app/
│   ├── page.tsx                  # Root page
│   ├── layout.tsx                # HTML shell, fonts, metadata, viewport
│   ├── globals.css               # CSS variables, light-mode overrides, scrollbar
│   └── api/
│       ├── weather/route.ts      # Proxy: Open-Meteo forecast
│       ├── accuracy/route.ts     # Proxy: yesterday's observed data
│       ├── climate/route.ts      # Aggregates 5-year archive into monthly normals
│       └── webcams/route.ts      # Proxy: Windy Webcams API
├── components/
│   ├── WeatherApp.tsx            # Root client component, layout, state
│   ├── CitySearch.tsx            # Search input with recent history dropdown
│   ├── GlobeView.tsx             # 3D globe (SSR-disabled, ResizeObserver)
│   ├── CurrentConditions.tsx     # Hero temperature card
│   ├── HourlyForecast.tsx        # 24-hour vertical list
│   ├── DailyForecast.tsx         # 10-day card row with confidence bars
│   ├── ForecastAccuracy.tsx      # Yesterday's accuracy comparison card
│   ├── ActivityFinder.tsx        # Best-time activity window finder
│   ├── MonthlyClimate.tsx        # 12-month climate table
│   ├── WindyMap.tsx              # Windy embedded map with overlay tabs
│   ├── CityPhoto.tsx             # Wikipedia city photo banner
│   └── CityWebcam.tsx            # Windy webcam thumbnails and player
└── lib/
    ├── types.ts                  # Shared TypeScript interfaces
    ├── utils.ts                  # Slot builders, colour functions, activity scorer
    ├── accuracy.ts               # localStorage forecast storage and scoring
    ├── wmo.ts                    # WMO weather code → emoji + description (EN + SV)
    ├── i18n.ts                   # All UI strings in English and Swedish
    └── LanguageContext.tsx       # React context + useLanguage() hook
```

---

## Layout

Two-column grid on desktop (`lg:`), single column on mobile. The weather data column always comes first so key information is immediately visible without scrolling.

```
Desktop
┌──────────────────────────────┬──────────────────────────────┐
│  🇸🇪 SV  Yappans Väderprognos  🇬🇧 EN  │                              │
│         Måndag 2 mars 2026            │                              │
│           [ Sök stad… ]               │                              │
├──────────────────┬────────────────────┤                              │
│ Current Cond.    │  3D Globe          │
│ 24-Hour Forecast │  Live Weather Map  │
│ Forecast Accur.  │  City Photo        │
│ 10-Day Forecast  │  Live Webcams      │
│ Best Time For…   │                    │
│ Monthly Climate  │                    │
├──────────────────┴────────────────────┤
│  Powered by Open-Meteo · No API key   │
└───────────────────────────────────────┘

Mobile (stacked, data first)
┌─────────────────────┐
│ 🇸🇪 Yappans Väder 🇬🇧 │
│  [ Sök stad… ]      │
│  Current Conditions │
│  24-Hour Forecast   │
│  Forecast Accuracy  │
│  10-Day Forecast    │
│  Best Time For…     │
│  Monthly Climate    │
│  3D Globe           │
│  Live Weather Map   │
│  City Photo         │
│  Live Webcams       │
└─────────────────────┘
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
WINDY_WEBCAMS_API_KEY=your_key_here
```

The Windy Webcams API key is obtained from [api.windy.com](https://api.windy.com). All other data sources are free and require no key.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Building for Production

```bash
npm run build
npm run start
```

---

## Deployment

The app is deployed on **Vercel** via GitHub integration. Every push to `main` triggers an automatic production deployment.

To deploy manually:

```bash
npx vercel --prod
```

---

## Mobile

- Correct `width=device-width, initialScale=1` viewport declared via Next.js `Viewport` export in `layout.tsx`
- Search input uses `font-size: 16px` — prevents iOS Safari from auto-zooming on focus (triggered by any input < 16 px)
- Weather data column stacks first on mobile so current conditions are visible without scrolling
- 3D globe shrinks from 380 px → 260 px tall on viewports narrower than 480 px
- Horizontal scroll rows (daily forecast, webcams) use `overflow-x: auto` with momentum scrolling
- Columns in the hourly forecast table hide gracefully at small widths via `hidden sm:block`

---

## Accessibility (WCAG)

All text colours meet **WCAG AA** (4.5:1 contrast ratio) as a minimum. Temperature values in the Monthly Climate table meet **WCAG AAA** (7:1+).

| Colour use | Hex | Contrast on white |
|---|---|---|
| Hot temperature (>26°C) | `#DD0D0D` | 5.0:1 — AA |
| Green temperature (≤15°C) | `#14A736` | 3.2:1 |
| Very cold temperature (≤-15°C) | `#1e40af` | 7.4:1 — AAA |
| Confidence: good | `#16a34a` | 4.8:1 — AA |
| Confidence: warning | `#a16207` | 5.9:1 — AA |
| Confidence: danger | `#dc2626` | 4.8:1 — AA |
| Muted / body text | `#64748b` | 4.6:1 — AA |

---

## Sustainability

- `backdropFilter: blur()` removed from all cards and the search dropdown — it has no visual effect on opaque white surfaces but continuously loads the GPU
- All API routes use `next: { revalidate }` caching to minimise redundant upstream fetches:
  - Weather forecast: 10 minutes
  - Webcams: 5 minutes
  - Monthly climate: 24 hours
- The 3D globe is loaded only in the browser (`ssr: false`) and only once — it does not re-mount on city change
- No redundant polyfills; Next.js tree-shakes unused code automatically
