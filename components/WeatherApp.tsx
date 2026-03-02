"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { City, ForecastData, AccuracyResult } from "@/lib/types";
import { buildHourlySlots, buildDailySlots } from "@/lib/utils";
import { storeTodayForecast, getStoredForecast, computeAccuracy } from "@/lib/accuracy";
import { LanguageProvider, useLanguage } from "@/lib/LanguageContext";
import CitySearch from "./CitySearch";
import CurrentConditions from "./CurrentConditions";
import ForecastAccuracy from "./ForecastAccuracy";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";
import ActivityFinder from "./ActivityFinder";
import CityWebcam from "./CityWebcam";
import CityPhoto from "./CityPhoto";
import WindyMap from "./WindyMap";
import MonthlyClimate from "./MonthlyClimate";

const GlobeView = dynamic(() => import("./GlobeView"), { ssr: false });

function formatToday(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function WeatherApp() {
  return (
    <LanguageProvider>
      <WeatherAppInner />
    </LanguageProvider>
  );
}

function WeatherAppInner() {
  const { lang, setLang, t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accuracyResult, setAccuracyResult] = useState<AccuracyResult | null>(null);
  const [trackingStarted, setTrackingStarted] = useState(false);

  async function handleCitySelect(city: City) {
    setSelectedCity(city);
    setForecast(null);
    setError(null);
    setLoading(true);
    setAccuracyResult(null);
    setTrackingStarted(false);

    try {
      const [res, accuracyRes] = await Promise.all([
        fetch(`/api/weather?lat=${city.latitude}&lon=${city.longitude}`),
        fetch(`/api/accuracy?lat=${city.latitude}&lon=${city.longitude}`),
      ]);

      if (!res.ok) throw new Error("Failed to load weather data");
      const data: ForecastData = await res.json();
      setForecast(data);

      const daily = data.daily;
      if (daily.time.length > 0) {
        storeTodayForecast(
          city.latitude,
          city.longitude,
          daily.time[0],
          daily.temperature_2m_max[0],
          daily.temperature_2m_min[0],
          daily.precipitation_probability_max[0],
          daily.weather_code[0]
        );
      }

      if (accuracyRes.ok) {
        const actualData = await accuracyRes.json();
        const stored = getStoredForecast(city.latitude, city.longitude);
        // actualData.date is yesterday in the city's local timezone (from Open-Meteo)
        // stored.forDate is the date we stored the forecast for (also from Open-Meteo)
        // Comparing these avoids UTC vs local timezone mismatches
        if (stored && stored.forDate === actualData.date) {
          setAccuracyResult(
            computeAccuracy(stored, {
              tempMax: actualData.tempMax,
              tempMin: actualData.tempMin,
              precipProbability: actualData.precipProbability,
              weatherCode: actualData.weatherCode,
            })
          );
        } else if (stored) {
          setTrackingStarted(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const hourlySlots = forecast ? buildHourlySlots(forecast.hourly, forecast.current.time) : [];
  const dailySlots = forecast ? buildDailySlots(forecast.daily) : [];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-4 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">

          {/* Header */}
          <div className="text-center relative">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1">
              {t.appTitle}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">{formatToday()}</p>
            {/* Language toggle */}
            <div className="absolute right-0 top-0 flex items-center gap-1 rounded-xl overflow-hidden border border-slate-200"
              style={{ borderColor: "var(--card-border)" }}
            >
              {(["en", "sv"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    background: lang === l ? "var(--accent-blue)" : "transparent",
                    color: lang === l ? "#ffffff" : "#64748b",
                  }}
                >
                  {l === "en" ? "🇬🇧 EN" : "🇸🇪 SV"}
                </button>
              ))}
            </div>
          </div>

          {/* Search — full width */}
          <CitySearch onSelect={handleCitySelect} />

          {/* Two-column layout.
              On mobile: right column (visuals) comes first via order classes
              so the globe is visible before the data. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

            {/* ── RIGHT: visuals — rendered first in DOM → top on mobile ── */}
            <div className="flex flex-col gap-5 order-1 lg:order-2">
              <GlobeView city={selectedCity} />

              {forecast && selectedCity && (
                <>
                  <WindyMap lat={selectedCity.latitude} lon={selectedCity.longitude} />
                  {selectedCity && (
                    <CityPhoto cityName={selectedCity.name} country={selectedCity.country} />
                  )}
                  <CityWebcam
                    lat={selectedCity.latitude}
                    lon={selectedCity.longitude}
                    cityName={selectedCity.name}
                  />
                </>
              )}
            </div>

            {/* ── LEFT: weather data ── */}
            <div className="flex flex-col gap-5 order-2 lg:order-1">
              {loading && (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">{t.loadingForecast}</p>
                </div>
              )}

              {error && (
                <div
                  className="rounded-2xl p-5 text-center"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <p className="text-red-400">⚠️ {error}</p>
                </div>
              )}

              {!loading && !error && !forecast && (
                <div className="text-center py-12 text-slate-600">
                  <p className="text-base sm:text-lg">{t.searchPrompt}</p>
                </div>
              )}

              {forecast && selectedCity && (
                <>
                  <CurrentConditions
                    current={forecast.current}
                    cityName={`${selectedCity.name}${selectedCity.admin1 ? `, ${selectedCity.admin1}` : ""}, ${selectedCity.country}`}
                    today={dailySlots[0]}
                  />
                  <HourlyForecast slots={hourlySlots} />
                  <ForecastAccuracy
                    result={accuracyResult}
                    trackingStarted={trackingStarted}
                  />
                  <DailyForecast slots={dailySlots} />
                  <ActivityFinder slots={hourlySlots} today={dailySlots[0]} />
                  <MonthlyClimate
                    lat={selectedCity.latitude}
                    lon={selectedCity.longitude}
                    cityName={selectedCity.name}
                  />
                </>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 px-4 text-slate-600 text-xs border-t border-black/8">
        {t.poweredBy}
      </footer>
    </div>
  );
}
