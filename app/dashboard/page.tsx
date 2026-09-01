"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/hooks/use-session";
import { getDashboardPath } from "@/lib/navigation";

export default function DashboardIndexPage() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace(getDashboardPath(session.role));
    } else {
      router.replace("/login");
    }
  }, [session, router]);

  return null;
}
