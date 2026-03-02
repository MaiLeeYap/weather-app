"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface Webcam {
  id: string;
  title: string;
  thumbnail: string;
  embedUrl: string;
  city: string;
}

interface CityWebcamProps {
  lat: number;
  lon: number;
  cityName: string;
}

export default function CityWebcam({ lat, lon, cityName }: CityWebcamProps) {
  const { t } = useLanguage();
  const [webcams, setWebcams] = useState<Webcam[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setWebcams([]);
    setExpandedId(null);

    fetch(`/api/webcams?lat=${lat}&lon=${lon}`)
      .then((r) => r.json())
      .then((data: Webcam[]) => {
        setWebcams(Array.isArray(data) ? data : []);
      })
      .catch(() => setWebcams([]))
      .finally(() => setLoading(false));
  }, [lat, lon]);

  const cardStyle: React.CSSProperties = {
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    borderRadius: "1rem",
    padding: "1.25rem",
  };

  if (loading) {
    return (
      <div className="card" style={cardStyle}>
        <h2 className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
          📷 {t.webcamsTitle}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 h-28 rounded-xl animate-pulse"
              style={{ background: "rgba(0,0,0,0.06)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (webcams.length === 0) {
    return (
      <div className="card" style={cardStyle}>
        <h2 className="text-slate-300 text-sm font-semibold mb-2 flex items-center gap-2">
          📷 {t.webcamsTitle}
        </h2>
        <p className="text-slate-500 text-sm">
          {t.noWebcams} {cityName}.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={cardStyle}>
      <h2 className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
        📷 Live Webcams
        <span className="text-slate-500 font-normal">{t.webcamsNear} {cityName}</span>
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {webcams.map((cam) => (
          <div key={cam.id} className="flex-shrink-0 w-48">
            {expandedId === cam.id ? (
              <div className="flex flex-col gap-1">
                <iframe
                  src={cam.embedUrl}
                  width="192"
                  height="108"
                  className="rounded-xl"
                  style={{ border: "none", display: "block" }}
                  allow="autoplay"
                  sandbox="allow-scripts allow-same-origin"
                  title={cam.title}
                />
                <button
                  onClick={() => setExpandedId(null)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors text-left truncate"
                >
                  ✕ {cam.title}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setExpandedId(cam.id)}
                className="group relative block w-48 h-28 rounded-xl overflow-hidden focus:outline-none"
                title={cam.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cam.thumbnail}
                  alt={cam.title}
                  className="w-full h-full object-cover"
                />
                {/* Play overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.45)" }}
                >
                  <span className="text-3xl">▶</span>
                </div>
                {/* Title bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-2 py-1 text-xs text-white truncate"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  {cam.title}
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
