"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock } from "lucide-react";
import type { City } from "@/lib/types";
import { searchCities } from "@/lib/openmeteo";

const STORAGE_KEY = "wx_recent_searches";
const MAX_RECENT = 10;

function loadRecent(): City[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(city: City, current: City[]): City[] {
  // Remove duplicate, prepend, cap at MAX_RECENT
  const filtered = current.filter((c) => c.id !== city.id);
  const updated = [city, ...filtered].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

interface Props {
  onSelect: (city: City) => void;
}

export default function CitySearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<City[]>([]);
  const [showingRecent, setShowingRecent] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextSearchRef = useRef(false);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const cities = await searchCities(q);
    setResults(cities);
    setShowingRecent(false);
    setOpen(true);
    setActiveIndex(-1);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, doSearch]);

  function handleFocus() {
    if (!query.trim() && recent.length > 0) {
      setShowingRecent(true);
      setOpen(true);
      setActiveIndex(-1);
    }
  }

  function handleSelect(city: City) {
    skipNextSearchRef.current = true;
    setQuery(`${city.name}, ${city.country}`);
    setOpen(false);
    setShowingRecent(false);
    setResults([]);
    setRecent((prev) => saveRecent(city, prev));
    onSelect(city);
  }

  function removeRecent(city: City, e: React.MouseEvent) {
    e.stopPropagation();
    setRecent((prev) => {
      const updated = prev.filter((c) => c.id !== city.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (updated.length === 0) setOpen(false);
      return updated;
    });
  }

  const displayList = showingRecent ? recent : results;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || displayList.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, displayList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(displayList[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      className="relative w-full max-w-lg mx-auto"
      onBlur={(e) => {
        // Close if focus leaves the whole component
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{
          background: "var(--card-bg)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--card-border)",
        }}
      >
        <Search className="text-slate-400 w-4 h-4 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search city…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value.trim()) {
              setShowingRecent(recent.length > 0);
              setOpen(recent.length > 0);
            }
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-slate-100 placeholder-slate-500 text-sm"
          autoComplete="off"
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin flex-shrink-0" />
        )}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowingRecent(recent.length > 0);
              setOpen(recent.length > 0);
              inputRef.current?.focus();
            }}
            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && displayList.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-2 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10,15,26,0.98)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--card-border)",
          }}
        >
          {/* Section header for recent searches */}
          {showingRecent && (
            <li
              className="px-4 pt-3 pb-1 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Recent searches
              </span>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  localStorage.removeItem(STORAGE_KEY);
                  setRecent([]);
                  setOpen(false);
                }}
                className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
              >
                Clear all
              </button>
            </li>
          )}

          {displayList.map((city, i) => (
            <li
              key={city.id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(city); }}
              className="px-4 py-3 cursor-pointer text-sm transition-colors flex items-center justify-between group"
              style={{
                background: i === activeIndex ? "rgba(96,165,250,0.1)" : "transparent",
                color: i === activeIndex ? "#60a5fa" : "#cbd5e1",
                borderBottom:
                  i < displayList.length - 1
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "none",
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                {showingRecent && (
                  <Clock className="w-3 h-3 text-slate-600 flex-shrink-0" />
                )}
                <span className="truncate">
                  <span className="font-medium">{city.name}</span>
                  <span className="text-slate-500">
                    {city.admin1 ? `, ${city.admin1}` : ""} — {city.country}
                  </span>
                </span>
              </div>
              {showingRecent && (
                <button
                  onMouseDown={(e) => removeRecent(city, e)}
                  className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* No autocomplete results */}
      {open && !showingRecent && !loading && results.length === 0 && query.trim() && (
        <ul
          className="absolute z-50 w-full mt-2 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10,15,26,0.98)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--card-border)",
          }}
        >
          <li className="px-4 py-3 text-slate-400 text-sm">No results found</li>
        </ul>
      )}
    </div>
  );
}
