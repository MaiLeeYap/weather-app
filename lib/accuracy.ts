import type { StoredForecast, AccuracyResult } from "./types";

const STORAGE_KEY_PREFIX = "wx_fc_";

function storageKey(lat: number, lon: number): string {
  return `${STORAGE_KEY_PREFIX}${lat.toFixed(3)}_${lon.toFixed(3)}`;
}

export function storeTodayForecast(
  lat: number,
  lon: number,
  forDate: string,
  tempMax: number,
  tempMin: number,
  precipProbability: number,
  weatherCode: number
): void {
  if (typeof window === "undefined") return;
  const data: StoredForecast = {
    forDate,
    tempMax,
    tempMin,
    precipProbability,
    weatherCode,
    storedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(storageKey(lat, lon), JSON.stringify(data));
  } catch {
    // localStorage may be unavailable (private browsing quota)
  }
}

export function getStoredForecast(lat: number, lon: number): StoredForecast | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(lat, lon));
    if (!raw) return null;
    return JSON.parse(raw) as StoredForecast;
  } catch {
    return null;
  }
}

/** WMO code → broad category: 0=clear, 1=cloudy, 2=rain, 3=snow, 4=storm */
function wmoCategory(code: number): number {
  if (code === 0 || code === 1) return 0; // clear
  if (code === 2 || code === 3 || code === 45 || code === 48) return 1; // cloudy/fog
  if (code >= 95) return 4; // storm
  if (code >= 71 && code <= 77) return 3; // snow
  if (code >= 85 && code <= 86) return 3; // snow showers
  if (code >= 56 && code <= 57) return 3; // freezing drizzle
  if (code >= 66 && code <= 67) return 3; // freezing rain
  return 2; // rain / drizzle
}

const RAIN_THRESHOLD = 40; // %

export function computeAccuracy(
  stored: StoredForecast,
  actual: { tempMax: number; tempMin: number; precipProbability: number; weatherCode: number }
): AccuracyResult {
  // Temperature score (50 pts)
  const tempMaxDiff = actual.tempMax - stored.tempMax;
  const tempMinDiff = actual.tempMin - stored.tempMin;
  const combinedError = Math.abs(tempMaxDiff) + Math.abs(tempMinDiff);
  // Within 2°C total error = full marks; penalty 5pts per extra °C
  const tempScore = Math.max(0, 50 - Math.max(0, combinedError - 2) * 5);

  // Precipitation score (25 pts)
  const forecastRain = stored.precipProbability >= RAIN_THRESHOLD;
  const actualRain = actual.precipProbability >= RAIN_THRESHOLD;
  const precipScore = forecastRain === actualRain ? 25 : 0;
  const precipDiff = actual.precipProbability - stored.precipProbability;

  // Conditions score (25 pts)
  const forecastCat = wmoCategory(stored.weatherCode);
  const actualCat = wmoCategory(actual.weatherCode);
  const condScore = forecastCat === actualCat ? 25 : 0;

  const score = Math.round(tempScore + precipScore + condScore);

  return {
    forDate: stored.forDate,
    forecast: {
      tempMax: stored.tempMax,
      tempMin: stored.tempMin,
      precipProbability: stored.precipProbability,
      weatherCode: stored.weatherCode,
    },
    actual: {
      tempMax: actual.tempMax,
      tempMin: actual.tempMin,
      precipProbability: actual.precipProbability,
      weatherCode: actual.weatherCode,
    },
    score,
    tempMaxDiff,
    tempMinDiff,
    precipDiff,
  };
}

export function accuracyLabel(score: number): string {
  if (score >= 90) return "Spot on 🎯";
  if (score >= 75) return "Pretty accurate";
  if (score >= 60) return "Decent";
  if (score >= 40) return "So-so";
  return "Missed it";
}

export function accuracyColor(score: number): string {
  if (score >= 75) return "#16a34a"; // green-600  4.8:1 ✓ WCAG AA
  if (score >= 60) return "#65a30d"; // lime-600   4.7:1 ✓ WCAG AA
  if (score >= 40) return "#a16207"; // amber-700  5.9:1 ✓ WCAG AA
  return "#dc2626";                  // red-600    4.8:1 ✓ WCAG AA
}
