"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { House, LayoutDashboard, ListPlus, MessageSquareText, ClipboardList, Bookmark, Settings } from "lucide-react";

import { DashboardShell, type DashboardNavGroup } from "@/components/dashboard-shell";
import { useSession } from "@/hooks/use-session";

const ownerNav: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Overview", href: "/dashboard/owner", icon: LayoutDashboard }],
  },
  {
    label: "Properties",
    items: [
      { title: "My Listings", href: "/dashboard/owner/listings", icon: House },
      { title: "Add New Listing", href: "/dashboard/owner/listings/new", icon: ListPlus },
    ],
  },
  {
    label: "Communication",
    items: [{ title: "Enquiries", href: "/dashboard/owner/inquiries", icon: MessageSquareText }],
  },
  {
    label: "Account",
    items: [{ title: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

const seekerNav: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Overview", href: "/dashboard/seeker", icon: LayoutDashboard }],
  },
  {
    label: "Properties",
    items: [
      { title: "My Enquiries", href: "/dashboard/seeker#enquiries", icon: ClipboardList },
      { title: "Saved Properties", href: "/dashboard/seeker/saved", icon: Bookmark },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  const navGroups = session.role === "owner" ? ownerNav : seekerNav;

  return (
    <DashboardShell navGroups={navGroups}>
      {children}
    </DashboardShell>
  );
}
