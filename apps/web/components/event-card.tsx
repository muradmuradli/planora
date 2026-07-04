import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "@/lib/categories";

interface EventCardProps {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  imageUrl: string | null;
  category: string;
  price: string;
  attendees: number;
}

export function EventCard({
  id,
  title,
  dateLabel,
  location,
  imageUrl,
  category,
  price,
  attendees,
}: EventCardProps) {
  return (
    <Link
      href={`/event/${id}`}
      className="group block overflow-hidden rounded-2xl border bg-card shadow-card transition-all hover:shadow-card-hover"
    >
      <div className="relative h-44 w-full overflow-hidden bg-secondary">
        {imageUrl?.startsWith("http") ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute left-3 top-3 border-0 bg-card/90 text-card-foreground backdrop-blur">
          {price}
        </Badge>
      </div>
      <div className="p-4">
        <Badge className="border-0 bg-accent text-accent-foreground">
          {categoryLabel(category)}
        </Badge>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-card-foreground">
          {title}
        </h3>
        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{attendees.toLocaleString()} attending</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
