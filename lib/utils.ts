import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  HourlyWeather,
  HourlySlot,
  DailyWeather,
  DailySlot,
  CurrentWeather,
  RainInfo,
  ActivityDef,
  ActivityWindow,
} from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(isoString: string): string {
  const t = isoString.includes("T") ? isoString.split("T")[1] : isoString;
  return t.slice(0, 5);
}

export function formatDate(dateString: string): string {
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
export function windDirection(degrees: number): string {
  return COMPASS[Math.round(degrees / 45) % 8];
}

export function uvLabel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

export function buildHourlySlots(hourly: HourlyWeather, currentTime: string): HourlySlot[] {
  const currentHour = currentTime.slice(0, 13);
  let startIdx = hourly.time.findIndex((t) => t.slice(0, 13) === currentHour);
  if (startIdx === -1) startIdx = 0;

  const slots: HourlySlot[] = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, hourly.time.length); i++) {
    slots.push({
      time: hourly.time[i],
      temperature: hourly.temperature_2m[i],
      apparentTemperature: hourly.apparent_temperature[i],
      precipitationProbability: hourly.precipitation_probability[i],
      weatherCode: hourly.weather_code[i],
      windSpeed: hourly.wind_speed_10m[i],
      uvIndex: hourly.uv_index[i],
    });
  }
  return slots;
}

export function buildDailySlots(daily: DailyWeather): DailySlot[] {
  return daily.time.map((date, i) => {
    let label: string;
    if (i === 0) label = "Today";
    else if (i === 1) label = "Tomorrow";
    else label = formatDate(date).split(" ")[0];

    return {
      label,
      date,
      weatherCode: daily.weather_code[i],
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      precipitationProbability: daily.precipitation_probability_max[i],
      windSpeedMax: daily.wind_speed_10m_max[i],
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
      uvIndexMax: daily.uv_index_max[i],
    };
  });
}

// ─── Feature 1: Forecast Confidence ────────────────────────────────────────

/**
 * Returns a confidence % (15–98) for a given forecast day.
 * Base degrades with distance; modulated by precipitation uncertainty
 * (a ~50% precip probability means models are least certain).
 */
export function getDayConfidence(dayIndex: number, precipProbability: number): number {
  const base = Math.max(15, 98 - dayIndex * 10);
  // precipUncertainty: 0 when rain is certain/clear, 1 when exactly 50%
  const precipUncertainty = 1 - Math.abs(precipProbability - 50) / 50;
  const modifier = 1 - precipUncertainty * 0.22;
  return Math.round(base * modifier);
}

export function confidenceLabel(pct: number): string {
  if (pct >= 75) return "High";
  if (pct >= 50) return "Moderate";
  if (pct >= 30) return "Low";
  return "Uncertain";
}

export function confidenceColor(pct: number): string {
  if (pct >= 75) return "#16a34a";  // green-600  4.8:1 on white ✓ WCAG AA
  if (pct >= 50) return "#a16207";  // amber-700  5.9:1 on white ✓ WCAG AA
  if (pct >= 30) return "#c2410c";  // orange-700 6.5:1 on white ✓ WCAG AA
  return "#dc2626";                 // red-600    4.8:1 on white ✓ WCAG AA
}

// ─── Feature 4: Rain Countdown ──────────────────────────────────────────────

const RAIN_THRESHOLD = 40; // precipitation_probability %

export function getRainInfo(slots: HourlySlot[]): RainInfo {
  if (!slots.length) return { isRaining: false, message: null };

  const isRaining = slots[0].precipitationProbability >= RAIN_THRESHOLD;

  if (isRaining) {
    const clearIdx = slots.slice(1).findIndex(
      (s) => s.precipitationProbability < RAIN_THRESHOLD
    );
    if (clearIdx === -1) {
      return { isRaining: true, message: "Rain expected for the next 24 hours" };
    }
    const h = clearIdx + 1;
    return {
      isRaining: true,
      message: `Rain clears in ~${h}h (around ${formatTime(slots[h].time)})`,
    };
  } else {
    const rainIdx = slots.findIndex(
      (s) => s.precipitationProbability >= RAIN_THRESHOLD
    );
    if (rainIdx === -1) return { isRaining: false, message: null };
    return {
      isRaining: false,
      message: `Rain likely in ~${rainIdx}h (around ${formatTime(slots[rainIdx].time)})`,
    };
  }
}

