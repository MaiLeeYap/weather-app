"use client";

import dynamic from "next/dynamic";
import type { HourlySlot } from "@/lib/types";
import { getWMO } from "@/lib/wmo";
import { formatTime } from "@/lib/utils";

const HourlyChart = dynamic(() => import("./HourlyChart"), { ssr: false });

interface Props {
  slots: HourlySlot[];
}

export default function HourlyForecast({ slots }: Props) {
  return (
    <div
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: "var(--card-bg)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--card-border)",
      }}
    >
      <h2 className="text-slate-300 font-semibold mb-4 text-sm uppercase tracking-wider">
        24-Hour Forecast
      </h2>

      <HourlyChart slots={slots} />

      {/* Scrollable mini-cards */}
      <div className="flex gap-3 overflow-x-auto pt-4 pb-1 scrollbar-thin">
        {slots.map((slot, i) => {
          const wmo = getWMO(slot.weatherCode);
          return (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col items-center gap-1 rounded-xl px-3 py-2 min-w-[60px]"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <span className="text-slate-400 text-xs">{formatTime(slot.time)}</span>
              <span className="text-xl">{wmo.emoji}</span>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--accent-blue)" }}
              >
                {Math.round(slot.temperature)}°
              </span>
              <span className="text-slate-500 text-xs">
                💧{slot.precipitationProbability}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
