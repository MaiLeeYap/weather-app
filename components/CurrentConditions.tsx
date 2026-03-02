import type { CurrentWeather, DailySlot } from "@/lib/types";
import { getWMO } from "@/lib/wmo";
import { windDirection, uvLabel, formatTime } from "@/lib/utils";

interface Props {
  current: CurrentWeather;
  cityName: string;
  today: DailySlot;
}

export default function CurrentConditions({ current, cityName, today }: Props) {
  const wmo = getWMO(current.weather_code);

  return (
    <div
      className="card rounded-2xl p-4 sm:p-6 md:p-8"
      style={{
        background: "var(--card-bg)",
        backdropFilter: "blur(12px)",
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
            Feels like {Math.round(current.apparent_temperature)}°C
          </div>
          <div className="text-lg font-medium text-slate-200 mt-2">
            {wmo.description}
          </div>
          <div className="text-slate-400 text-sm">{cityName}</div>
        </div>

        {/* Right: stats grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-x-10 md:gap-y-4">
          <StatItem
            label="Wind"
            value={`${Math.round(current.wind_speed_10m)} km/h ${windDirection(current.wind_direction_10m)}`}
            icon="💨"
          />
          <StatItem
            label="Humidity"
            value={`${current.relative_humidity_2m}%`}
            icon="💧"
          />
          <StatItem
            label="Precip. chance"
            value={`${current.precipitation_probability ?? 0}%`}
            icon="🌧️"
          />
          <StatItem
            label={`UV Index (${uvLabel(current.uv_index)})`}
            value={String(Math.round(current.uv_index))}
            icon="☀️"
          />
          <StatItem
            label="Cloud cover"
            value={`${current.cloud_cover}%`}
            icon="☁️"
          />
          <StatItem
            label="Sunrise / Sunset"
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
