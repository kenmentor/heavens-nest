"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, CircleDollarSign, MessageSquareText, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PropertyCard } from "@/components/property-card";
import { useSession } from "@/hooks/use-session";
import { useListings } from "@/hooks/use-store";
import { getListingsByOwner, getEnquiriesByOwner } from "@/lib/data/store";
import { formatNaira } from "@/lib/navigation";

export default function OwnerOverviewPage() {
  const session = useSession();
  const listings = useListings();

  const myListings = session ? getListingsByOwner(session.id) : [];
  const myEnquiries = session ? getEnquiriesByOwner(session.id) : [];
  const available = myListings.filter((listing) => listing.status === "available");
  const activeListings = myListings.filter(
    (listing) => listing.status === "available" && listing.purpose === "rent"
  );
  const rentValue = activeListings.reduce((sum, listing) => sum + listing.price, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back{session ? `, ${session.fullName.split(" ")[0]}` : ""}</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your properties.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/owner/listings/new" />}>Add New Listing</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Listings</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{myListings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <PackageCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{available.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enquiries</CardTitle>
            <MessageSquareText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{myEnquiries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rent Value / Year</CardTitle>
            <CircleDollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNaira(rentValue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Properties</h2>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/owner/listings" />}>
            View all
            <ArrowUpRight />
          </Button>
        </div>

        {myListings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              You have no listings yet. Add your first property to start receiving enquiries.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myListings.slice(0, 3).map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
            {myListings.length > 3 && (
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(myListings.length, 3)} of {myListings.length} listings.
              </p>
            )}
          </>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Enquiries</h2>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/owner/inquiries" />}>
            View all
            <ArrowUpRight />
          </Button>
        </div>
        {myEnquiries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              No enquiries yet. When seekers message you about your listings, they&apos;ll appear here.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myEnquiries.slice(0, 4).map((enquiry) => {
              const listing = listings.find((item) => item.id === enquiry.listingId);
              return (
                <Card key={enquiry.id}>
                  <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{enquiry.message}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {listing ? listing.type : "Unknown listing"} · {listing?.location}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{enquiry.date}</span>
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
