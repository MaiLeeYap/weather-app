import type { CurrentWeather, DailySlot } from "@/lib/types";
import { getWMO } from "@/lib/wmo";
import { windDirection, formatTime } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import type { Translations } from "@/lib/i18n";

function uvLabelT(uv: number, t: Translations): string {
  if (uv <= 2) return t.uvLow;
  if (uv <= 5) return t.uvModerate;
  if (uv <= 7) return t.uvHigh;
  if (uv <= 10) return t.uvVeryHigh;
  return t.uvExtreme;
}

interface Props {
  current: CurrentWeather;
  cityName: string;
  today: DailySlot;
}

export default function CurrentConditions({ current, cityName, today }: Props) {
  const { t, lang } = useLanguage();
  const wmo = getWMO(current.weather_code, lang);

  return (
    <div
      className="card rounded-2xl p-4 sm:p-6 md:p-8"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Left: hero temperature */}
        <div className="flex flex-col gap-1">
          <div className="text-3xl sm:text-4xl mb-1">{wmo.emoji}</div>
          <div
            className="text-5xl sm:text-7xl font-bold leading-none"
            style={{ color: "var(--accent-blue)" }}
          >
            {Math.round(current.temperature_2m)}°
          </div>
          <div className="text-slate-400 text-sm mt-1">
            {t.feelsLike} {Math.round(current.apparent_temperature)}°C
          </div>
          <div className="text-lg font-medium text-slate-200 mt-2">
            {wmo.description}
          </div>
          <div className="text-slate-400 text-sm">{cityName}</div>
        </div>

        {/* Right: stats grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-x-10 md:gap-y-4">
          <StatItem
            label={t.wind}
            value={`${Math.round(current.wind_speed_10m)} km/h ${windDirection(current.wind_direction_10m)}`}
            icon="💨"
          />
          <StatItem
            label={t.humidity}
            value={`${current.relative_humidity_2m}%`}
            icon="💧"
          />
          <StatItem
            label={t.precipChance}
            value={`${current.precipitation_probability ?? 0}%`}
            icon="🌧️"
          />
          <StatItem
            label={`${t.uvIndexLabel} (${uvLabelT(current.uv_index, t)})`}
            value={String(Math.round(current.uv_index))}
            icon="☀️"
          />
          <StatItem
            label={t.cloudCover}
            value={`${current.cloud_cover}%`}
            icon="☁️"
          />
          <StatItem
            label={t.sunriseSunset}
            value={`${formatTime(today.sunrise)} / ${formatTime(today.sunset)}`}
            icon="🌅"
          />
        </div>
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-slate-500 text-xs uppercase tracking-wide">
        {icon} {label}
      </span>
      <span className="text-slate-100 font-semibold text-sm">{value}</span>
    </div>
  );
}