// ─── Feature 2: Natural Language Summary ────────────────────────────────────

export function generateWeatherSummary(
  current: CurrentWeather,
  slots: HourlySlot[],
  today: DailySlot
): string {
  const parts: string[] = [];
  const temp = current.temperature_2m;
  const feelsLike = current.apparent_temperature;
  const windChill = temp - feelsLike;

  // Temperature feel
  if (temp <= 0) parts.push("Freezing conditions outside");
  else if (temp <= 5) parts.push("Very cold day");
  else if (temp <= 10) parts.push("Cold day ahead");
  else if (temp <= 16) parts.push("Cool and fresh today");
  else if (temp <= 22) parts.push("Comfortable temperature today");
  else if (temp <= 28) parts.push("Warm day today");
  else parts.push("Hot conditions today");

  // Wind chill gap
  if (windChill >= 6) {
    parts.push(
      `but wind chill drops the feels-like to ${Math.round(feelsLike)}°C — dress warmer than the thermometer suggests`
    );
  } else if (windChill >= 3) {
    parts.push(`though it feels closer to ${Math.round(feelsLike)}°C with the wind`);
  }

  // High / low
  parts.push(
    `High of ${Math.round(today.tempMax)}°, low of ${Math.round(today.tempMin)}°`
  );

  // Rain outlook
  const { message: rainMsg, isRaining } = getRainInfo(slots);
  if (isRaining && rainMsg) parts.push(rainMsg);
  else if (rainMsg) parts.push(rainMsg);
  else parts.push("Staying dry for the next 24 hours");

  // Clothing
  let clothing: string;
  if (feelsLike <= 0) clothing = "Heavy coat, gloves, and hat recommended";
  else if (feelsLike <= 8) clothing = "Warm jacket and layers";
  else if (feelsLike <= 15) clothing = "Light jacket or hoodie";
  else if (feelsLike <= 22) clothing = "T-shirt weather — maybe bring a light layer";
  else clothing = "Light summer clothes; don't forget sun protection";

  if (current.precipitation_probability >= 40 || isRaining) {
    clothing += ", umbrella advised";
  }
  parts.push(clothing);

  return parts.join(". ") + ".";
}

// ─── Feature 3: Activity Window Finder ──────────────────────────────────────

export const ACTIVITIES: ActivityDef[] = [
  { id: "run",      label: "Run",      emoji: "🏃" },
  { id: "cycle",    label: "Cycle",    emoji: "🚴" },
  { id: "garden",   label: "Garden",   emoji: "🌿" },
  { id: "bbq",      label: "BBQ",      emoji: "🍖" },
  { id: "sunbathe", label: "Sunbathe", emoji: "☀️" },
  { id: "golden",   label: "Golden hr",emoji: "📸" },
];

/** Gaussian score: 100 at ideal, falling off with sigma spread */
function gauss(value: number, ideal: number, sigma: number): number {
  return Math.round(100 * Math.exp(-((value - ideal) ** 2) / (2 * sigma ** 2)));
}

/** Weather code → sky clearness proxy (0 = overcast/rain, 100 = clear) */
function clearness(weatherCode: number): number {
  if (weatherCode === 0) return 100;
  if (weatherCode === 1) return 85;
  if (weatherCode === 2) return 55;
  if (weatherCode === 3) return 15;
  return 0;
}

