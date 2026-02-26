import { NextRequest, NextResponse } from "next/server";

interface WindyWebcam {
  id: string;
  title: string;
  player?: {
    day?: { embed?: string };
  };
  images?: {
    current?: { thumbnail?: string };
  };
  location?: {
    city?: string;
    country?: string;
  };
}

interface WindyResponse {
  result?: {
    webcams?: WindyWebcam[];
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "lat and lon are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.WINDY_WEBCAMS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Windy API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url =
      `https://api.windy.com/api/webcams/v2/list/nearby=${lat},${lon},50` +
      `?show=webcams:player,images,location&orderby=distance&limit=3`;

    const res = await fetch(url, {
      headers: { "x-windy-api-key": apiKey },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      // Windy returned an error — treat as no webcams found
      return NextResponse.json([]);
    }

    const data: WindyResponse = await res.json();
    const webcams = data?.result?.webcams ?? [];

    const cleaned = webcams
      .filter((w) => w.player?.day?.embed && w.images?.current?.thumbnail)
      .map((w) => ({
        id: w.id,
        title: w.title,
        thumbnail: w.images!.current!.thumbnail!,
        embedUrl: w.player!.day!.embed!,
        city: w.location?.city ?? "",
      }));

    return NextResponse.json(cleaned);
  } catch {
    // Network or parse error — return empty, not an error status
    return NextResponse.json([]);
  }
}
