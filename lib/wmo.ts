interface WMOEntry {
  description: string;
  emoji: string;
}

const wmoMap: Record<number, WMOEntry> = {
  0:  { description: "Clear sky",                emoji: "☀️" },
  1:  { description: "Mainly clear",             emoji: "🌤️" },
  2:  { description: "Partly cloudy",            emoji: "⛅" },
  3:  { description: "Overcast",                 emoji: "☁️" },
  45: { description: "Fog",                      emoji: "🌫️" },
  48: { description: "Icy fog",                  emoji: "🌫️" },
  51: { description: "Light drizzle",            emoji: "🌦️" },
  53: { description: "Moderate drizzle",         emoji: "🌦️" },
  55: { description: "Dense drizzle",            emoji: "🌧️" },
  56: { description: "Light freezing drizzle",   emoji: "🌨️" },
  57: { description: "Heavy freezing drizzle",   emoji: "🌨️" },
  61: { description: "Slight rain",              emoji: "🌧️" },
  63: { description: "Moderate rain",            emoji: "🌧️" },
  65: { description: "Heavy rain",               emoji: "🌧️" },
  66: { description: "Light freezing rain",      emoji: "🌨️" },
  67: { description: "Heavy freezing rain",      emoji: "🌨️" },
  71: { description: "Slight snowfall",          emoji: "🌨️" },
  73: { description: "Moderate snowfall",        emoji: "❄️" },
  75: { description: "Heavy snowfall",           emoji: "❄️" },
  77: { description: "Snow grains",              emoji: "🌨️" },
  80: { description: "Slight rain showers",      emoji: "🌦️" },
  81: { description: "Moderate rain showers",    emoji: "🌧️" },
  82: { description: "Violent rain showers",     emoji: "⛈️" },
  85: { description: "Slight snow showers",      emoji: "🌨️" },
  86: { description: "Heavy snow showers",       emoji: "❄️" },
  95: { description: "Thunderstorm",             emoji: "⛈️" },
  96: { description: "Thunderstorm w/ hail",     emoji: "⛈️" },
  99: { description: "Thunderstorm w/ heavy hail", emoji: "⛈️" },
};

export function getWMO(code: number): WMOEntry {
  return wmoMap[code] ?? { description: "Unknown", emoji: "🌡️" };
}
