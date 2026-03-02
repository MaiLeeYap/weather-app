"use client";

import { useState } from "react";
import type { HourlySlot, DailySlot } from "@/lib/types";
import {
  ACTIVITIES,
  findActivityWindows,
  formatTime,
  activityScoreLabel,
  activityScoreColor,
} from "@/lib/utils";
import { getWMO } from "@/lib/wmo";

interface Props {
  slots: HourlySlot[];
  today: DailySlot;
}

export default function ActivityFinder({ slots, today }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const opts = { sunrise: today.sunrise, sunset: today.sunset };
  const windows = selected ? findActivityWindows(selected, slots, opts) : [];
  const selectedDef = ACTIVITIES.find((a) => a.id === selected);

  // For golden hour: show sunrise/sunset times even if no slots scored
  const isGolden = selected === "golden";
  const noWindows = windows.length === 0;

  return (
    <div
      className="card rounded-2xl p-5 md:p-6"
      style={{
        background: "var(--card-bg)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--card-border)",
      }}
    >
      <h2 className="text-slate-300 font-semibold mb-1 text-sm uppercase tracking-wider">
        Best Time For…
      </h2>
      <p className="text-slate-600 text-xs mb-4">
        Pick an activity to see your best 3-hour windows today
      </p>

      {/* Activity buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ACTIVITIES.map((a) => {
          const active = selected === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setSelected(active ? null : a.id)}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all cursor-pointer"
              style={{
                background: active
                  ? "rgba(96,165,250,0.2)"
                  : "rgba(255,255,255,0.05)",
                border: active
                  ? "1px solid rgba(96,165,250,0.4)"
                  : "1px solid rgba(255,255,255,0.06)",
                color: active ? "#93c5fd" : "#94a3b8",
              }}
            >
              {a.emoji} {a.label}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {selected && (
        <>
          {isGolden && noWindows && (
            <div
              className="rounded-xl p-4 text-sm"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-slate-400 mb-2">
                📸 Golden hour windows are outside the next 24h slots, but today&apos;s moments are:
              </p>
              <div className="flex gap-4">
                <div>
                  <span className="text-slate-500 text-xs">Sunrise</span>
                  <p className="text-amber-400 font-semibold">{formatTime(today.sunrise)}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Sunset</span>
                  <p className="text-orange-400 font-semibold">{formatTime(today.sunset)}</p>
                </div>
              </div>
            </div>
          )}

          {!noWindows && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {windows.map(({ slot, score }, i) => {
                const wmo = getWMO(slot.weatherCode);
                const scoreCol = activityScoreColor(score);
                const scoreTag = activityScoreLabel(score);
                return (
                  <div
                    key={i}
                    className="rounded-xl p-4 flex flex-col gap-2"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderLeft: `3px solid ${scoreCol}`,
                    }}
                  >
                    {/* Rank + time */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">#{i + 1} pick</span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${scoreCol}22`,
                          color: scoreCol,
                        }}
                      >
                        {scoreTag}
                      </span>
                    </div>

                    {/* Time + emoji */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{wmo.emoji}</span>
                      <div>
                        <p
                          className="text-lg font-bold"
                          style={{ color: "var(--accent-blue)" }}
                        >
                          {formatTime(slot.time)}
                        </p>
                        <p className="text-slate-500 text-xs">{wmo.description}</p>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Conditions score</span>
                        <span style={{ color: scoreCol }}>{score}/100</span>
                      </div>
                      <div
                        className="h-1.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${score}%`, background: scoreCol }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                      <span>🌡 {Math.round(slot.temperature)}° / feels {Math.round(slot.apparentTemperature)}°</span>
                      <span>💧 {slot.precipitationProbability}%</span>
                      <span>💨 {Math.round(slot.windSpeed)} km/h</span>
                      <span>☀️ UV {Math.round(slot.uvIndex)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isGolden && noWindows && (
            <p className="text-slate-500 text-sm text-center py-4">
              No suitable window found for {selectedDef?.emoji} {selectedDef?.label} in the next 24h.
            </p>
          )}
        </>
      )}
    </div>
  );
}
