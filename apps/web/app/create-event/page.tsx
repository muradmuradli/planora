'use client';

import { lazy, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  CalendarDays, MapPin, Image, Type, Globe, Lock,
  DollarSign, Upload, Plus, Trash2, ChevronRight, Video, Link2, Key, Loader2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const LocationPicker = lazy(() =>
  import("@/components/location-picker").then((m) => ({ default: m.LocationPicker })),
);

export default function CreateEventPage() {
  const [isOnline, setIsOnline] = useState(false);
  const [, setLocation] = useState("");

  return (
    <div className="min-h-screen bg-background">
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

        <form className="mt-8 space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Cover Image */}
          <div className="overflow-hidden rounded-2xl border-2 border-dashed bg-secondary/30 transition-colors hover:border-primary/30">
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Upload cover image</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, or GIF up to 5MB. Recommended: 1920×1080</p>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5">
                <Image className="h-3.5 w-3.5" />
                Choose File
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
                <Input placeholder="Give your event a clear, catchy title" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea placeholder="Describe what attendees can expect..." className="min-h-32 rounded-xl" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <select className="flex h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Select category</option>
                    <option>Technology</option>
                    <option>Music</option>
                    <option>Food & Drink</option>
                    <option>Business</option>
                    <option>Wellness</option>
                    <option>Arts & Culture</option>
                    <option>Sports</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Visibility</Label>
                  <div className="flex gap-2">
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary/5 p-3 text-sm font-medium text-primary">
                      <Globe className="h-4 w-4" /> Public
                    </button>
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium text-muted-foreground hover:bg-secondary">
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
                  <Input type="datetime-local" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date & Time</Label>
                  <Input type="datetime-local" className="h-11 rounded-xl" />
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
                      <div className="flex h-[320px] items-center justify-center rounded-xl border bg-secondary/30">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  }
                >
                  <LocationPicker value="" onChange={(addr) => setLocation(addr)} />
                </Suspense>
              ) : (
                <div className="space-y-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Virtual Event Details</h3>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Platform</Label>
                    <select className="flex h-11 w-full rounded-xl border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Zoom</option>
                      <option>Google Meet</option>
                      <option>Microsoft Teams</option>
                      <option>YouTube Live</option>
                      <option>Twitch</option>
                      <option>Custom / Other</option>
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
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Attendees will receive this link after registering.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Meeting ID (optional)</Label>
                      <Input placeholder="123 456 7890" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Passcode (optional)</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="••••••" className="h-11 rounded-xl pl-10" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Access Instructions (optional)</Label>
                    <Textarea
                      placeholder="Any extra info attendees need to join (waiting room, dial-in, dress code, etc.)"
                      className="min-h-20 rounded-xl"
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
              {/* Ticket type 1 */}
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">General Admission</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Price</Label>
                    <Input placeholder="$0.00" className="h-9 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Quantity</Label>
                    <Input placeholder="Unlimited" className="h-9 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Sales End</Label>
                    <Input type="date" className="h-9 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              {/* Ticket type 2 */}
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">VIP Pass</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Price</Label>
                    <Input placeholder="$0.00" className="h-9 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Quantity</Label>
                    <Input placeholder="Unlimited" className="h-9 rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Sales End</Label>
                    <Input type="date" className="h-9 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full gap-1.5" type="button">
                <Plus className="h-4 w-4" />
                Add Ticket Type
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" size="lg" className="rounded-xl">Save as Draft</Button>
            <Button size="lg" className="gap-2 rounded-xl">
              Publish Event
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
