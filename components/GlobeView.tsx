"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

interface CityCoords {
  latitude: number;
  longitude: number;
  name: string;
}

interface GlobeViewProps {
  city: CityCoords | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false }) as any;

function GlobeInner({ city }: GlobeViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  // Keep a ref that is always current so onGlobeReady can read it
  // even if it fires after the city has already been selected.
  const cityRef = useRef<CityCoords | null>(city);
  cityRef.current = city;

  // Measure container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(Math.round(w));
    });
    obs.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width) || 600);
    return () => obs.disconnect();
  }, []);

  const applyCity = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globe: any, coords: CityCoords | null, animate = true) => {
      const controls = globe.controls();
      if (coords) {
        controls.autoRotate = false;
        globe.pointOfView(
          { lat: coords.latitude, lng: coords.longitude, altitude: 0.4 },
          animate ? 1400 : 0
        );
      } else {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
      }
    },
    []
  );

  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    // Crisp rendering on high-DPI screens
    const renderer = globe.renderer();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));

    // Max anisotropy — applied now and after textures finish loading
    const applyAnisotropy = () => {
      const maxAniso = renderer.capabilities.getMaxAnisotropy();
      const mat = globe.globeMaterial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [mat.map, mat.bumpMap].forEach((tex: any) => {
        if (tex) { tex.anisotropy = maxAniso; tex.needsUpdate = true; }
      });
    };
    applyAnisotropy();
    setTimeout(applyAnisotropy, 800);

    globe.controls().enableZoom = false;

    // Apply whatever city is already selected (race-condition fix)
    applyCity(globe, cityRef.current, false);
  }, [applyCity]);

  // Respond to city changes after the globe is already mounted
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return; // not mounted yet — onGlobeReady will handle it
    applyCity(globe, city, true);
  }, [city, applyCity]);

  const points = city
    ? [{ lat: city.latitude, lng: city.longitude, label: city.name }]
    : [];

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 380,
        background: "#dce9f7",
        borderRadius: "1rem",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Globe
        ref={globeRef}
        width={width}
        height={380}
        backgroundColor="#dce9f7"
        globeImageUrl="https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg"
        bumpImageUrl="https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg"
        atmosphereColor="#4fc3f7"
        atmosphereAltitude={0.15}
        onGlobeReady={handleGlobeReady}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointLabel="label"
        pointColor={() => "#ff3b3b"}
        pointAltitude={0.04}
        pointRadius={0.35}
        pointsMerge={false}
      />
    </div>
  );
}

const GlobeView = dynamic(() => Promise.resolve(GlobeInner), { ssr: false });
export default GlobeView;
