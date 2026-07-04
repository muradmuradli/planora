import { CalendarDays } from "lucide-react";
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <CalendarDays className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Eventify</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The modern platform for creating, discovering, and managing unforgettable events.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Browse Events</Link></li>
              <li><Link href="/create-event" className="hover:text-foreground">Create Event</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/analytics" className="hover:text-foreground">Analytics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
              <li><Link href="/community" className="hover:text-foreground">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © 2026 Eventify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
