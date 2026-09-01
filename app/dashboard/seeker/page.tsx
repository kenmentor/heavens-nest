"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Bookmark, Building2, CalendarDays, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/use-session";
import { useListings, useSaved } from "@/hooks/use-store";
import { getInquiriesForSeeker } from "@/lib/data/store";
import { refreshStore } from "@/lib/data/refresh";
import { formatNaira } from "@/lib/navigation";
import { listingUrl } from "@/lib/listing";

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function SeekerOverviewPage() {
  const session = useSession();
  const listings = useListings();
  const saved = useSaved();

  const myEnquiries = session ? getInquiriesForSeeker(session.id) : [];
  const mySaved = session ? saved.filter((item) => item.seekerId === session.id) : [];
  const activeListings = listings.filter((listing) => listing.status === "available");

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{session ? `, ${session.fullName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Track your enquiries and saved properties from here.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/listings" />}>Browse Properties</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Enquiries</CardTitle>
            <MessageSquareText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{myEnquiries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
            <Bookmark className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{mySaved.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Properties</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeListings.length}</p>
          </CardContent>
        </Card>
      </div>

      <div id="enquiries" className="scroll-mt-20 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Enquiries</h2>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/listings" />}>
            Find more
            <ArrowUpRight />
          </Button>
        </div>

        {myEnquiries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              You haven&apos;t made any enquiries yet. Browse available properties and send your first message.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myEnquiries.map((enquiry) => {
              const listing = listings.find((item) => item.id === enquiry.listingId);
              return (
                <Card key={enquiry.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-base">
                        {listing ? listing.type : "Unknown property"}
                        <Badge variant="secondary" className="ml-2">
                          {listing?.purpose}
                        </Badge>
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">{enquiry.date}</span>
                    </div>
                    {listing && (
                      <CardDescription className="sr-only">{listing.location}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{enquiry.message}</p>
                    {enquiry.viewingDate && (
                      <p className="mt-3 flex items-center gap-1.5 text-sm font-medium">
                        <CalendarDays className="size-4 text-primary" />
                        Proposed viewing:{" "}
                        <span className="text-foreground">{formatDate(enquiry.viewingDate)}</span>
                      </p>
                    )}
                    {listing && (
                      <div className="mt-4 border-t pt-3">
                        <Button variant="link" size="sm" nativeButton={false} className="px-0" render={<Link href={listingUrl(listing)} />}>
                          View property
                          <ArrowUpRight />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <div id="saved" className="scroll-mt-20 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Saved Properties</h2>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/listings" />}>
            Browse more
            <ArrowUpRight />
          </Button>
        </div>

        {mySaved.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              <Bookmark className="mx-auto mb-2 size-5" />
              No saved properties yet. Tap &quot;Save this property&quot; on any listing to keep it for later.
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
                      </div>
                      <p className="text-sm text-muted-foreground">{listing.location}</p>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatNaira(listing.price)}
                        {listing.purpose === "rent" && <span className="font-normal text-muted-foreground">/yr</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" nativeButton={false} render={<Link href={listingUrl(listing)} />}>
                        View property
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleUnsave(listing.id)}>
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
    </div>
  );
}
