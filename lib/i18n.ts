export type Language = "en" | "sv";

const en = {
  // ── App shell ─────────────────────────────────────────────────────────────
  appTitle: "Yappan's Weather Forecast",
  loadingForecast: "Loading forecast…",
  searchPrompt: "Search for a city to see the forecast",
  poweredBy: "Powered by Open-Meteo · No API key needed",

  // ── Search ────────────────────────────────────────────────────────────────
  searchPlaceholder: "Search city…",
  recentSearches: "Recent searches",
  clearAll: "Clear all",
  noResults: "No results found",

  // ── Current conditions ────────────────────────────────────────────────────
  feelsLike: "Feels like",
  wind: "Wind",
  humidity: "Humidity",
  precipChance: "Precip. chance",
  uvIndexLabel: "UV Index",
  cloudCover: "Cloud cover",
  sunriseSunset: "Sunrise / Sunset",
  uvLow: "Low",
  uvModerate: "Moderate",
  uvHigh: "High",
  uvVeryHigh: "Very High",
  uvExtreme: "Extreme",

  // ── Hourly forecast ───────────────────────────────────────────────────────
  hourlyTitle: "24-Hour Forecast",
  time: "Time",
  temp: "Temp",
  conditions: "Conditions",
  rain: "Rain",

  // ── Daily forecast ────────────────────────────────────────────────────────
  dailyTitle: "10-Day Forecast",
  barConfidence: "Bar = forecast confidence",
  today: "Today",
  tomorrow: "Tomorrow",
  confidenceHigh: "High (>75%)",
  confidenceModerate: "Moderate (50–75%)",
  confidenceLow: "Low (30–50%)",
  confidenceUncertain: "Uncertain (<30%)",
  conf: "conf.",

  // ── Forecast accuracy ─────────────────────────────────────────────────────
  accuracyTitle: "Yesterday's Forecast Accuracy",
  trackingStartedMsg:
    "Tracking started — check back tomorrow to see how accurate today's forecast was.",
  searchToTrack: "Search a city to start tracking forecast accuracy.",
  high: "High",
  low: "Low",
  sky: "Sky",
  rained: "rained",
  rainLabel: "rain",
  dry: "dry",
  accuracySpotOn: "Spot on 🎯",
  accuracyGood: "Pretty accurate",
  accuracyDecent: "Decent",
  accuracySoso: "So-so",
  accuracyMissed: "Missed it",

  // ── Activity finder ───────────────────────────────────────────────────────
  activityTitle: "Best Time For…",
  activitySubtitle: "Pick an activity to see your best 3-hour windows today",
  pick: "pick",
  conditionsScore: "Conditions score",
  goldenHourNote:
    "Golden hour windows are outside the next 24h slots, but today's moments are:",
  sunrise: "Sunrise",
  sunset: "Sunset",
  noWindow: "No suitable window found for",
  noWindowSuffix: "in the next 24h.",
  scoreExcellent: "Excellent",
  scoreGood: "Good",
  scoreFair: "Fair",
  scorePoor: "Poor",
  scoreAvoid: "Avoid",
  activityRun: "Run",
  activityCycle: "Cycle",
  activityGarden: "Garden",
  activityBBQ: "BBQ",
  activitySunbathe: "Sunbathe",
  activityGolden: "Golden hr",

  // ── Monthly climate ───────────────────────────────────────────────────────
  climateTitle: "Monthly Climate Overview",
  fiveYearAvg: "5-year average",
  monthCol: "Month",
  climateHigh: "High",
  climateLow: "Low",
  climateMean: "Mean",
  tempRange: "Temp range",
  precipitation: "Precipitation",
  climateFooter: (start: number, end: number) =>
    `Based on daily archive data ${start}–${end} · Open-Meteo`,
  months: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ] as string[],

  // ── Windy map ─────────────────────────────────────────────────────────────
  liveMap: "Live Weather Map",
  overlayWind: "Wind",
  overlayRain: "Rain",
  overlaySnow: "Snow",
  overlayClouds: "Clouds",
  overlayTemp: "Temp",
  overlayStorm: "Storm",

  // ── Webcams ───────────────────────────────────────────────────────────────
  webcamsTitle: "Live Webcams",
  webcamsNear: "near",
  noWebcams: "No live webcams found near",
};

