import type { City, ForecastData } from "./types";

export async function searchCities(query: string): Promise<City[]> {
  if (!query.trim()) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []) as City[];
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "precipitation_probability",
      "cloud_cover",
      "uv_index",
    ].join(","),
    hourly: "temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,uv_index",
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "sunrise",
      "sunset",
      "uv_index_max",
    ].join(","),
    forecast_days: "10",
    wind_speed_unit: "kmh",
    temperature_unit: "celsius",
    timezone: "auto",
    timeformat: "iso8601",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error("Failed to fetch forecast");
  const data = await res.json();

  return {
    current: data.current,
    hourly: data.hourly,
    daily: data.daily,
    timezone: data.timezone,
  };
}
