"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark, HeartOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { useListings, useSaved } from "@/hooks/use-store";
import { refreshStore } from "@/lib/data/refresh";
import { formatNaira } from "@/lib/navigation";
import { listingUrl } from "@/lib/listing";

export default function SavedPropertiesPage() {
  const session = useSession();
  const listings = useListings();
  const saved = useSaved();

  const mySaved = session ? saved.filter((item) => item.seekerId === session.id) : [];

  const handleUnsave = async (listingId: string) => {
    if (!session) return;
    try {
      await fetch(
        `/api/saved?seekerId=${encodeURIComponent(session.id)}&listingId=${encodeURIComponent(listingId)}`,
        { method: "DELETE" }
      );
      await refreshStore();
    } catch {
      // keep the list as-is if removal fails
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved Properties</h1>
        <p className="text-sm text-muted-foreground">
          Properties you have bookmarked for later.
        </p>
      </div>

      {mySaved.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
            <Bookmark className="size-6" />
            <p>No saved properties yet.</p>
            <p>Tap the heart on any listing card to keep it here for later.</p>
            <Button variant="outline" size="sm" className="mt-2" nativeButton={false} render={<Link href="/listings" />}>
              Browse properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mySaved.map((item) => {
            const listing = listings.find((entry) => entry.id === item.listingId);
            if (!listing) return null;
            return (
              <Card key={item.id}>
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  {listing.images[0] && (
                    <Image
                      src={listing.images[0]}
                      alt={listing.type}
                      width={112}
                      height={80}
                      className="h-20 w-28 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-40 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{listing.type}</p>
                      <Badge variant="secondary">{listing.purpose}</Badge>
                      <Badge
                        variant={listing.status === "available" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {listing.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{listing.location}</p>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {formatNaira(listing.price)}
                      {listing.purpose === "rent" && (
                        <span className="font-normal text-muted-foreground">/yr</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" nativeButton={false} render={<Link href={listingUrl(listing)} />}>
                      View property
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleUnsave(listing.id)}>
                      <HeartOff />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
