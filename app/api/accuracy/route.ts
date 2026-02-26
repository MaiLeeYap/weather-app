import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max");
    url.searchParams.set("past_days", "1");
    url.searchParams.set("forecast_days", "0");
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

    const json = await res.json();
    const d = json.daily;

    // past_days=1, forecast_days=0 → daily[0] is yesterday
    return NextResponse.json({
      date: d.time[0],
      tempMax: d.temperature_2m_max[0],
      tempMin: d.temperature_2m_min[0],
      precipProbability: d.precipitation_probability_max[0],
      weatherCode: d.weather_code[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch accuracy data" }, { status: 500 });
  }
}
