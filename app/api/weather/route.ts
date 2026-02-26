import { NextRequest, NextResponse } from "next/server";
import { fetchForecast } from "@/lib/openmeteo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const forecast = await fetchForecast(lat, lon);
    return NextResponse.json(forecast);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
