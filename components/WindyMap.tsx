"use client";

import { useState } from "react";

interface WindyMapProps {
  lat: number;
  lon: number;
}

const OVERLAYS = [
  { id: "wind",     label: "Wind",   emoji: "🌬️" },
  { id: "rain",     label: "Rain",   emoji: "🌧️" },
  { id: "snowAccu", label: "Snow",   emoji: "❄️" },
  { id: "clouds",   label: "Clouds", emoji: "☁️" },
  { id: "temp",     label: "Temp",   emoji: "🌡️" },
  { id: "cape",     label: "Storm",  emoji: "⛈️" },
] as const;

export default function WindyMap({ lat, lon }: WindyMapProps) {
  const [overlay, setOverlay] = useState<string>("wind");

  const src =
    `https://embed.windy.com/embed2.html` +
    `?lat=${lat}&lon=${lon}` +
    `&detailLat=${lat}&detailLon=${lon}` +
    `&width=650&height=450&zoom=8` +
    `&level=surface&overlay=${overlay}` +
    `&product=ecmwf` +
    `&menu=&message=true&marker=true` +
    `&calendar=now&pressure=&type=map` +
    `&location=coordinates&detail=` +
    `&metricWind=default&metricTemp=default&radarRange=-1`;

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.7)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "1rem",
        overflow: "hidden",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Header + tabs */}
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-3">
        <span className="text-slate-300 text-sm font-semibold mr-1">🗺️ Live Weather Map</span>
        <div className="flex flex-wrap gap-1 ml-auto">
          {OVERLAYS.map((o) => (
            <button
              key={o.id}
              onClick={() => setOverlay(o.id)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={
                overlay === o.id
                  ? {
                      background: "rgba(96,165,250,0.15)",
                      border: "1px solid rgba(96,165,250,0.35)",
                      color: "#93c5fd",
                    }
                  : {
                      background: "transparent",
                      border: "1px solid transparent",
                      color: "#64748b",
                    }
              }
            >
              <span>{o.emoji}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Windy iframe — key forces remount on overlay or location change */}
      <iframe
        key={`${lat.toFixed(3)}-${lon.toFixed(3)}-${overlay}`}
        src={src}
        width="100%"
        style={{ border: "none", display: "block", height: "clamp(280px, 50vw, 420px)" }}
        allow="autoplay"
        title={`Windy ${overlay} map`}
      />
    </div>
  );
}
