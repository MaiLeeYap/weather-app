import type { Language } from "./i18n";

interface WMOEntry {
  description: string;
  emoji: string;
}

const wmoData: Record<number, { en: string; sv: string; emoji: string; nightEmoji?: string }> = {
  0:  { en: "Clear sky",                      sv: "Klar himmel",                       emoji: "☀️",  nightEmoji: "🌙"  },
  1:  { en: "Mainly clear",                   sv: "Mestadels klart",                   emoji: "🌤️", nightEmoji: "🌙"  },
  2:  { en: "Partly cloudy",                  sv: "Delvis molnigt",                    emoji: "⛅",  nightEmoji: "🌙"  },
  3:  { en: "Overcast",                       sv: "Mulet",                             emoji: "☁️"  },
  45: { en: "Fog",                            sv: "Dimma",                             emoji: "🌫️" },
  48: { en: "Icy fog",                        sv: "Isig dimma",                        emoji: "🌫️" },
  51: { en: "Light drizzle",                  sv: "Lätt duggregn",                     emoji: "🌦️", nightEmoji: "🌧️" },
  53: { en: "Moderate drizzle",               sv: "Måttligt duggregn",                 emoji: "🌦️", nightEmoji: "🌧️" },
  55: { en: "Dense drizzle",                  sv: "Tätt duggregn",                     emoji: "🌧️" },
  56: { en: "Light freezing drizzle",         sv: "Lätt underkylt duggregn",           emoji: "🌨️" },
  57: { en: "Heavy freezing drizzle",         sv: "Kraftigt underkylt duggregn",       emoji: "🌨️" },
  61: { en: "Slight rain",                    sv: "Lätt regn",                         emoji: "🌧️" },
  63: { en: "Moderate rain",                  sv: "Måttligt regn",                     emoji: "🌧️" },
  65: { en: "Heavy rain",                     sv: "Kraftigt regn",                     emoji: "🌧️" },
  66: { en: "Light freezing rain",            sv: "Lätt isregn",                       emoji: "🌨️" },
  67: { en: "Heavy freezing rain",            sv: "Kraftigt isregn",                   emoji: "🌨️" },
  71: { en: "Slight snowfall",               sv: "Lätt snöfall",                      emoji: "🌨️" },
  73: { en: "Moderate snowfall",             sv: "Måttligt snöfall",                  emoji: "❄️"  },
  75: { en: "Heavy snowfall",                sv: "Kraftigt snöfall",                  emoji: "❄️"  },
  77: { en: "Snow grains",                   sv: "Snökorn",                           emoji: "🌨️" },
  80: { en: "Slight rain showers",           sv: "Lätta regnskurar",                  emoji: "🌦️", nightEmoji: "🌧️" },
  81: { en: "Moderate rain showers",         sv: "Måttliga regnskurar",               emoji: "🌧️" },
  82: { en: "Violent rain showers",          sv: "Kraftiga regnskurar",               emoji: "⛈️"  },
  85: { en: "Slight snow showers",           sv: "Lätta snöbyar",                     emoji: "🌨️" },
  86: { en: "Heavy snow showers",            sv: "Kraftiga snöbyar",                  emoji: "❄️"  },
  95: { en: "Thunderstorm",                  sv: "Åskväder",                          emoji: "⛈️"  },
  96: { en: "Thunderstorm w/ hail",          sv: "Åskväder med hagel",                emoji: "⛈️"  },
  99: { en: "Thunderstorm w/ heavy hail",    sv: "Åskväder med kraftigt hagel",       emoji: "⛈️"  },
};

export function getWMO(code: number, lang: Language = "en", isNight = false): WMOEntry {
  const entry = wmoData[code] ?? { en: "Unknown", sv: "Okänd", emoji: "🌡️" };
  const emoji = isNight && entry.nightEmoji ? entry.nightEmoji : entry.emoji;
  return { description: entry[lang], emoji };
}
