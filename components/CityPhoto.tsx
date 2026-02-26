"use client";

import { useEffect, useState } from "react";

interface CityPhotoProps {
  cityName: string;
  country: string;
}

interface WikiSummary {
  description?: string;
  originalimage?: { source: string; width: number; height: number };
  thumbnail?: { source: string };
}

export default function CityPhoto({ cityName, country }: CityPhotoProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setImageUrl(null);
    setDescription("");

    // Try city name first, then "city, country" if no image found
    const attempts = [cityName, `${cityName}, ${country}`];

    async function tryFetch() {
      for (const query of attempts) {
        try {
          const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
          );
          if (!res.ok) continue;
          const data: WikiSummary = await res.json();
          const src = data.originalimage?.source ?? data.thumbnail?.source ?? null;
          if (src) {
            setImageUrl(src);
            setDescription(data.description ?? "");
            return;
          }
        } catch {
          // ignore, try next
        }
      }
    }

    tryFetch().finally(() => setLoading(false));
  }, [cityName, country]);

  if (loading) {
    return (
      <div
        className="w-full rounded-2xl animate-pulse"
        style={{ height: 220, background: "rgba(255,255,255,0.06)" }}
      />
    );
  }

  if (!imageUrl) return null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: 220 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={cityName}
        className="w-full h-full object-cover"
        style={{ objectPosition: "center 30%" }}
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,15,26,0.85) 0%, rgba(10,15,26,0.2) 55%, transparent 100%)",
        }}
      />
      {/* City label */}
      <div className="absolute bottom-0 left-0 p-4">
        <p className="text-white font-bold text-xl leading-tight drop-shadow">{cityName}</p>
        {description && (
          <p className="text-slate-300 text-xs mt-0.5 drop-shadow">{description}</p>
        )}
      </div>
    </div>
  );
}
