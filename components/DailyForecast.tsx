import type { DailySlot } from "@/lib/types";
import { getWMO } from "@/lib/wmo";
import { getDayConfidence, confidenceColor } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

interface Props {
  slots: DailySlot[];
}

export default function DailyForecast({ slots }: Props) {
  const { t, lang } = useLanguage();
  return (
    <div
      className="card rounded-2xl p-5 md:p-6"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">
          {t.dailyTitle}
        </h2>
        <span className="text-slate-600 text-xs">
          {t.barConfidence}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {slots.map((slot, i) => {
          const wmo = getWMO(slot.weatherCode, lang);
          const confidence = getDayConfidence(i, slot.precipitationProbability);
          const confColor = confidenceColor(confidence);
          const dayLabel =
            slot.label === "Today" ? t.today
            : slot.label === "Tomorrow" ? t.tomorrow
            : slot.label;

          return (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col items-center rounded-xl min-w-[76px] sm:min-w-[90px] overflow-hidden"
              style={{ background: "rgba(0,0,0,0.04)" }}
            >
              {/* Feature 1: Confidence colour bar at top of each card */}
              <div
                className="w-full h-1"
                title={`${confidence}%`}
                style={{ background: "rgba(0,0,0,0.07)" }}
              >
                <div
                  className="h-full transition-all"
                  style={{ width: `${confidence}%`, background: confColor }}
                />
              </div>

              <div className="flex flex-col items-center gap-1.5 px-2 sm:px-4 py-3 text-center w-full">
                <span className="text-slate-400 text-xs font-medium">{dayLabel}</span>
                <span className="text-3xl my-1">{wmo.emoji}</span>
                <div className="flex gap-1 text-sm font-semibold">
                  <span style={{ color: "var(--accent-blue)" }}>
                    {Math.round(slot.tempMax)}°
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">{Math.round(slot.tempMin)}°</span>
                </div>
                <span className="text-slate-500 text-xs">
                  💧{slot.precipitationProbability}%
                </span>
                <span className="text-slate-500 text-xs">
                  💨{Math.round(slot.windSpeedMax)} km/h
                </span>

                {/* Confidence % */}
                <span
                  className="text-[10px] font-semibold mt-0.5"
                  style={{ color: confColor }}
                >
                  {confidence}% {t.conf}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature 1: Confidence key */}
      <div className="flex gap-4 mt-4 justify-center flex-wrap">
        {[
          { label: t.confidenceHigh, color: "#16a34a" },
          { label: t.confidenceModerate, color: "#a16207" },
          { label: t.confidenceLow, color: "#c2410c" },
          { label: t.confidenceUncertain, color: "#dc2626" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full" style={{ background: color }} />
            <span className="text-slate-600 text-[11px]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
