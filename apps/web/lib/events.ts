export interface TicketTypeItem {
  id: string;
  name: string;
  price: string;
  quantity: number | null;
  salesEndDate: string | null;
}

export interface EventOrganizer {
  id: string;
  name: string;
  image: string | null;
}

export interface EventItem {
  id: string;
  organizerId: string;
  title: string;
  description: string | null;
  category: string;
  visibility: "public" | "private";
  startDate: string;
  endDate: string;
  isOnline: boolean;
  location: string | null;
  videoPlatform: string | null;
  eventLink: string | null;
  meetingId: string | null;
  passcode: string | null;
  accessInstructions: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  ticketTypes: TicketTypeItem[];
  organizer?: EventOrganizer;
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatEventDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatEventTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function eventLocationLabel(
  event: Pick<EventItem, "isOnline" | "location">,
): string {
  if (event.isOnline) return "Online";
  return event.location?.trim() || "Location TBA";
}

export function startingPriceLabel(ticketTypes: TicketTypeItem[]): string {
  if (ticketTypes.length === 0) return "Free";
  const prices = ticketTypes.map((t) => Number(t.price));
  const min = Math.min(...prices);
  if (min <= 0) return "Free";
  return Number.isInteger(min) ? `$${min}` : `$${min.toFixed(2)}`;
}

export function capacityLabel(ticketTypes: TicketTypeItem[]): string {
  if (ticketTypes.length === 0) return "Unlimited";
  if (ticketTypes.some((t) => t.quantity === null)) return "Unlimited";
  const total = ticketTypes.reduce((sum, t) => sum + (t.quantity ?? 0), 0);
  return total.toLocaleString();
}

export function ticketPriceLabel(price: string): string {
  const value = Number(price);
  if (value <= 0) return "Free";
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}
