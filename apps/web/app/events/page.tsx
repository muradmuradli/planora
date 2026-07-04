'use client';

import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { CATEGORY_OPTIONS } from "@/lib/categories";
import {
  type EventItem,
  eventLocationLabel,
  formatEventDateTime,
  startingPriceLabel,
} from "@/lib/events";

const CATEGORY_FILTERS = ["All Events", ...CATEGORY_OPTIONS.map((c) => c.label)];
const PAGE_SIZE = 9;

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All Events");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/events")
      .then((data: EventItem[]) => {
        if (!cancelled) setEvents(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error("Couldn't load events", {
            description: err instanceof ApiError ? err.message : "Something went wrong",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesCat =
        activeCat === "All Events" ||
        CATEGORY_OPTIONS.find((c) => c.value === e.category)?.label === activeCat;
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        eventLocationLabel(e).toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [events, query, activeCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <Navbar />

      {/* Header */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <Badge className="w-fit border-0 bg-accent text-accent-foreground">
              {events.length}+ events
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Browse all events
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Explore every upcoming event on Planora. Filter by category, search by name or city,
              and find your next unforgettable experience.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title or location..."
              className="h-11 w-full rounded-xl border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="outline" className="gap-2 sm:w-auto">
            <SlidersHorizontal className="h-4 w-4" />
            More filters
          </Button>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCat(cat);
                setPage(1);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCat === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border bg-card p-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{filtered.length}</span> events
              </p>
            </div>

            {paged.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paged.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    dateLabel={formatEventDateTime(event.startDate)}
                    location={eventLocationLabel(event)}
                    imageUrl={event.imageUrl}
                    category={event.category}
                    price={startingPriceLabel(event.ticketTypes)}
                    attendees={0}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-card p-16 text-center">
                <h3 className="text-lg font-semibold text-foreground">No events found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {events.length === 0
                    ? "No events have been published yet."
                    : "Try adjusting your search or filters."}
                </p>
                {events.length > 0 && (
                  <Button
                    variant="outline"
                    className="mt-5"
                    onClick={() => {
                      setQuery("");
                      setActiveCat("All Events");
                      setPage(1);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-12">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) goTo(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {pageNumbers.map((p, idx) =>
                    p === "ellipsis" ? (
                      <PaginationItem key={`e-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            goTo(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) goTo(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
