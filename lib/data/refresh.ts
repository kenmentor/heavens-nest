"use client";

import { hydrateStore } from "@/lib/data/store";

export async function refreshStore() {
  const [listingsRes, enquiriesRes, savedRes, usersRes] = await Promise.all([
    fetch("/api/listings").then((res) => res.json()),
    fetch("/api/enquiries").then((res) => res.json()),
    fetch("/api/saved").then((res) => res.json()),
    fetch("/api/users").then((res) => res.json()),
  ]);
  hydrateStore({
    listings: listingsRes.listings ?? [],
    enquiries: enquiriesRes.enquiries ?? [],
    saved: savedRes.saved ?? [],
    users: usersRes.users ?? [],
  });
}
