"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { PropertyCard } from "@/components/property-card";
import { useListings } from "@/hooks/use-store";
import { getRecentlyViewedIds, recordRecentlyViewed } from "@/lib/recently-viewed";
import type { Listing } from "@/lib/types";

export function RecentlyViewed() {
  const listings = useListings();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    // Read the persisted viewing history once on mount. localStorage is not
    // reactive, so this is a one-time hydration of external state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(getRecentlyViewedIds());
  }, []);

  const items = ids
    .map((id) => listings.find((listing) => listing.id === id))
    .filter((listing): listing is Listing => Boolean(listing))
    .slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="size-4 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight">
          Recently viewed
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((listing) => (
          <PropertyCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}

export function RecordView({ listingId }: { listingId: string }) {
  useEffect(() => {
    recordRecentlyViewed(listingId);
  }, [listingId]);

  return null;
}
