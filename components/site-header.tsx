"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, LayoutDashboard, LogIn, LogOut, Menu, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/hooks/use-session";
import { logout } from "@/lib/session";
import { getDashboardPath } from "@/lib/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Browse Properties", href: "/listings" },
];

export function SiteHeader() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const authNav = session ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
          >
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">
                {session.fullName
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-28 truncate sm:inline">
              {session.fullName.split(" ")[0]}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span>{session.fullName}</span>
            <span className="text-muted-foreground text-xs">{session.email}</span>
            <Badge variant="secondary" className="mt-1 w-fit capitalize">
              {session.role}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={getDashboardPath(session.role)} />}>
          <LayoutDashboard />
          My Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="hidden items-center gap-2 md:flex">
      <Button
        variant="ghost"
        nativeButton={false}
        className="rounded-sm text-muted-foreground hover:text-foreground"
        render={<Link href="/login" />}
      >
        <LogIn />
        Login
      </Button>
      <Button nativeButton={false} render={<Link href="/register" />}>
        <UserPlus />
        Get Started
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition-opacity group-hover:opacity-90">
              <Building2 className="size-5" />
            </span>
            <span className="flex flex-col justify-center leading-none">
              <span className="text-base font-semibold tracking-tight">
                HavenNest
              </span>
              <span className="mt-0.5 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Rent &amp; Sales
              </span>
            </span>
          </Link>

          <nav className="hidden items-stretch md:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-16 items-center px-3 text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary transition-opacity",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <div className="hidden md:block">{authNav}</div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              }
            />
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Building2 className="size-4" />
                  </span>
                  HavenNest
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      nativeButton={false}
                      className={cn("justify-start", active && "bg-muted")}
                      onClick={() => setOpen(false)}
                      render={<Link href={item.href} />}
                    >
                      {item.label}
                    </Button>
                  );
                })}
                <div className="my-2">
                  <Separator />
                </div>
                {session ? (
                  <>
                    <div className="mb-1 px-2">
                      <p className="text-sm font-medium">{session.fullName}</p>
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {session.role}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      nativeButton={false}
                      className="justify-start"
                      onClick={() => setOpen(false)}
                      render={<Link href={getDashboardPath(session.role)} />}
                    >
                      <LayoutDashboard />
                      My Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive"
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      nativeButton={false}
                      className="justify-start"
                      onClick={() => setOpen(false)}
                      render={<Link href="/login" />}
                    >
                      <LogIn />
                      Login
                    </Button>
                    <Button
                      nativeButton={false}
                      className="justify-start"
                      onClick={() => setOpen(false)}
                      render={<Link href="/register" />}
                    >
                      <UserPlus />
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
