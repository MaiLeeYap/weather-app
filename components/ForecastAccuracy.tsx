"use client";

import type { AccuracyResult } from "@/lib/types";
import { accuracyLabel, accuracyColor } from "@/lib/accuracy";
import { getWMO } from "@/lib/wmo";
import { formatDate } from "@/lib/utils";

interface Props {
  result: AccuracyResult | null;
  /** True when we have a stored forecast but it's for today (not yesterday) */
  trackingStarted: boolean;
}

const RAIN_THRESHOLD = 40;

function DiffBadge({ diff }: { diff: number }) {
  const sign = diff > 0 ? "+" : "";
  const color =
    Math.abs(diff) <= 1
      ? "#22c55e"
      : Math.abs(diff) <= 3
      ? "#eab308"
      : "#ef4444";
  return (
    <span
      className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
      style={{ background: `${color}22`, color }}
    >
      {sign}{diff > 0 ? Math.ceil(diff) : Math.floor(diff)}°C
    </span>
  );
}

export default function ForecastAccuracy({ result, trackingStarted }: Props) {
  // ── Teaser state ──────────────────────────────────────────────────────────
  if (!result) {
    return (
      <div
        className="card rounded-2xl p-5"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🕐</span>
          <div>
            <p className="text-slate-300 font-semibold text-sm">
              Yesterday&apos;s Forecast Accuracy
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {trackingStarted
                ? "Tracking started — check back tomorrow to see how accurate today's forecast was."
                : "Search a city to start tracking forecast accuracy."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Comparison card ───────────────────────────────────────────────────────
  const { score, forecast, actual, tempMaxDiff, tempMinDiff, forDate } = result;
  const label = accuracyLabel(score);
  const color = accuracyColor(score);

  const forecastRain = forecast.precipProbability >= RAIN_THRESHOLD;
  const actualRain = actual.precipProbability >= RAIN_THRESHOLD;
  const rainMatch = forecastRain === actualRain;

  const forecastWMO = getWMO(forecast.weatherCode);
  const actualWMO = getWMO(actual.weatherCode);

  return (
    <div
      className="card rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300 font-semibold text-sm">
            Yesterday&apos;s Forecast Accuracy
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            {formatDate(forDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color }}>
            {score}
          </p>
          <p className="text-xs font-semibold" style={{ color }}>
            {label}
          </p>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-700">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>

      {/* Comparison rows */}
      <div className="flex flex-col gap-3">
        {[
          {
            icon: "🌡",
            label: "High",
            value: `${Math.round(forecast.tempMax)}° → ${Math.round(actual.tempMax)}°`,
            badge: <DiffBadge diff={tempMaxDiff} />,
          },
          {
            icon: "🌡",
            label: "Low",
            value: `${Math.round(forecast.tempMin)}° → ${Math.round(actual.tempMin)}°`,
            badge: <DiffBadge diff={tempMinDiff} />,
          },
        ].map(({ icon, label, value, badge }) => (
          <div key={label} className="flex items-center justify-between gap-2 text-sm flex-wrap">
            <span className="text-slate-400 text-xs w-16 flex-shrink-0">{icon} {label}</span>
            <span className="text-slate-300 flex-1 min-w-0 text-right sm:text-left">{value}</span>
            <span className="flex-shrink-0">{badge}</span>
          </div>
        ))}

        {/* Rain */}
        <div className="flex items-start justify-between gap-2 text-sm flex-wrap">
          <span className="text-slate-400 text-xs w-16 flex-shrink-0">🌧 Rain</span>
          <span className="text-slate-300 flex-1 min-w-0 text-right sm:text-left text-xs sm:text-sm">
            {forecast.precipProbability}% ({forecastRain ? "rain" : "dry"}) → {actualRain ? "🌧 rained" : "✓ dry"}
          </span>
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={{
              background: rainMatch ? "#22c55e22" : "#ef444422",
              color: rainMatch ? "#22c55e" : "#ef4444",
            }}
          >
            {rainMatch ? "✓" : "✗"}
          </span>
        </div>

        {/* Conditions */}
        <div className="flex items-start justify-between gap-2 text-sm flex-wrap">
          <span className="text-slate-400 text-xs w-16 flex-shrink-0">☁️ Sky</span>
          <span className="text-slate-300 flex-1 min-w-0 text-right sm:text-left text-xs sm:text-sm">
            {forecastWMO.emoji} {forecastWMO.description} → {actualWMO.emoji} {actualWMO.description}
          </span>
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={
              forecastWMO.description === actualWMO.description
                ? { background: "#22c55e22", color: "#22c55e" }
                : { background: "rgba(148,163,184,0.1)", color: "#94a3b8" }
            }
          >
            {forecastWMO.description === actualWMO.description ? "✓" : "~"}
          </span>
        </div>
      </div>
    </div>
  );
}
