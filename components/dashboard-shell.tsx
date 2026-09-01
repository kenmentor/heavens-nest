"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Building2, ExternalLink, LogOut } from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDashboardPath } from "@/lib/navigation";
import { useSession } from "@/hooks/use-session";
import { logout } from "@/lib/session";
import type { LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

function SidebarNav({ navGroups }: { navGroups: DashboardNavGroup[] }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = pathname + (search?.toString() ? `?${search}` : "");

  const isActive = (item: DashboardNavItem) => {
    if (item.href.includes("#")) return false;
    if (current === item.href) return true;
    const exact = item.href.split("?")[0];
    const sectionRoots = ["/dashboard/owner", "/dashboard/seeker", "/admin"];
    if (sectionRoots.includes(exact)) return false;
    return pathname.startsWith(exact);
  };

  return (
    <SidebarContent>
      {navGroups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item)}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}

export function DashboardShell({
  children,
  navGroups,
}: {
  children: React.ReactNode;
  navGroups: DashboardNavGroup[];
}) {
  const session = useSession();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={
                  <Link href="/">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Building2 className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">HavenNest</span>
                      <span className="text-xs text-muted-foreground">Dashboard</span>
                    </div>
                  </Link>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <Suspense fallback={null}>
          <SidebarNav navGroups={navGroups} />
        </Suspense>
        <SidebarFooter>
          <SidebarMenu>
            {session && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  render={
                    <Link href={getDashboardPath(session.role)}>
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {session.fullName
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                        <span className="truncate text-sm font-semibold">
                          {session.fullName}
                        </span>
                        <span className="truncate text-xs capitalize text-muted-foreground">
                          {session.role}
                        </span>
                      </div>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/listings" />}>
                <ExternalLink />
                <span>View Public Site</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Log out">
                <LogOut />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex flex-1 items-center gap-2">
            {session && (
              <span className="capitalize text-sm text-muted-foreground">
                {session.role} dashboard
              </span>
            )}
          </div>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