const sv: typeof en = {
  // ── App shell ─────────────────────────────────────────────────────────────
  appTitle: "Yappans Väderprognos",
  loadingForecast: "Laddar prognos…",
  searchPrompt: "Sök efter en stad för att se prognosen",
  poweredBy: "Drivs av Open-Meteo · Ingen API-nyckel behövs",

  // ── Search ────────────────────────────────────────────────────────────────
  searchPlaceholder: "Sök stad…",
  recentSearches: "Senaste sökningar",
  clearAll: "Rensa alla",
  noResults: "Inga resultat hittades",

  // ── Current conditions ────────────────────────────────────────────────────
  feelsLike: "Känns som",
  wind: "Vind",
  humidity: "Luftfuktighet",
  precipChance: "Nederbördschans",
  uvIndexLabel: "UV-index",
  cloudCover: "Molntäcke",
  sunriseSunset: "Soluppgång / Solnedgång",
  uvLow: "Låg",
  uvModerate: "Måttlig",
  uvHigh: "Hög",
  uvVeryHigh: "Mycket hög",
  uvExtreme: "Extrem",

  // ── Hourly forecast ───────────────────────────────────────────────────────
  hourlyTitle: "24-timmars prognos",
  time: "Tid",
  temp: "Temp",
  conditions: "Väder",
  rain: "Regn",

  // ── Daily forecast ────────────────────────────────────────────────────────
  dailyTitle: "10-dagarsprognos",
  barConfidence: "Stapel = prognosförtroende",
  today: "Idag",
  tomorrow: "Imorgon",
  confidenceHigh: "Hög (>75%)",
  confidenceModerate: "Måttlig (50–75%)",
  confidenceLow: "Låg (30–50%)",
  confidenceUncertain: "Osäker (<30%)",
  conf: "konf.",

  // ── Forecast accuracy ─────────────────────────────────────────────────────
  accuracyTitle: "Gårdagens prognosnoggrannhet",
  trackingStartedMsg:
    "Spårning startad — kom tillbaka imorgon för att se hur noggrann dagens prognos var.",
  searchToTrack: "Sök efter en stad för att börja spåra prognosnoggrannhet.",
  high: "Max",
  low: "Min",
  sky: "Himmel",
  rained: "regnade",
  rainLabel: "regn",
  dry: "torrt",
  accuracySpotOn: "Perfekt 🎯",
  accuracyGood: "Ganska noggrann",
  accuracyDecent: "Okej",
  accuracySoso: "Sådär",
  accuracyMissed: "Missade",

  // ── Activity finder ───────────────────────────────────────────────────────
  activityTitle: "Bästa tid för…",
  activitySubtitle: "Välj en aktivitet för att se dina bästa 3-timmarsfönster idag",
  pick: "val",
  conditionsScore: "Förhållningspoäng",
  goldenHourNote:
    "Gyllene timme-fönster är utanför de nästa 24h, men dagens ögonblick är:",
  sunrise: "Soluppgång",
  sunset: "Solnedgång",
  noWindow: "Inget lämpligt tillfälle hittades för",
  noWindowSuffix: "inom de nästa 24h.",
  scoreExcellent: "Utmärkt",
  scoreGood: "Bra",
  scoreFair: "Okej",
  scorePoor: "Dålig",
  scoreAvoid: "Undvik",
  activityRun: "Löpning",
  activityCycle: "Cykling",
  activityGarden: "Trädgård",
  activityBBQ: "Grill",
  activitySunbathe: "Sola",
  activityGolden: "Gyllene h",

  // ── Monthly climate ───────────────────────────────────────────────────────
  climateTitle: "Månadsvis klimatöversikt",
  fiveYearAvg: "5-årsmedelvärde",
  monthCol: "Månad",
  climateHigh: "Max",
  climateLow: "Min",
  climateMean: "Medel",
  tempRange: "Temperaturintervall",
  precipitation: "Nederbörd",
  climateFooter: (start: number, end: number) =>
    `Baserat på dagliga arkivdata ${start}–${end} · Open-Meteo`,
  months: [
    "Jan", "Feb", "Mar", "Apr", "Maj", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
  ] as string[],

  // ── Windy map ─────────────────────────────────────────────────────────────
  liveMap: "Live väderkarta",
  overlayWind: "Vind",
  overlayRain: "Regn",
  overlaySnow: "Snö",
  overlayClouds: "Moln",
  overlayTemp: "Temp",
  overlayStorm: "Storm",

  // ── Webcams ───────────────────────────────────────────────────────────────
  webcamsTitle: "Live webbkameror",
  webcamsNear: "nära",
  noWebcams: "Inga live-webbkameror hittades nära",
};

export const translations = { en, sv };
export type Translations = typeof en;
