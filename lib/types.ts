export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  timezone: string;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  precipitation_probability: number;
  cloud_cover: number;
  uv_index: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  uv_index: number[];
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
}

export interface ForecastData {
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
  timezone: string;
}

export interface HourlySlot {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
}

export interface DailySlot {
  label: string;
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
}

export interface RainInfo {
  isRaining: boolean;
  message: string | null;
}

export interface ActivityDef {
  id: string;
  label: string;
  emoji: string;
}

export interface ActivityWindow {
  slot: HourlySlot;
  score: number;
}

export interface StoredForecast {
  forDate: string;          // "YYYY-MM-DD"
  tempMax: number;
  tempMin: number;
  precipProbability: number;
  weatherCode: number;
  storedAt: string;         // ISO timestamp
}

export interface AccuracyResult {
  forDate: string;
  forecast: { tempMax: number; tempMin: number; precipProbability: number; weatherCode: number };
  actual:   { tempMax: number; tempMin: number; precipProbability: number; weatherCode: number };
  score: number;
  tempMaxDiff: number;
  tempMinDiff: number;
  precipDiff: number;
}
