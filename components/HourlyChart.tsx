"use client";

import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { HourlySlot } from "@/lib/types";
import { formatTime } from "@/lib/utils";

interface Props {
  slots: HourlySlot[];
}

export default function HourlyChart({ slots }: Props) {
  const data = slots.map((s) => ({
    time: formatTime(s.time),
    temp: Math.round(s.temperature),
    feelsLike: Math.round(s.apparentTemperature),
    precip: s.precipitationProbability,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="time"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={2}
        />
        <YAxis
          yAxisId="temp"
          orientation="left"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}°`}
        />
        <YAxis
          yAxisId="precip"
          orientation="right"
          domain={[0, 100]}
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: 12,
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => {
            if (name === "temp") return [`${value}°C`, "Temperature"];
            if (name === "feelsLike") return [`${value}°C`, "Feels Like"];
            return [`${value}%`, "Precipitation"];
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "#64748b" }}
          formatter={(value) => {
            if (value === "temp") return "Temperature";
            if (value === "feelsLike") return "Feels Like";
            return "Precipitation %";
          }}
        />
        <Bar
          yAxisId="precip"
          dataKey="precip"
          fill="#818cf8"
          opacity={0.55}
          radius={[2, 2, 0, 0]}
          name="precip"
        />
        {/* Feature 5: Feels-like as a dashed line beneath the real temp */}
        <Area
          yAxisId="temp"
          type="monotone"
          dataKey="feelsLike"
          stroke="#a78bfa"
          fill="rgba(167,139,250,0.06)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          name="feelsLike"
        />
        <Area
          yAxisId="temp"
          type="monotone"
          dataKey="temp"
          stroke="#60a5fa"
          fill="rgba(96,165,250,0.15)"
          strokeWidth={2}
          dot={false}
          name="temp"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
