'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Calendar,
  LayoutDashboard,
  BarChart3,
  Plus,
  Music,
  Utensils,
  Briefcase,
  Heart,
  Palette,
  Cpu,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EVENTS = [
  {
    id: '1',
    title: 'TechConnect Summit 2026',
    category: 'Technology',
    icon: Cpu,
  },
  {
    id: '2',
    title: 'Gourmet Street Food Festival',
    category: 'Food & Drink',
    icon: Utensils,
  },
  {
    id: '3',
    title: 'Annual Corporate Networking Gala',
    category: 'Business',
    icon: Briefcase,
  },
  {
    id: '4',
    title: 'Sunrise Yoga & Wellness Retreat',
    category: 'Wellness',
    icon: Heart,
  },
  {
    id: '5',
    title: 'Electric Nights Music Festival',
    category: 'Music',
    icon: Music,
  },
  {
    id: '6',
    title: 'Modern Art Exhibition Opening',
    category: 'Arts & Culture',
    icon: Palette,
  },
];

const CATEGORIES = [
  { name: 'Technology', icon: Cpu },
  { name: 'Music', icon: Music },
  { name: 'Food & Drink', icon: Utensils },
  { name: 'Business', icon: Briefcase },
  { name: 'Wellness', icon: Heart },
  { name: 'Arts & Culture', icon: Palette },
];

const RECENT = [
  'Music festivals near me',
  'Tech conferences 2026',
  'Free events this weekend',
];

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search events, categories, or pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Recent Searches">
          {RECENT.map((q) => (
            <CommandItem key={q} value={`recent ${q}`}>
              <Clock className="text-muted-foreground" />
              <span>{q}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Events">
          {EVENTS.map((event) => (
            <CommandItem
              key={event.id}
              value={`event ${event.title} ${event.category}`}
              onSelect={() => run(() => router.push(`/event/${event.id}`))}
            >
              <event.icon className="text-muted-foreground" />
              <div className="flex flex-1 flex-col">
                <span>{event.title}</span>
                <span className="text-xs text-muted-foreground">
                  {event.category}
                </span>
              </div>
              <TrendingUp className="text-muted-foreground" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Browse Categories">
          {CATEGORIES.map((cat) => (
            <CommandItem
              key={cat.name}
              value={`category ${cat.name}`}
              onSelect={() => run(() => router.push('/'))}
            >
              <cat.icon className="text-muted-foreground" />
              <span>{cat.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => run(() => router.push('/create-event'))}>
            <Plus className="text-muted-foreground" />
            <span>Create new event</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push('/dashboard'))}>
            <LayoutDashboard className="text-muted-foreground" />
            <span>Go to Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push('/analytics'))}>
            <BarChart3 className="text-muted-foreground" />
            <span>View Analytics</span>
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push('/'))}>
            <Calendar className="text-muted-foreground" />
            <span>Browse all events</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useSearchCommand() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}
