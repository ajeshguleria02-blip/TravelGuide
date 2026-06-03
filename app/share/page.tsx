"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Lightbulb,
  AlertCircle,
  Plane,
  Share2,
  Check,
  Copy,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Activity {
  time: string;
  description: string;
  type?: string;
}

interface Day {
  day: number;
  date?: string;
  activities: Activity[];
}

interface SharedItinerary {
  title?: string;
  summary?: string;
  yourCity?: string;
  destinationCity?: string;
  days?: Day[];
  tips?: string[];
}

// ─── Activity badge colours ──────────────────────────────────────────────────

const typeColors: Record<string, string> = {
  flight: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  hotel: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  activity: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  dining: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

const typeEmoji: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  activity: "🎯",
  dining: "🍽️",
};

// ─── Decode helper ───────────────────────────────────────────────────────────

function decodeItinerary(hash: string): SharedItinerary | null {
  try {
    // hash looks like "#data=eyJ0aXR..."
    const prefix = "#data=";
    if (!hash.startsWith(prefix)) return null;
    const encoded = hash.slice(prefix.length);
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ─── Page component ──────────────────────────────────────────────────────────

export default function SharePage() {
  const [data, setData] = useState<SharedItinerary | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const decoded = decodeItinerary(window.location.hash);
    if (decoded) {
      setData(decoded);
    } else {
      setInvalid(true);
    }
    setLoading(false);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API might be blocked */
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Plane className="w-8 h-8 animate-bounce text-primary" />
          <p className="text-sm">Loading shared itinerary…</p>
        </div>
      </div>
    );
  }

  // ── Error / empty state ────────────────────────────────────────────────────

  if (invalid || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-4">
        <Card className="max-w-md w-full bg-card/50 backdrop-blur-sm border-destructive/30 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Invalid Share Link
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              This link doesn&apos;t contain a valid itinerary. It may have been
              truncated or corrupted. Ask the sender for a new link.
            </p>
            <Button
              variant="outline"
              className="rounded-full mt-2"
              onClick={() => (window.location.href = "/")}
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Valid itinerary ────────────────────────────────────────────────────────

  const heading =
    data.title ||
    (data.yourCity && data.destinationCity
      ? `${data.yourCity} → ${data.destinationCity}`
      : "Shared Itinerary");

  return (
    <div className="flex min-h-screen flex-col items-center bg-background text-foreground px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* ── Header Card ───────────────────────────────────────────────────── */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg overflow-hidden">
          {/* Gradient accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Plane className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-2xl font-bold tracking-tight truncate">
                    {heading}
                  </CardTitle>
                  {data.yourCity && data.destinationCity && data.title && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {data.yourCity} → {data.destinationCity}
                    </p>
                  )}
                </div>
              </div>

              {/* Copy link button */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-full shrink-0 gap-1.5"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          {data.summary && (
            <CardContent className="pt-0 pb-5">
              <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 border border-border/40">
                {data.summary}
              </p>
            </CardContent>
          )}
        </Card>

        {/* ── Day cards ─────────────────────────────────────────────────────── */}
        {data.days &&
          data.days.length > 0 &&
          data.days.map((day, i) => (
            <Card
              key={i}
              className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-md transition-all duration-200 hover:border-primary/25 hover:shadow-lg"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                    Day {day.day}
                  </span>
                  {day.date && (
                    <span className="text-xs text-muted-foreground">
                      {day.date}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2.5">
                  {day.activities?.map((act, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm border-l-2 border-primary/30 pl-3 py-1"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground">
                          {act.time}:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {act.description}
                        </span>
                      </div>
                      {act.type && (
                        <span
                          className={`shrink-0 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                            typeColors[act.type] ??
                            "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {typeEmoji[act.type] ?? ""} {act.type}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

        {/* ── Tips ──────────────────────────────────────────────────────────── */}
        {data.tips && data.tips.length > 0 && (
          <Card className="border-amber-400/30 bg-amber-50/30 dark:bg-amber-900/10 shadow-md">
            <CardContent className="p-5 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Lightbulb className="w-4 h-4" />
                Travel Tips
              </h4>
              <ul className="space-y-1.5">
                {data.tips.map((tip, k) => (
                  <li
                    key={k}
                    className="text-sm text-muted-foreground flex gap-2"
                  >
                    <span className="text-amber-500 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* ── Shared badge ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4 pb-8">
          <Share2 className="w-3.5 h-3.5" />
          Shared via Travel Guide
        </div>
      </div>
    </div>
  );
}