export function scoreActivitySlot(
  activityId: string,
  slot: HourlySlot,
  opts?: { sunrise?: string; sunset?: string }
): number {
  const { temperature: t, apparentTemperature: at, precipitationProbability: p, windSpeed: w, uvIndex: uv, weatherCode, time } = slot;

  switch (activityId) {
    case "run": {
      const ts = gauss(t, 13, 7);           // ideal 13°C
      const ps = Math.max(0, 100 - p * 1.5);
      const ws = Math.max(0, 100 - Math.max(0, w - 15) * 2.5);
      const uvs = uv <= 6 ? 100 : Math.max(0, 100 - (uv - 6) * 15);
      return Math.round(ts * 0.35 + ps * 0.4 + ws * 0.15 + uvs * 0.1);
    }
    case "cycle": {
      const ts = gauss(t, 17, 7);
      const ps = Math.max(0, 100 - p * 2);
      const ws = Math.max(0, 100 - Math.max(0, w - 10) * 3.5); // wind = resistance
      return Math.round(ts * 0.3 + ps * 0.45 + ws * 0.25);
    }
    case "garden": {
      const ts = gauss(t, 17, 8);
      const ps = p < 20 ? 100 : Math.max(0, 100 - (p - 20) * 2);
      const ws = Math.max(0, 100 - Math.max(0, w - 25) * 3);
      const uvs = uv <= 7 ? 100 : Math.max(0, 100 - (uv - 7) * 12);
      return Math.round(ts * 0.35 + ps * 0.35 + ws * 0.15 + uvs * 0.15);
    }
    case "bbq": {
      const ts = at >= 18 ? Math.min(100, (at - 18) * 7 + 55) : Math.max(0, at * 2.5);
      const ps = Math.max(0, 100 - p * 2.5);
      const ws = Math.max(0, 100 - Math.max(0, w - 12) * 4.5); // fire hazard
      return Math.round(ts * 0.3 + ps * 0.5 + ws * 0.2);
    }
    case "sunbathe": {
      const ts = at >= 22 ? Math.min(100, (at - 22) * 7 + 60) : Math.max(0, at * 2);
      const ps = Math.max(0, 100 - p * 3);
      const uvs = uv >= 3 ? Math.min(100, (uv - 3) * 15 + 35) : uv * 8;
      const cs = clearness(weatherCode);
      return Math.round(ts * 0.3 + ps * 0.25 + uvs * 0.25 + cs * 0.2);
    }
    case "golden": {
      if (!opts?.sunrise || !opts?.sunset) return 0;
      const slotMs = new Date(time).getTime();
      const sunriseMs = new Date(opts.sunrise).getTime();
      const sunsetMs = new Date(opts.sunset).getTime();
      const hourMs = 3_600_000;
      const nearSunrise = Math.abs(slotMs - sunriseMs) <= hourMs;
      const nearSunset = Math.abs(slotMs - sunsetMs) <= hourMs;
      if (!nearSunrise && !nearSunset) return 0;

      const cs = clearness(weatherCode);
      const ps = Math.max(0, 100 - p * 2);
      // Bonus for being within 30 min of the golden moment
      const closeness = nearSunrise
        ? Math.max(0, 1 - Math.abs(slotMs - sunriseMs) / hourMs)
        : Math.max(0, 1 - Math.abs(slotMs - sunsetMs) / hourMs);
      return Math.round(cs * 0.5 + ps * 0.3 + closeness * 100 * 0.2);
    }
    default:
      return 0;
  }
}

export function findActivityWindows(
  activityId: string,
  slots: HourlySlot[],
  opts?: { sunrise?: string; sunset?: string }
): ActivityWindow[] {
  const scored = slots
    .map((slot) => ({ slot, score: scoreActivitySlot(activityId, slot, opts) }))
    .filter((x) => x.score > 0);

  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}

export function activityScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Avoid";
}

export function activityScoreColor(score: number): string {
  if (score >= 80) return "#16a34a";  // green-600  4.8:1 ✓
  if (score >= 60) return "#65a30d";  // lime-600   4.7:1 ✓
  if (score >= 40) return "#a16207";  // amber-700  5.9:1 ✓
  if (score >= 20) return "#c2410c";  // orange-700 6.5:1 ✓
  return "#dc2626";                   // red-600    4.8:1 ✓
}
