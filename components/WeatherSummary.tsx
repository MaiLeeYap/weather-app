import type { CurrentWeather, HourlySlot, DailySlot } from "@/lib/types";
import { getRainInfo, generateWeatherSummary, formatTime } from "@/lib/utils";

interface Props {
  current: CurrentWeather;
  slots: HourlySlot[];
  today: DailySlot;
}

export default function WeatherSummary({ current, slots, today }: Props) {
  const { isRaining, message: rainMsg } = getRainInfo(slots);
  const summary = generateWeatherSummary(current, slots, today);

  // Build the hourly rain timeline for a visual bar (next 12h)
  const rainBar = slots.slice(0, 12);

  return (
    <div
      className="card rounded-2xl p-5 md:p-6"
      style={{
        background: "var(--card-bg)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--card-border)",
      }}
    >
      <h2 className="text-slate-300 font-semibold mb-4 text-sm uppercase tracking-wider">
        Today at a Glance
      </h2>

      {/* Rain countdown banner */}
      {rainMsg && (
        <div
          className="mb-4 rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium"
          style={{
            background: isRaining
              ? "rgba(96,165,250,0.12)"
              : "rgba(251,191,36,0.1)",
            border: `1px solid ${isRaining ? "rgba(96,165,250,0.25)" : "rgba(251,191,36,0.2)"}`,
            color: isRaining ? "#93c5fd" : "#fbbf24",
          }}
        >
          <span className="text-lg flex-shrink-0">{isRaining ? "🌧️" : "⏱️"}</span>
          <span>{rainMsg}</span>
        </div>
      )}

      {/* Natural language summary */}
      <p className="text-slate-300 leading-relaxed text-sm md:text-base mb-5">
        {summary}
      </p>

      {/* 12-hour rain probability mini-timeline */}
      <div>
        <p className="text-slate-500 text-xs mb-2 uppercase tracking-wide">
          Rain probability — next 12h
        </p>
        <div className="flex items-end gap-1">
          {rainBar.map((slot, i) => {
            const pct = slot.precipitationProbability;
            const isWet = pct >= 40;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${Math.max(4, (pct / 100) * 48)}px`,
                    background: isWet
                      ? "rgba(96,165,250,0.7)"
                      : "rgba(129,140,248,0.3)",
                  }}
                  title={`${formatTime(slot.time)}: ${pct}%`}
                />
                {i % 3 === 0 && (
                  <span className="text-slate-600 text-[9px] leading-none">
                    {formatTime(slot.time).slice(0, 2)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
