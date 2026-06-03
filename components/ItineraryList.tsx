"use client";

import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plane,
  Calendar,
  Lightbulb,
  AlertCircle,
  Loader2,
  ListChecks,
  Share2,
  Check,
  Copy,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DestinationSummary {
  _id: string;
  yourCity: string;
  destinationCity: string;
  travel_itinerary: Record<string, any> | null;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

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

interface Itinerary {
  title?: string;
  summary?: string;
  days?: Day[];
  tips?: string[];
}

interface DestinationDetail extends DestinationSummary {
  travel_itinerary: Itinerary | null;
}

// ─── Activity type badge colours ─────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function ItineraryList({ refreshKey }: { refreshKey?: number }) {
  // List state
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // Detail / modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<DestinationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Build & copy share link ─────────────────────────────────────────────────

  const handleShare = async (dest: DestinationDetail) => {
    const payload = {
      title: dest.travel_itinerary?.title,
      summary: dest.travel_itinerary?.summary,
      yourCity: dest.yourCity,
      destinationCity: dest.destinationCity,
      days: dest.travel_itinerary?.days,
      tips: dest.travel_itinerary?.tips,
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    const url = `${window.location.origin}/share#data=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select a prompt
      window.prompt("Copy this link:", url);
    }
  };

  // ── Fetch list ──────────────────────────────────────────────────────────────

  const fetchDestinations = useCallback(async (pageNum: number) => {
    setListLoading(true);
    setListError("");
    try {
      const token = Cookies.get("token");
      const res = await fetch(
        `https://travel-ozju.vercel.app/api/travel/destinations?page=${pageNum}&limit=6`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setListError(data.message || "Failed to load itineraries.");
        return;
      }
      setDestinations(data.data);
      setPagination(data.pagination);
    } catch {
      setListError("Network error. Please try again.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations(page);
  }, [page, fetchDestinations, refreshKey]);

  // ── Fetch single destination ────────────────────────────────────────────────

  const handleOpen = async (id: string) => {
    setModalOpen(true);
    setSelected(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await fetch(`https://travel-ozju.vercel.app/api/travel/destinations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDetailError(data.message || "Failed to load itinerary details.");
        return;
      }
      setSelected(data.data);
    } catch {
      setDetailError("Network error. Please try again.");
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Card className="w-full bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">My Itineraries</CardTitle>
              <CardDescription>
                {pagination ? `${pagination.total} trip${pagination.total !== 1 ? "s" : ""} planned` : "Your saved travel plans"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ── Error ── */}
          {listError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {listError}
            </div>
          )}

          {/* ── Loading skeleton ── */}
          {listLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-muted/40 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!listLoading && !listError && destinations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground space-y-2">
              <Plane className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">No itineraries yet.</p>
              <p className="text-xs">Create your first trip using the form!</p>
            </div>
          )}

          {/* ── List ── */}
          {!listLoading && destinations.length > 0 && (
            <ul className="space-y-3">
              {destinations.map((dest) => (
                <li key={dest._id}>
                  <button
                    onClick={() => handleOpen(dest._id)}
                    className="w-full text-left group rounded-xl border border-border/60 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {dest.yourCity}
                            <span className="mx-1.5 text-muted-foreground">→</span>
                            {dest.destinationCity}
                          </p>
                          {dest.travel_itinerary?.title && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {dest.travel_itinerary.title}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(dest.created_at)}
                        </span>
                        {dest.travel_itinerary?.days && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            {dest.travel_itinerary.days.length} day{dest.travel_itinerary.days.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    {dest.travel_itinerary?.summary && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 pl-12">
                        {dest.travel_itinerary.summary}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* ── Pagination ── */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrevPage || listLoading}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage || listLoading}
                className="rounded-full"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-xl font-bold">
                {selected
                  ? selected.travel_itinerary?.title ||
                  `${selected.yourCity} → ${selected.destinationCity}`
                  : "Itinerary Details"}
              </DialogTitle>
              {selected && selected.travel_itinerary && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full shrink-0 gap-1.5"
                  onClick={() => handleShare(selected)}
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5" /> Copied!</>
                  ) : (
                    <><Share2 className="w-3.5 h-3.5" /> Share</>
                  )}
                </Button>
              )}
            </div>
            {selected && (
              <DialogDescription>
                {selected.yourCity} → {selected.destinationCity} &middot;{" "}
                {formatDate(selected.created_at)}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Loading */}
          {detailLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Loading itinerary…</p>
            </div>
          )}

          {/* Error */}
          {!detailLoading && detailError && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {detailError}
            </div>
          )}

          {/* Content */}
          {!detailLoading && !detailError && selected && (
            <div className="space-y-6 py-2">
              {/* No itinerary fallback */}
              {!selected.travel_itinerary ? (
                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 opacity-40" />
                  <p className="text-sm">No itinerary was generated for this trip.</p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  {selected.travel_itinerary.summary && (
                    <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-3 border border-border/40">
                      {selected.travel_itinerary.summary}
                    </p>
                  )}

                  {/* Days */}
                  {selected.travel_itinerary.days && selected.travel_itinerary.days.length > 0 && (
                    <div className="space-y-5">
                      {selected.travel_itinerary.days.map((day, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                              Day {day.day}
                            </span>
                            {day.date && (
                              <span className="text-xs text-muted-foreground">{day.date}</span>
                            )}
                          </div>
                          <ul className="space-y-2 ml-1">
                            {day.activities?.map((act, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-3 text-sm border-l-2 border-primary/30 pl-3 py-1"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-foreground">{act.time}: </span>
                                  <span className="text-muted-foreground">{act.description}</span>
                                </div>
                                {act.type && (
                                  <span
                                    className={`shrink-0 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${typeColors[act.type] ?? "bg-secondary text-secondary-foreground"
                                      }`}
                                  >
                                    {typeEmoji[act.type] ?? ""} {act.type}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tips */}
                  {selected.travel_itinerary.tips && selected.travel_itinerary.tips.length > 0 && (
                    <div className="rounded-xl border border-amber-400/30 bg-amber-50/30 dark:bg-amber-900/10 p-4 space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <Lightbulb className="w-4 h-4" />
                        Travel Tips
                      </h4>
                      <ul className="space-y-1.5">
                        {selected.travel_itinerary.tips.map((tip, k) => (
                          <li key={k} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
