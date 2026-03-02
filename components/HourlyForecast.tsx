"use client";

import type { HourlySlot } from "@/lib/types";
import { getWMO } from "@/lib/wmo";
import { formatTime } from "@/lib/utils";

interface Props {
  slots: HourlySlot[];
}

export default function HourlyForecast({ slots }: Props) {
  return (
    <div
      className="card rounded-2xl p-5 md:p-6"
      style={{
        background: "var(--card-bg)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--card-border)",
      }}
    >
      <h2 className="text-slate-300 font-semibold mb-3 text-sm uppercase tracking-wider">
        24-Hour Forecast
      </h2>

      <div className="flex flex-col">
        {/* Column headers */}
        <div className="flex items-center gap-3 pb-2 border-b border-slate-200/10 text-[11px] text-slate-500 font-medium">
          <span className="w-12 flex-shrink-0">Time</span>
          <span className="w-8 flex-shrink-0" />
          <span className="w-12 flex-shrink-0">Temp</span>
          <span className="flex-1 hidden sm:block">Conditions</span>
          <span className="w-14 text-right flex-shrink-0">Rain</span>
          <span className="w-20 text-right flex-shrink-0 hidden sm:block">Wind</span>
        </div>

        {slots.map((slot, i) => {
          const wmo = getWMO(slot.weatherCode);
          return (
            <div
              key={i}
              className="flex items-center gap-3 py-2 border-b border-slate-200/5 last:border-0"
            >
              {/* Time */}
              <span className="text-slate-400 text-xs w-12 flex-shrink-0 font-mono">
                {formatTime(slot.time)}
              </span>

              {/* Emoji */}
              <span className="text-xl w-8 text-center flex-shrink-0 leading-none">
                {wmo.emoji}
              </span>

              {/* Temp */}
              <span
                className="font-semibold text-sm w-12 flex-shrink-0"
                style={{ color: "var(--accent-blue)" }}
              >
                {Math.round(slot.temperature)}°
              </span>

              {/* Conditions */}
              <span className="text-slate-500 text-xs flex-1 hidden sm:block truncate">
                {wmo.description}
              </span>

              {/* Rain */}
              <span className="text-slate-400 text-xs w-14 text-right flex-shrink-0">
                💧 {slot.precipitationProbability}%
              </span>

              {/* Wind */}
              <span className="text-slate-400 text-xs w-20 text-right flex-shrink-0 hidden sm:block">
                💨 {Math.round(slot.windSpeed)} km/h
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
