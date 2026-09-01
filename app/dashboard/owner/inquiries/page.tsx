"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useListings } from "@/hooks/use-store";
import { getEnquiriesByOwner, getUsers } from "@/lib/data/store";

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function OwnerEnquiriesPage() {
  const session = useSession();
  const listings = useListings();

  const myEnquiries = session ? getEnquiriesByOwner(session.id) : [];
  const users = getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enquiries</h1>
        <p className="text-sm text-muted-foreground">
          Messages from property seekers about your listings.
        </p>
      </div>

      {myEnquiries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No enquiries yet. Share your listings with seekers to start receiving messages.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {myEnquiries.map((enquiry) => {
            const listing = listings.find((item) => item.id === enquiry.listingId);
            const seeker = users.find((user) => user.id === enquiry.seekerId);
            return (
              <Card key={enquiry.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      {seeker ? seeker.fullName : "Seeker"}
                      <Badge variant="secondary" className="ml-2 capitalize">
                        {seeker?.role ?? "seeker"}
                      </Badge>
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">{enquiry.date}</span>
                  </div>
                  <CardDescription>
                    {listing ? (
                      <>
                        Re: <span className="font-medium text-foreground">{listing.type}</span> · {listing.location}
                      </>
                    ) : (
                      "Listing no longer available"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{enquiry.message}</p>
                  {enquiry.viewingDate && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm font-medium">
                      <CalendarDays className="size-4 text-primary" />
                      Suggested viewing:{" "}
                      <span className="text-foreground">
                        {formatDate(enquiry.viewingDate)}
                      </span>
                    </p>
                  )}
                  {seeker && (
                    <div className="mt-4 flex flex-wrap gap-4 border-t pt-3 text-xs text-muted-foreground">
                      <span>Email: {seeker.email}</span>
                      <span>Phone: {seeker.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
