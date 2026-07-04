'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  CalendarDays, MapPin, Clock, Users, Share2, Heart, Ticket,
  Globe, Loader2, Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { apiFetch, ApiError } from "@/lib/api";
import { categoryLabel } from "@/lib/categories";
import { videoPlatformLabel } from "@/lib/video-platforms";
import {
  type EventItem,
  capacityLabel,
  formatEventDate,
  formatEventTime,
  ticketPriceLabel,
} from "@/lib/events";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiFetch(`/events/${params.id}`)
      .then((data: EventItem) => {
        if (!cancelled) setEvent(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          toast.error("Couldn't load this event", {
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
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-xl font-semibold text-foreground">Event not found</h1>
          <p className="text-sm text-muted-foreground">
            This event doesn&apos;t exist or is no longer available.
          </p>
          <Button variant="outline" onClick={() => router.push("/events")}>
            Browse other events
          </Button>
        </div>
      </div>
    );
  }

  const sameDay = formatEventDate(event.startDate) === formatEventDate(event.endDate);
  const dateLabel = sameDay
    ? formatEventDate(event.startDate)
    : `${formatEventDate(event.startDate)} – ${formatEventDate(event.endDate)}`;
  const timeLabel = `${formatEventTime(event.startDate)} – ${formatEventTime(event.endDate)}`;
  const venueLabel = event.isOnline
    ? videoPlatformLabel(event.videoPlatform)
    : event.location || "Location TBA";
  const hasTickets = event.ticketTypes.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <Navbar />

      {/* Hero */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        {event.imageUrl?.startsWith("http") ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <CalendarDays className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-foreground/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
              <div className="flex flex-wrap gap-2">
                <Badge className="border-0 bg-accent text-accent-foreground">
                  {categoryLabel(event.category)}
                </Badge>
                <Badge variant="outline">{event.isOnline ? "Online" : "In-Person"}</Badge>
                <Badge className="border-0 bg-success/10 text-success">
                  {hasTickets ? "Tickets Available" : "Free Entry"}
                </Badge>
              </div>
              <h1 className="mt-4 text-2xl font-bold text-card-foreground sm:text-3xl lg:text-4xl">
                {event.title}
              </h1>
              {event.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {event.description}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { icon: CalendarDays, label: "Date", value: dateLabel },
                  { icon: Clock, label: "Time", value: timeLabel },
                  {
                    icon: event.isOnline ? Video : MapPin,
                    label: event.isOnline ? "Platform" : "Venue",
                    value: venueLabel,
                  },
                  { icon: Users, label: "Capacity", value: `0 / ${capacityLabel(event.ticketTypes)}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-secondary/50 p-3.5">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <div className="mt-2 text-xs text-muted-foreground">{item.label}</div>
                    <div className="mt-0.5 text-sm font-semibold text-card-foreground">{item.value}</div>
                  </div>
                ))}
              </div>

              <Separator className="my-7" />

              {/* Organizer */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={event.organizer?.image ?? undefined} alt={event.organizer?.name ?? ""} />
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {event.organizer ? getInitials(event.organizer.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-card-foreground">
                    {event.organizer?.name ?? "Unknown organizer"}
                  </div>
                  <div className="text-xs text-muted-foreground">Organizer</div>
                </div>
                <Button variant="outline" size="sm">Follow</Button>
              </div>

              {event.isOnline && (event.eventLink || event.accessInstructions) && (
                <>
                  <Separator className="my-7" />
                  <h2 className="text-lg font-bold text-card-foreground">Join Details</h2>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {event.eventLink && (
                      <p>
                        Link:{" "}
                        <a
                          href={event.eventLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {event.eventLink}
                        </a>
                      </p>
                    )}
                    {event.meetingId && <p>Meeting ID: {event.meetingId}</p>}
                    {event.accessInstructions && <p>{event.accessInstructions}</p>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Ticket Card */}
              <div className="rounded-2xl border bg-card p-6 shadow-card">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Starting from</div>
                  <div className="mt-1 text-3xl font-bold text-foreground">
                    {hasTickets
                      ? ticketPriceLabel(
                          event.ticketTypes.reduce(
                            (min, t) => (Number(t.price) < Number(min) ? t.price : min),
                            event.ticketTypes[0].price,
                          ),
                        )
                      : "Free"}
                  </div>
                </div>

                {hasTickets && (
                  <div className="mt-5 space-y-3">
                    {event.ticketTypes.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between rounded-xl border p-3.5"
                      >
                        <div>
                          <div className="text-sm font-medium text-card-foreground">{ticket.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {ticket.quantity === null
                              ? "Unlimited"
                              : `${ticket.quantity.toLocaleString()} available`}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {ticketPriceLabel(ticket.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button className="mt-5 w-full gap-2" size="lg">
                  <Ticket className="h-4 w-4" />
                  Get Tickets
                </Button>

                <div className="mt-4 flex justify-center gap-4">
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Heart className="h-3.5 w-3.5" /> Save
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </button>
                  {!event.isOnline && (
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </button>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="overflow-hidden rounded-2xl border bg-secondary/50">
                <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                  {event.isOnline ? (
                    <span className="flex items-center gap-2">
                      <Video className="h-4 w-4" /> {venueLabel} · online event
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {venueLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
