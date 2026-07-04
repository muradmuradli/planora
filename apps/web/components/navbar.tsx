import { Button } from "@/components/ui/button";
import { CalendarDays, Menu, X, Search, Bell, Plus, User, Settings, LogOut, Ticket, CalendarCheck, LayoutDashboard, LifeBuoy } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchCommand, useSearchCommand } from "@/components/search-command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Logo from "./logo";
import { authClient } from "@/lib/auth-client";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open: searchOpen, setOpen: setSearchOpen } = useSearchCommand();
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const createEventHref = user ? "/create-event" : "/auth?redirect=/create-event";

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link href="/events" className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Browse Events
          </Link>
          <Link href="/dashboard" className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/analytics" className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Analytics
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border bg-secondary/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search...</span>
            <kbd className="hidden lg:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
          <Link href={createEventHref}>
            <Button className="gap-1.5 bg-rose-600 hover:bg-rose-700">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>

          {isPending ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full p-0.5 pr-3 transition-colors hover:bg-secondary"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-foreground lg:inline">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                  <span className="text-sm font-semibold">{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="text-muted-foreground" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="text-muted-foreground" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Ticket className="text-muted-foreground" />
                    My Tickets
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <CalendarCheck className="text-muted-foreground" />
                    My RSVPs
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="text-muted-foreground" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <LifeBuoy className="text-muted-foreground" />
                    Help & Support
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="text-destructive" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="outline" className="rounded-lg">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background p-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/events" className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMobileOpen(false)}>
              Browse Events
            </Link>
            <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
            <Link href="/analytics" className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMobileOpen(false)}>
              Analytics
            </Link>
            <div className="mt-2 border-t pt-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 pb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image ?? undefined} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Profile
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    My Tickets
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </button>
                  <Link href="/create-event" className="mt-2 block" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full gap-1.5 bg-rose-500 hover:bg-rose-600">
                      <Plus className="h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                  <button
                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth" className="block" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href={createEventHref} className="mt-2 block" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full gap-1.5 bg-rose-500 hover:bg-rose-600">
                      <Plus className="h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
}
