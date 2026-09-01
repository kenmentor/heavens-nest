"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, House, MessageSquareText, Settings } from "lucide-react";

import { DashboardShell, type DashboardNavGroup } from "@/components/dashboard-shell";
import { useSession } from "@/hooks/use-session";

const adminNav: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Overview", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Management",
    items: [
      { title: "Users", href: "/admin?tab=users", icon: Users },
      { title: "Listings", href: "/admin?tab=listings", icon: House },
      { title: "Enquiries", href: "/admin?tab=enquiries", icon: MessageSquareText },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    } else if (session.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [session, router]);

  if (!session || session.role !== "admin") {
    return null;
  }

  return (
    <DashboardShell navGroups={adminNav}>
      {children}
    </DashboardShell>
  );
}
