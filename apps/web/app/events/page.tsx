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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { CATEGORY_OPTIONS } from "@/lib/categories";
import {
  type EventItem,
  eventLocationLabel,
  formatEventDateTime,
  startingPriceLabel,
} from "@/lib/events";
import { Input } from "@/components/ui/input";

const CATEGORY_FILTERS = ["All Events", ...CATEGORY_OPTIONS.map((c) => c.label)];
const PAGE_SIZE = 9;

type DateRange = "any" | "today" | "weekend" | "month";
type Format = "any" | "online" | "in_person";
type SortBy = "soonest" | "price_low" | "price_high" | "newest";

function minEventPrice(event: EventItem): number {
  if (event.ticketTypes.length === 0) return 0;
  return Math.min(...event.ticketTypes.map((t) => Number(t.price)));
}

function matchesDateRange(iso: string, range: DateRange, now: Date): boolean {
  if (range === "any") return true;
  const date = new Date(iso);
  if (range === "today") return date.toDateString() === now.toDateString();
  if (range === "month") {
    return (
      date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    );
  }
  // weekend: the coming Saturday/Sunday within the next 7 days
  const diffDays = Math.floor((date.getTime() - now.getTime()) / 86400000);
  const day = date.getDay();
  return diffDays >= 0 && diffDays <= 7 && (day === 0 || day === 6);
}

const DEFAULT_MAX_PRICE = 500;

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All Events");
  const [page, setPage] = useState(1);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>("any");
  const [format, setFormat] = useState<Format>("any");
  const [freeOnly, setFreeOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [sortBy, setSortBy] = useState<SortBy>("soonest");

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

  const activeFilterCount =
    (dateRange !== "any" ? 1 : 0) +
    (format !== "any" ? 1 : 0) +
    (freeOnly || maxPrice < DEFAULT_MAX_PRICE ? 1 : 0);

  const filtered = useMemo(() => {
    const now = new Date();

    const matched = events.filter((e) => {
      const matchesCat =
        activeCat === "All Events" ||
        CATEGORY_OPTIONS.find((c) => c.value === e.category)?.label === activeCat;
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        eventLocationLabel(e).toLowerCase().includes(q);
      const matchesDate = matchesDateRange(e.startDate, dateRange, now);
      const matchesFormat =
        format === "any" ||
        (format === "online" ? e.isOnline : !e.isOnline);
      const price = minEventPrice(e);
      const matchesPrice = freeOnly ? price <= 0 : price <= maxPrice;
      return matchesCat && matchesQ && matchesDate && matchesFormat && matchesPrice;
    });

    const sorted = [...matched].sort((a, b) => {
      if (sortBy === "price_low") return minEventPrice(a) - minEventPrice(b);
      if (sortBy === "price_high") return minEventPrice(b) - minEventPrice(a);
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return sorted;
  }, [events, query, activeCat, dateRange, format, freeOnly, maxPrice, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetFilters = () => {
    setQuery("");
    setActiveCat("All Events");
    setDateRange("any");
    setFormat("any");
    setFreeOnly(false);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setSortBy("soonest");
    setPage(1);
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
      <div className="w-full bg-slate-100">
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-9/12 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
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
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="relative gap-2 px-3 py-4 sm:w-auto">
                <SlidersHorizontal className="h-4 w-4" />
                More filters
                {activeFilterCount > 0 && (
                  <Badge className="absolute -right-2 -top-2 size-5 justify-center border-0 bg-rose-600 p-0 text-[10px] text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filter events</DialogTitle>
                <DialogDescription>
                  Narrow down events by date, format, and price.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "any", label: "Any time" },
                        { value: "today", label: "Today" },
                        { value: "weekend", label: "This weekend" },
                        { value: "month", label: "This month" },
                      ] as { value: DateRange; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDateRange(opt.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          dateRange === opt.value
                            ? "bg-rose-600 text-white"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "any", label: "Any" },
                        { value: "in_person", label: "In-person" },
                        { value: "online", label: "Online" },
                      ] as { value: Format; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormat(opt.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          format === opt.value
                            ? "bg-rose-600 text-white"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="free-only">Free events only</Label>
                    <Switch id="free-only" checked={freeOnly} onCheckedChange={setFreeOnly} />
                  </div>
                  <div className={freeOnly ? "pointer-events-none opacity-40" : ""}>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Max price</span>
                      <span>
                        {maxPrice >= DEFAULT_MAX_PRICE ? `$${DEFAULT_MAX_PRICE}+` : `$${maxPrice}`}
                      </span>
                    </div>
                    <Slider
                      value={[maxPrice]}
                      min={0}
                      max={DEFAULT_MAX_PRICE}
                      step={10}
                      onValueChange={(value) => setMaxPrice(value[0])}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sort by</Label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soonest">Soonest first</SelectItem>
                      <SelectItem value="price_low">Price: low to high</SelectItem>
                      <SelectItem value="price_high">Price: high to low</SelectItem>
                      <SelectItem value="newest">Recently added</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
                <Button onClick={() => setFiltersOpen(false)}>Show results</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {CATEGORY_FILTERS.map((cat) => (
            <Button
              key={cat}
              onClick={() => {
                setActiveCat(cat);
                setPage(1);
              }}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activeCat === cat
                  ? "bg-rose-600 text-primary-foreground hover:bg-rose-700"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary-foreground/20"
              }`}
            >
              {cat}
            </Button>
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
                  <Button variant="outline" className="mt-5" onClick={resetFilters}>
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
      </div>

      <Footer />
    </div>
  );
}
