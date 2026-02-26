import { NextRequest, NextResponse } from "next/server";

export interface MonthSummary {
  month: number; // 0 = Jan … 11 = Dec
  avgHigh: number;
  avgLow: number;
  avgMean: number;
  avgPrecip: number; // mm per month
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  // Use the last 5 complete calendar years
  const endYear = new Date().getFullYear() - 1;
  const startYear = endYear - 4;

  const url =
    `https://archive-api.open-meteo.com/v1/archive` +
    `?latitude=${lat}&longitude=${lon}` +
    `&start_date=${startYear}-01-01&end_date=${endYear}-12-31` +
    `&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum` +
    `&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch climate data" }, { status: 500 });
  }

  const data = await res.json();

  const times: string[] = data.daily?.time ?? [];
  const highs: (number | null)[] = data.daily?.temperature_2m_max ?? [];
  const lows: (number | null)[] = data.daily?.temperature_2m_min ?? [];
  const means: (number | null)[] = data.daily?.temperature_2m_mean ?? [];
  const precips: (number | null)[] = data.daily?.precipitation_sum ?? [];

  // Bucket by (year, month) first so we can average across years properly
  const byYearMonth: Record<
    string,
    { highs: number[]; lows: number[]; means: number[]; precipSum: number }
  > = {};

  times.forEach((dateStr, i) => {
    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!byYearMonth[key]) {
      byYearMonth[key] = { highs: [], lows: [], means: [], precipSum: 0 };
    }
    if (highs[i] !== null) byYearMonth[key].highs.push(highs[i] as number);
    if (lows[i] !== null) byYearMonth[key].lows.push(lows[i] as number);
    if (means[i] !== null) byYearMonth[key].means.push(means[i] as number);
    if (precips[i] !== null) byYearMonth[key].precipSum += precips[i] as number;
  });

  // Collect each month's per-year averages then average across years
  const byMonth: { highs: number[]; lows: number[]; means: number[]; precips: number[] }[] =
    Array.from({ length: 12 }, () => ({ highs: [], lows: [], means: [], precips: [] }));

  Object.entries(byYearMonth).forEach(([key, v]) => {
    const month = parseInt(key.split("-")[1]);
    byMonth[month].highs.push(avg(v.highs));
    byMonth[month].lows.push(avg(v.lows));
    byMonth[month].means.push(avg(v.means));
    byMonth[month].precips.push(v.precipSum);
  });

  const round1 = (n: number) => Math.round(n * 10) / 10;

  const result: MonthSummary[] = byMonth.map((m, i) => ({
    month: i,
    avgHigh: round1(avg(m.highs)),
    avgLow: round1(avg(m.lows)),
    avgMean: round1(avg(m.means)),
    avgPrecip: Math.round(avg(m.precips)),
  }));

  return NextResponse.json(result);
}
