"use client";

import { useEffect, useState } from "react";
import type { MonthSummary } from "@/app/api/climate/route";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  lat: number;
  lon: number;
  cityName: string;
}

function tempColor(t: number): string {
  if (t <= -15) return "#93c5fd"; // icy blue
  if (t <= 0)   return "#60a5fa"; // blue
  if (t <= 8)   return "#34d399"; // teal-green
  if (t <= 15)  return "#86efac"; // light green
  if (t <= 20)  return "#fde68a"; // yellow
  if (t <= 26)  return "#fb923c"; // orange
  return "#f87171";               // red
}

function PrecipBar({ mm, max }: { mm: number; max: number }) {
  const pct = max > 0 ? (mm / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 rounded-full flex-shrink-0"
        style={{
          width: 72,
          background: "rgba(255,255,255,0.07)",
          position: "relative",
        }}
      >
        <div
          className="h-2 rounded-full absolute left-0 top-0"
          style={{
            width: `${pct}%`,
            background: "rgba(96,165,250,0.55)",
          }}
        />
      </div>
      <span className="text-slate-400 font-mono text-xs">{mm} mm</span>
    </div>
  );
}

export default function MonthlyClimate({ lat, lon, cityName }: Props) {
  const [data, setData] = useState<MonthSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setData(null);
    fetch(`/api/climate?lat=${lat}&lon=${lon}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lat, lon]);

  const cardStyle: React.CSSProperties = {
    background: "rgba(15, 23, 42, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "1rem",
    padding: "1.25rem",
    backdropFilter: "blur(12px)",
  };

  if (loading) {
    return (
      <div style={cardStyle}>
        <div
          className="h-3 w-56 rounded-full animate-pulse mb-5"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-6 rounded-lg animate-pulse mb-1.5"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />
        ))}
      </div>
    );
  }

  if (error || !data) return null;

  const globalMin = Math.min(...data.map((d) => d.avgLow));
  const globalMax = Math.max(...data.map((d) => d.avgHigh));
  const range = globalMax - globalMin || 1;
  const maxPrecip = Math.max(...data.map((d) => d.avgPrecip));

  return (
    <div style={cardStyle}>
      <h2 className="text-slate-300 text-sm font-semibold mb-4">
        🌡️ Monthly Climate Overview
        <span className="text-slate-500 font-normal ml-2">
          {cityName} · 5-year average
        </span>
      </h2>

      <div className="overflow-x-auto">
        <table
          className="w-full text-xs"
          style={{ borderCollapse: "separate", borderSpacing: "0 3px" }}
        >
          <thead>
            <tr className="text-slate-500 text-left">
              <th className="pb-3 pr-3 font-medium w-10">Month</th>
              <th className="pb-3 pr-3 font-medium text-right">High</th>
              <th className="pb-3 pr-3 font-medium text-right">Low</th>
              <th className="pb-3 pr-4 font-medium text-right hidden sm:table-cell">Mean</th>
              <th className="pb-3 pr-4 font-medium">Temp range</th>
              <th className="pb-3 font-medium">Precipitation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => {
              const lowPct = ((m.avgLow - globalMin) / range) * 100;
              const highPct = ((m.avgHigh - globalMin) / range) * 100;
              const barW = Math.max(highPct - lowPct, 2);

              return (
                <tr
                  key={m.month}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "0.5rem",
                  }}
                >
                  {/* Month */}
                  <td
                    className="py-2 pr-3 font-semibold text-slate-400 rounded-l-lg"
                    style={{ paddingLeft: 8 }}
                  >
                    {MONTHS[m.month]}
                  </td>

                  {/* High */}
                  <td
                    className="py-2 pr-3 text-right font-mono font-bold"
                    style={{ color: tempColor(m.avgHigh) }}
                  >
                    {m.avgHigh > 0 ? "+" : ""}{m.avgHigh}°
                  </td>

                  {/* Low */}
                  <td
                    className="py-2 pr-3 text-right font-mono"
                    style={{ color: tempColor(m.avgLow) }}
                  >
                    {m.avgLow > 0 ? "+" : ""}{m.avgLow}°
                  </td>

                  {/* Mean — hidden on small screens */}
                  <td
                    className="py-2 pr-4 text-right font-mono text-slate-400 hidden sm:table-cell"
                  >
                    {m.avgMean > 0 ? "+" : ""}{m.avgMean}°
                  </td>

                  {/* Range bar */}
                  <td className="py-2 pr-4" style={{ minWidth: 120 }}>
                    <div
                      className="relative h-4 rounded"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <div
                        className="absolute top-0 h-4 rounded"
                        style={{
                          left: `${lowPct}%`,
                          width: `${barW}%`,
                          background: `linear-gradient(to right, ${tempColor(m.avgLow)}, ${tempColor(m.avgHigh)})`,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </td>

                  {/* Precipitation */}
                  <td className="py-2 rounded-r-lg">
                    <PrecipBar mm={m.avgPrecip} max={maxPrecip} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-slate-600 text-xs mt-4">
        Based on daily archive data {new Date().getFullYear() - 5}–{new Date().getFullYear() - 1} · Open-Meteo
      </p>
    </div>
  );
}
