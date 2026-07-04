'use client';

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  CalendarDays, MapPin, Image as ImageIcon, Type, Globe, Lock,
  DollarSign, Upload, Plus, Trash2, ChevronRight, Video, Link2, Key, Loader2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { apiFetch, uploadImage, ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { CATEGORY_OPTIONS } from "@/lib/categories";
import { VIDEO_PLATFORM_OPTIONS } from "@/lib/video-platforms";

const LocationPicker = lazy(() =>
  import("@/components/location-picker").then((m) => ({ default: m.LocationPicker })),
);

interface TicketTypeForm {
  id: string;
  name: string;
  price: string;
  quantity: string;
  salesEndDate: string;
}

function newTicketType(name = ""): TicketTypeForm {
  return {
    id: crypto.randomUUID(),
    name,
    price: "",
    quantity: "",
    salesEndDate: "",
  };
}

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.replace("/auth?redirect=/create-event");
    }
  }, [isSessionPending, session, router]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState("");
  const [videoPlatform, setVideoPlatform] = useState<string>("zoom");
  const [eventLink, setEventLink] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [accessInstructions, setAccessInstructions] = useState("");

  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    newTicketType("General Admission"),
    newTicketType("VIP Pass"),
  ]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTicketType = () =>
    setTicketTypes((prev) => [...prev, newTicketType()]);

  const removeTicketType = (id: string) =>
    setTicketTypes((prev) => prev.filter((t) => t.id !== id));

  const updateTicketType = (id: string, patch: Partial<TicketTypeForm>) =>
    setTicketTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Add a title", { description: "Your event needs a title." });
      return;
    }
    if (!category) {
      toast.error("Pick a category", { description: "Choose a category for your event." });
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Add dates", { description: "Set a start and end date & time." });
      return;
    }
    if (!isOnline && !location.trim()) {
      toast.error("Add a location", { description: "In-person events need a venue or address." });
      return;
    }
    if (isOnline && !eventLink.trim()) {
      toast.error("Add an event link", { description: "Online events need a link to join." });
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrl = imageFile ? await uploadImage(imageFile) : undefined;

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        visibility,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isOnline,
        location: isOnline ? undefined : location.trim(),
        videoPlatform: isOnline ? videoPlatform : undefined,
        eventLink: isOnline ? eventLink.trim() : undefined,
        meetingId: isOnline ? meetingId.trim() || undefined : undefined,
        passcode: isOnline ? passcode.trim() || undefined : undefined,
        accessInstructions: isOnline ? accessInstructions.trim() || undefined : undefined,
        imageUrl,
        ticketTypes: ticketTypes
          .filter((t) => t.name.trim())
          .map((t) => ({
            name: t.name.trim(),
            price: Number(t.price) || 0,
            quantity: t.quantity.trim() ? Number(t.quantity) : undefined,
            salesEndDate: t.salesEndDate
              ? new Date(t.salesEndDate).toISOString()
              : undefined,
          })),
      };

      await apiFetch("/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Event published", { description: "Your event is live." });
      router.push("/");
    } catch (err) {
      toast.error("Could not publish event", {
        description: err instanceof ApiError ? err.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionPending || !session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <span className="font-medium text-primary">Basic Info</span>
          <ChevronRight className="h-3 w-3" />
          <span>Date & Location</span>
          <ChevronRight className="h-3 w-3" />
          <span>Tickets</span>
          <ChevronRight className="h-3 w-3" />
          <span>Review</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Create New Event</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in the details to publish your event.</p>

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          {/* Cover Image */}
          <div className="overflow-hidden rounded-2xl border-2 border-dashed bg-secondary/30 transition-colors hover:border-primary/30">
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                {imageFile ? imageFile.name : "Upload cover image"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, or GIF up to 5MB. Recommended: 1920×1080</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="mt-4 gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                {imageFile ? "Change File" : "Choose File"}
              </Button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="text-base font-semibold text-card-foreground flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              Basic Information
            </h2>
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Event Title</Label>
                <Input
                  placeholder="Give your event a clear, catchy title"
                  className="h-11 rounded-xl"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what attendees can expect..."
                  className="min-h-32 rounded-xl"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <select
                    className="flex h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Visibility</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibility("public")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium ${
                        visibility === "public"
                          ? "border-slate-400 bg-primary/5 text-primary"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <Globe className="h-4 w-4" /> Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility("private")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium ${
                        visibility === "private"
                          ? "border-slate-400 bg-primary/5 text-primary"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <Lock className="h-4 w-4" /> Private
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Location */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="text-base font-semibold text-card-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Date & Location
            </h2>
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    className="h-11 rounded-xl"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    className="h-11 rounded-xl"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-secondary/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Video className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="online" className="text-sm font-medium text-foreground cursor-pointer">
                      Online event
                    </Label>
                    <p className="text-xs text-muted-foreground">Host this event virtually instead of in-person.</p>
                  </div>
                </div>
                <Switch id="online" checked={isOnline} onCheckedChange={setIsOnline} />
              </div>

              {!isOnline ? (
                <Suspense
                  fallback={
                    <div className="space-y-1.5">
                      <Label>Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search for a venue or enter address" className="h-11 rounded-xl pl-10" />
                      </div>
                      <div className="flex h-80 items-center justify-center rounded-xl border bg-secondary/30">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  }
                >
                  <LocationPicker value={location} onChange={(addr) => setLocation(addr)} />
                </Suspense>
              ) : (
                <div className="space-y-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Virtual Event Details</h3>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Platform</Label>
                    <select
                      className="flex h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      value={videoPlatform}
                      onChange={(e) => setVideoPlatform(e.target.value)}
                    >
                      {VIDEO_PLATFORM_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Event Link</Label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://zoom.us/j/123456789"
                        className="h-11 rounded-xl pl-10"
                        value={eventLink}
                        onChange={(e) => setEventLink(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Attendees will receive this link after registering.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Meeting ID (optional)</Label>
                      <Input
                        placeholder="123 456 7890"
                        className="h-11 rounded-xl"
                        value={meetingId}
                        onChange={(e) => setMeetingId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Passcode (optional)</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="••••••"
                          className="h-11 rounded-xl pl-10"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Access Instructions (optional)</Label>
                    <Textarea
                      placeholder="Any extra info attendees need to join (waiting room, dial-in, dress code, etc.)"
                      className="min-h-20 rounded-xl"
                      value={accessInstructions}
                      onChange={(e) => setAccessInstructions(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tickets */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="text-base font-semibold text-card-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Tickets
            </h2>
            <div className="mt-5 space-y-4">
              {ticketTypes.map((ticket) => (
                <div key={ticket.id} className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Input
                      placeholder="Ticket name (e.g. General Admission)"
                      className="h-9 rounded-lg text-sm font-medium"
                      value={ticket.name}
                      onChange={(e) => updateTicketType(ticket.id, { name: e.target.value })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="h-7 w-7 shrink-0 text-destructive"
                      onClick={() => removeTicketType(ticket.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 rounded-lg text-sm"
                        value={ticket.price}
                        onChange={(e) => updateTicketType(ticket.id, { price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Unlimited"
                        className="h-9 rounded-lg text-sm"
                        value={ticket.quantity}
                        onChange={(e) => updateTicketType(ticket.id, { quantity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sales End</Label>
                      <Input
                        type="date"
                        className="h-9 rounded-lg text-sm"
                        value={ticket.salesEndDate}
                        onChange={(e) => updateTicketType(ticket.id, { salesEndDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full gap-1.5" type="button" onClick={addTicketType}>
                <Plus className="h-4 w-4" />
                Add Ticket Type
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" size="lg" type="button" className="rounded-xl px-8 py-5">Save as Draft</Button>
            <Button size="lg" type="submit" className="gap-2 rounded-xl bg-rose-600 px-8 py-5 hover:bg-rose-700" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Publishing..." : "Publish Event"}
              {!isSubmitting && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
