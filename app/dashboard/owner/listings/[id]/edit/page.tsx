"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingForm } from "@/components/listing-form";
import { useListings } from "@/hooks/use-store";

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const listings = useListings();
  const listing = listings.find((item) => item.id === params.id);

  if (!listing) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" nativeButton={false} className="-ml-3 text-muted-foreground" render={<Link href="/dashboard/owner/listings" />}>
          <ArrowLeft />
          Back to My Listings
        </Button>
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            Listing not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Listing</h1>
          <p className="text-sm text-muted-foreground">Update the details of your property.</p>
        </div>
        <Button variant="ghost" nativeButton={false} className="text-muted-foreground" render={<Link href="/dashboard/owner/listings" />}>
          <ArrowLeft />
          Back
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{listing.type}</CardTitle>
          <CardDescription>{listing.location}</CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm listing={listing} />
        </CardContent>
      </Card>
    </div>
  );
}
