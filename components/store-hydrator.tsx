"use client";

import { useEffect } from "react";
import { hydrateStore } from "@/lib/data/store";

export function StoreHydrator() {
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/listings").then((res) => res.json()),
      fetch("/api/enquiries").then((res) => res.json()),
      fetch("/api/saved").then((res) => res.json()),
      fetch("/api/users").then((res) => res.json()),
    ])
      .then(([listingsRes, enquiriesRes, savedRes, usersRes]) => {
        if (cancelled) return;
        hydrateStore({
          listings: listingsRes.listings ?? [],
          enquiries: enquiriesRes.enquiries ?? [],
          saved: savedRes.saved ?? [],
          users: usersRes.users ?? [],
        });
      })
      .catch((error) => {
        console.error("Failed to hydrate store from API:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
